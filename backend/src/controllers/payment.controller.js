import crypto from "node:crypto";
import { env } from "../config/env.js";
import { pool } from "../config/database.js";
import { read as readSettings } from "../services/storeSettings.service.js";
import { releaseOrderReservations } from "../services/order.service.js";

const cashfreeBase = () =>
  env.cashfree.environment === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
const cashfreeIsEnabled = async () => {
  if (!env.cashfree.enabled) return false;
  const settings = await readSettings(pool, true);
  return settings.payments?.enabled !== "false";
};

export async function paymentMethods(req, res, next) {
  try {
    const cashfree = await cashfreeIsEnabled();
    res.json({
      data: {
        cod: true,
        online: cashfree,
        provider: cashfree ? "cashfree" : null,
        cashfreeMode: cashfree ? env.cashfree.environment : null,
        razorpayKeyId: null,
      },
    });
  } catch (error) {
    next(error);
  }
}

const unavailable = () => {
  const error = new Error("Online payment is not available yet.");
  error.statusCode = 503;
  error.code = "CASHFREE_UNAVAILABLE";
  return error;
};

export async function createCashfreeOrder(req, res, next) {
  try {
    if (!(await cashfreeIsEnabled())) throw unavailable();
    const { orderNumber, customer } = req.body || {};
    if (!orderNumber) {
      const error = new Error("An internal order number is required.");
      error.statusCode = 400;
      error.code = "ORDER_NUMBER_REQUIRED";
      throw error;
    }
    const [[order]] = await pool.execute(
      "SELECT id,order_number,customer_email,customer_phone,grand_total,currency FROM orders WHERE order_number=? LIMIT 1",
      [orderNumber],
    );
    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      error.code = "ORDER_NOT_FOUND";
      throw error;
    }
    const response = await fetch(`${cashfreeBase()}/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-version": env.cashfree.apiVersion,
        "x-client-id": env.cashfree.clientId,
        "x-client-secret": env.cashfree.clientSecret,
        "x-idempotency-key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        order_id: order.order_number,
        order_amount: Number(order.grand_total),
        order_currency: order.currency || "INR",
        customer_details: {
          customer_id: String(customer?.id || `guest_${order.id}`),
          customer_email: customer?.email || order.customer_email,
          customer_phone: customer?.phone || order.customer_phone,
        },
        order_meta: {
          return_url: `${process.env.STOREFRONT_URL || "http://localhost:5173"}/order-success?order=${encodeURIComponent(order.order_number)}`,
          notify_url: `${process.env.PUBLIC_API_URL || "http://localhost:4000"}/api/v1/webhooks/cashfree`,
        },
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.payment_session_id) {
      const error = new Error(
        payload.message || "Cashfree order creation failed.",
      );
      error.statusCode =
        response.status >= 400 && response.status < 500 ? 502 : 503;
      error.code = "CASHFREE_ORDER_FAILED";
      throw error;
    }
    await pool.execute(
      "INSERT INTO payments(order_id,provider,payment_method,provider_order_id,amount,currency,status) VALUES(?,?,?,?,?,?,'created') ON DUPLICATE KEY UPDATE provider_order_id=VALUES(provider_order_id),amount=VALUES(amount),status='created'",
      [
        order.id,
        "cashfree",
        "online",
        order.order_number,
        order.grand_total,
        order.currency || "INR",
      ],
    );
    res.json({
      data: {
        provider: "cashfree",
        cashfreeMode: env.cashfree.environment,
        orderId: order.order_number,
        paymentSessionId: payload.payment_session_id,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function cashfreeWebhook(req, res, next) {
  try {
    const signature = req.get("x-webhook-signature") || "";
    const timestamp = req.get("x-webhook-timestamp") || "";
    const expected = crypto
      .createHmac("sha256", env.cashfree.webhookSecret)
      .update(`${timestamp}${req.rawBody}`)
      .digest("base64");
    if (
      !signature ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    )
      return res.status(400).json({
        error: {
          code: "INVALID_WEBHOOK_SIGNATURE",
          message: "Invalid webhook signature.",
        },
      });
    const event = req.body || {};
    const orderNumber =
      event.data?.order?.order_id ||
      event.data?.order?.order_tags?.internal_order_number;
    const payment = event.data?.payment || {};
    if (orderNumber) {
      const status = String(payment.payment_status || "").toUpperCase();
      const paymentStatus =
        status === "SUCCESS" ? "paid" : status === "FAILED" ? "failed" : null;
      if (paymentStatus) {
        const [[order]] = await pool.execute(
          "SELECT id FROM orders WHERE order_number=?",
          [orderNumber],
        );
        if (order) {
          const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();
            const [[lockedOrder]] = await connection.execute(
              "SELECT id,status,payment_status FROM orders WHERE id=? FOR UPDATE",
              [order.id],
            );
            if (lockedOrder?.payment_status === "pending") {
              const nextOrderStatus =
                paymentStatus === "paid"
                  ? lockedOrder.status === "pending"
                    ? "confirmed"
                    : lockedOrder.status
                  : "cancelled";
              await connection.execute(
                "UPDATE orders SET payment_status=?,status=?,cancelled_at=IF(?='cancelled',NOW(),cancelled_at) WHERE id=? AND payment_status NOT IN ('paid','refunded')",
                [paymentStatus, nextOrderStatus, nextOrderStatus, order.id],
              );
              await connection.execute(
                "UPDATE payments SET provider_payment_id=?,status=?,captured_at=IF(?='paid',NOW(),captured_at),failed_at=IF(?='failed',NOW(),failed_at) WHERE order_id=? AND provider='cashfree'",
                [
                  payment.cf_payment_id || null,
                  paymentStatus === "paid" ? "captured" : "failed",
                  paymentStatus,
                  paymentStatus,
                  order.id,
                ],
              );
              await connection.execute(
                "INSERT INTO order_status_history(order_id,status,note) VALUES(?,?,?)",
                [
                  order.id,
                  nextOrderStatus,
                  paymentStatus === "paid"
                    ? "Online payment confirmed."
                    : "Online payment failed; reservation released.",
                ],
              );
              if (paymentStatus === "failed")
                await releaseOrderReservations(
                  pool,
                  order.id,
                  "Online payment failed",
                  connection,
                );
            }
            await connection.commit();
          } catch (error) {
            await connection.rollback();
            throw error;
          } finally {
            connection.release();
          }
        }
      }
    }
    res.json({ data: { received: true } });
  } catch (error) {
    next(error);
  }
}

export function paymentMethodsLegacy(req, res) {
  res.json({
    data: {
      cod: true,
      online: env.razorpay.enabled,
      razorpayKeyId: env.razorpay.enabled ? env.razorpay.keyId : null,
    },
  });
}
export async function createRazorpayOrder(req, res, next) {
  try {
    if (!env.razorpay.enabled) {
      const e = new Error("Online payment is not available yet.");
      e.statusCode = 503;
      e.code = "RAZORPAY_UNAVAILABLE";
      throw e;
    }
    const e = new Error(
      "Razorpay order initialization requires configured production credentials.",
    );
    e.statusCode = 501;
    e.code = "RAZORPAY_NOT_CONFIGURED";
    throw e;
  } catch (e) {
    next(e);
  }
}
export async function verifyRazorpay(req, res, next) {
  try {
    if (!env.razorpay.enabled) {
      const e = new Error("Online payment is not available yet.");
      e.statusCode = 503;
      e.code = "RAZORPAY_UNAVAILABLE";
      throw e;
    }
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body || {};
    if (!orderId || !paymentId || !signature) {
      const e = new Error("Invalid payment verification request.");
      e.statusCode = 400;
      e.code = "PAYMENT_VERIFICATION_FAILED";
      throw e;
    }
    const expected = crypto
      .createHmac("sha256", env.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    if (
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      const e = new Error("Payment verification failed.");
      e.statusCode = 400;
      e.code = "PAYMENT_VERIFICATION_FAILED";
      throw e;
    }
    res.json({ data: { verified: true } });
  } catch (e) {
    next(e);
  }
}
export function webhook(req, res, next) {
  try {
    if (!env.razorpay.enabled)
      return res.status(503).json({
        error: {
          code: "RAZORPAY_UNAVAILABLE",
          message: "Online payment is not available yet.",
        },
      });
    const signature = req.get("x-razorpay-signature") || "";
    const raw = req.rawBody;
    const expected = crypto
      .createHmac("sha256", env.razorpay.webhookSecret)
      .update(raw)
      .digest("hex");
    if (
      !signature ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    )
      return res.status(400).json({
        error: {
          code: "INVALID_WEBHOOK_SIGNATURE",
          message: "Invalid webhook signature.",
        },
      });
    return res.json({ data: { received: true } });
  } catch (e) {
    next(e);
  }
}

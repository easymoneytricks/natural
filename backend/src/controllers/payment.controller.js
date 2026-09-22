import crypto from "node:crypto";
import { env } from "../config/env.js";
import { pool } from "../config/database.js";
import { read as readSettings } from "../services/storeSettings.service.js";
import { releaseOrderReservations } from "../services/order.service.js";
import { issuePurchase } from "../services/giftCardPurchase.service.js";
import { giftCardEmail, sendEmail } from "../services/mail.service.js";

async function issueGiftCardForOrder(orderId) {
  const purchase = await issuePurchase(pool, orderId, env.auth.accessSecret);
  if (purchase?.code && !purchase.alreadyIssued) {
    const recipient = purchase.delivery_mode === "gift"
      ? purchase.recipient_email
      : purchase.buyer_email;
    if (recipient) {
      sendEmail(giftCardEmail({
        recipient,
        recipientName: purchase.recipient_name,
        amount: purchase.amount,
        code: purchase.code,
        orderNumber: purchase.order_number || purchase.orderNumber,
        message: purchase.message,
      })).catch(() => {});
    }
  }
  return purchase;
}

const cashfreeBase = () =>
  env.cashfree.environment === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
const cashfreeIsEnabled = async () => {
  if (!env.cashfree.enabled) return false;
  const settings = await readSettings(pool, true);
  return settings.payments?.enabled !== "false";
};
const paymentConfiguration = async () => {
  const settings = await readSettings(pool, true);
  const selected =
    settings.payments?.provider === "razorpay" ? "razorpay" : "cashfree";
  const configuredEnabled = settings.payments?.enabled !== "false";
  const available =
    configuredEnabled &&
    (selected === "razorpay"
      ? env.razorpay.enabled
      : await cashfreeIsEnabled());
  return { selected, available };
};

export async function paymentMethods(req, res, next) {
  try {
    const { selected, available } = await paymentConfiguration();
    res.json({
      data: {
        cod: true,
        online: available,
        provider: available ? selected : null,
        cashfreeMode:
          selected === "cashfree" && available
            ? env.cashfree.environment
            : null,
        razorpayKeyId:
          selected === "razorpay" && available ? env.razorpay.keyId : null,
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
    const configuration = await paymentConfiguration();
    if (configuration.selected !== "cashfree" || !configuration.available)
      throw unavailable();
    const { orderNumber, customer, returnPath } = req.body || {};
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
    const storefrontReturnPath = String(returnPath || "/order-success").startsWith("/")
      ? String(returnPath || "/order-success")
      : "/order-success";
    const returnSeparator = storefrontReturnPath.includes("?") ? "&" : "?";
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
          return_url: `${process.env.STOREFRONT_URL || "http://localhost:5173"}${storefrontReturnPath}${returnSeparator}order=${encodeURIComponent(order.order_number)}`,
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

export async function createRazorpayOrder(req, res, next) {
  try {
    const { selected, available } = await paymentConfiguration();
    if (selected !== "razorpay" || !available) {
      const error = new Error(
        "Razorpay is not enabled in Admin Settings or server configuration.",
      );
      error.statusCode = 503;
      error.code = "RAZORPAY_UNAVAILABLE";
      throw error;
    }
    const { orderNumber } = req.body || {};
    const [[order]] = await pool.execute(
      "SELECT id,order_number,grand_total,currency FROM orders WHERE order_number=? LIMIT 1",
      [orderNumber],
    );
    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      error.code = "ORDER_NOT_FOUND";
      throw error;
    }
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: Math.round(Number(order.grand_total) * 100),
        currency: order.currency || "INR",
        receipt: order.order_number,
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.id) {
      const error = new Error(
        payload.error?.description || "Razorpay order creation failed.",
      );
      error.statusCode = 502;
      error.code = "RAZORPAY_ORDER_FAILED";
      throw error;
    }
    await pool.execute(
      "INSERT INTO payments(order_id,provider,payment_method,provider_order_id,amount,currency,status) VALUES(?,?,?,?,?,?,'created') ON DUPLICATE KEY UPDATE provider_order_id=VALUES(provider_order_id),amount=VALUES(amount),status='created'",
      [
        order.id,
        "razorpay",
        "online",
        payload.id,
        order.grand_total,
        order.currency || "INR",
      ],
    );
    res.json({
      data: {
        provider: "razorpay",
        keyId: env.razorpay.keyId,
        orderId: payload.id,
        amount: Math.round(Number(order.grand_total) * 100),
        currency: order.currency || "INR",
        orderNumber: order.order_number,
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
          if (paymentStatus === "paid") await issueGiftCardForOrder(order.id);
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
    const [[payment]] = await pool.execute(
      "SELECT p.order_id,o.status,o.payment_status FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.provider='razorpay' AND p.provider_order_id=? LIMIT 1",
      [orderId],
    );
    if (!payment) {
      const e = new Error("Payment order not found.");
      e.statusCode = 404;
      e.code = "PAYMENT_ORDER_NOT_FOUND";
      throw e;
    }
    await pool.execute(
      "UPDATE payments SET provider_payment_id=?,status='captured',captured_at=NOW() WHERE provider='razorpay' AND provider_order_id=?",
      [paymentId, orderId],
    );
    await pool.execute(
      "UPDATE orders SET payment_status='paid',status=IF(status='pending','confirmed',status) WHERE id=? AND payment_status NOT IN ('paid','refunded')",
      [payment.order_id],
    );
    const giftCard = await issueGiftCardForOrder(payment.order_id);
    res.json({ data: { verified: true, giftCard: giftCard?.code ? { orderNumber: giftCard.order_number, code: giftCard.code } : null } });
  } catch (e) {
    next(e);
  }
}
export async function webhook(req, res, next) {
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
    const event = req.body || {};
    const paymentEntity = event.payload?.payment?.entity || {};
    const paymentOrderId = paymentEntity.order_id;
    const paymentStatus =
      event.event === "payment.captured" || event.event === "order.paid"
        ? "paid"
        : event.event === "payment.failed"
          ? "failed"
          : null;
    if (paymentOrderId && paymentStatus) {
      const [[payment]] = await pool.execute(
        "SELECT p.order_id FROM payments p WHERE p.provider='razorpay' AND p.provider_order_id=? LIMIT 1",
        [paymentOrderId],
      );
      if (payment) {
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          const [[order]] = await connection.execute(
            "SELECT id,status,payment_status FROM orders WHERE id=? FOR UPDATE",
            [payment.order_id],
          );
          if (order?.payment_status === "pending") {
            const nextStatus =
              paymentStatus === "paid"
                ? order.status === "pending"
                  ? "confirmed"
                  : order.status
                : "cancelled";
            await connection.execute(
              "UPDATE orders SET payment_status=?,status=?,cancelled_at=IF(?='cancelled',NOW(),cancelled_at) WHERE id=?",
              [paymentStatus, nextStatus, nextStatus, order.id],
            );
            await connection.execute(
              "UPDATE payments SET provider_payment_id=?,status=?,captured_at=IF(?='paid',NOW(),captured_at),failed_at=IF(?='failed',NOW(),failed_at) WHERE provider='razorpay' AND provider_order_id=?",
              [
                paymentEntity.id || null,
                paymentStatus === "paid" ? "captured" : "failed",
                paymentStatus,
                paymentStatus,
                paymentOrderId,
              ],
            );
            await connection.execute(
              "INSERT INTO order_status_history(order_id,status,note) VALUES(?,?,?)",
              [
                order.id,
                nextStatus,
                paymentStatus === "paid"
                  ? "Razorpay payment confirmed."
                  : "Razorpay payment failed; reservation released.",
              ],
            );
            if (paymentStatus === "failed")
              await releaseOrderReservations(
                pool,
                order.id,
                "Razorpay payment failed",
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
        if (paymentStatus === "paid") await issueGiftCardForOrder(payment.order_id);
      }
    }
    return res.json({
      data: {
        received: true,
        processed: Boolean(paymentOrderId && paymentStatus),
      },
    });
  } catch (e) {
    next(e);
  }
}

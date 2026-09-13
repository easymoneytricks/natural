import { AuthError } from "./auth.service.js";
import { audit } from "./adminCatalog.service.js";
import { releaseOrderReservations } from "./order.service.js";
const fail = (s, c, m) => {
  throw new AuthError(s, c, m);
};
const allowed = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
export async function list(pool, q = {}) {
  const w = ["1=1"],
    a = [];
  if (q.q) {
    w.push(
      "(o.order_number LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)",
    );
    a.push(`%${q.q}%`, `%${q.q}%`, `%${q.q}%`);
  }
  for (const k of ["status", "payment_status", "payment_method"])
    if (q[k]) {
      w.push(`o.${k}=?`);
      a.push(q[k]);
    }
  const [rows] = await pool.execute(
    `SELECT o.id,o.order_number,o.customer_id,o.customer_email,o.customer_phone,o.status,o.payment_status,o.payment_method,o.grand_total,o.placed_at,o.updated_at,o.courier_name,o.tracking_id,COUNT(oi.id) item_count FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE ${w.join(" AND ")} GROUP BY o.id ORDER BY o.placed_at DESC LIMIT 100`,
    a,
  );
  return rows.map((r) => ({
    ...r,
    orderId: Number(r.id),
    orderNumber: r.order_number,
    customer: {
      email: r.customer_email,
      phone: r.customer_phone,
      guest: r.customer_id === null,
    },
    itemCount: Number(r.item_count),
    grandTotal: Number(r.grand_total),
    courier: r.courier_name,
    trackingId: r.tracking_id,
  }));
}
export async function detail(pool, number) {
  const [[o]] = await pool.execute(
    "SELECT * FROM orders WHERE order_number=?",
    [number],
  );
  if (!o) fail(404, "ORDER_NOT_FOUND", "Order not found.");
  const [items] = await pool.execute(
    "SELECT * FROM order_items WHERE order_id=?",
    [o.id],
  );
  const [addresses] = await pool.execute(
    "SELECT * FROM order_addresses WHERE order_id=?",
    [o.id],
  );
  const [history] = await pool.execute(
    "SELECT status,note,created_at FROM order_status_history WHERE order_id=? ORDER BY created_at,id",
    [o.id],
  );
  const [payments] = await pool.execute(
    "SELECT provider,provider_order_id,provider_payment_id,amount,status,created_at FROM payments WHERE order_id=? ORDER BY id DESC",
    [o.id],
  );
  return {
    order: {
      id: Number(o.id),
      orderNumber: o.order_number,
      placedAt: o.placed_at,
      status: o.status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      currency: o.currency,
      cancellationReason: o.cancellation_reason,
      returnStatus: o.return_status,
      refundAmount: Number(o.refund_amount || 0),
      refundReason: o.refund_reason,
    },
    customer: {
      id: o.customer_id,
      email: o.customer_email,
      phone: o.customer_phone,
      guest: o.customer_id === null,
    },
    items,
    shippingAddress:
      addresses.find((a) => a.address_type === "shipping") || null,
    billingAddress: addresses.find((a) => a.address_type === "billing") || null,
    pricing: {
      subtotal: Number(o.items_subtotal),
      mrpTotal: Number(o.mrp_total),
      couponCode: o.coupon_code,
      couponDiscount: Number(o.coupon_discount),
      shipping: Number(o.shipping_amount),
      tax: {
        amount: Number(o.tax_amount || 0),
        rate: Number(o.tax_rate || 0),
        label: o.tax_label,
        type: o.tax_type,
        cgst: Number(o.tax_cgst || 0),
        sgst: Number(o.tax_sgst || 0),
        igst: Number(o.tax_igst || 0),
        hsnSac: o.hsn_sac,
        sellerGstin: o.seller_gstin,
        sellerLegalName: o.seller_legal_name,
        sellerAddress: o.seller_address,
        sellerStateCode: o.seller_state_code,
        placeOfSupply: o.place_of_supply,
        reverseCharge: Boolean(o.reverse_charge),
      },
      giftCardApplied: Number(o.gift_card_amount),
      grandTotal: Number(o.grand_total),
    },
    payment: {
      amountPaid:
        o.payment_status === "paid"
          ? Number(o.grand_total) - Number(o.gift_card_amount)
          : 0,
      amountDue:
        o.payment_status === "paid"
          ? 0
          : Number(o.grand_total) - Number(o.gift_card_amount),
      records: payments,
    },
    shipping: {
      method: o.shipping_method_name,
      courier: o.courier_name,
      trackingId: o.tracking_id,
    },
    timeline: history,
  };
}
export async function updateStatus(pool, number, next, note, adminId, req) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[o]] = await conn.execute(
      "SELECT * FROM orders WHERE order_number=? FOR UPDATE",
      [number],
    );
    if (!o) fail(404, "ORDER_NOT_FOUND", "Order not found.");
    if (!allowed[o.status]?.includes(next))
      fail(
        409,
        "INVALID_ORDER_TRANSITION",
        `Cannot move an order from ${o.status} to ${next}.`,
      );
    if (next === "cancelled") {
      if (!String(note || "").trim())
        fail(400, "VALIDATION_ERROR", "A cancellation reason is required.");
      await releaseOrderReservations(
        pool,
        o.id,
        "Order cancelled by Admin",
        conn,
      );
    } else if (
      next === "delivered" &&
      o.payment_method === "cod" &&
      o.payment_status !== "paid"
    ) {
      await conn.execute('UPDATE orders SET payment_status="paid" WHERE id=?', [
        o.id,
      ]);
    }
    await conn.execute(
      'UPDATE orders SET status=?,cancellation_reason=IF(?="cancelled",?,cancellation_reason),cancelled_at=IF(?="cancelled",NOW(),cancelled_at),shipped_at=IF(?="shipped",NOW(),shipped_at),delivered_at=IF(?="delivered",NOW(),delivered_at) WHERE id=?',
      [
        next,
        next,
        next === "cancelled" ? note.trim() : null,
        next,
        next,
        next,
        o.id,
      ],
    );
    await conn.execute(
      "INSERT INTO order_status_history(order_id,status,note) VALUES(?,?,?)",
      [o.id, next, note || null],
    );
    await conn.commit();
    await audit(pool, adminId, "order.status_updated", "orders", o.id, req);
    return detail(pool, number);
  } catch (e) {
    try {
      await conn.rollback();
    } catch {}
    throw e;
  } finally {
    conn.release();
  }
}
export async function shipping(
  pool,
  number,
  courier,
  trackingId,
  adminId,
  req,
) {
  const [[o]] = await pool.execute(
    "SELECT id FROM orders WHERE order_number=?",
    [number],
  );
  if (!o) fail(404, "ORDER_NOT_FOUND", "Order not found.");
  await pool.execute(
    "UPDATE orders SET courier_name=?,tracking_id=? WHERE id=?",
    [courier || null, trackingId || null, o.id],
  );
  await audit(pool, adminId, "order.shipping_updated", "orders", o.id, req);
  return detail(pool, number);
}
export async function summary(pool) {
  const [rows] = await pool.execute(
    "SELECT status,COUNT(*) count FROM orders GROUP BY status",
  );
  return Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
}

export async function updateReturn(
  pool,
  number,
  returnStatus,
  refundAmount,
  reason,
  adminId,
  req,
) {
  const allowedStatuses = [
    "none",
    "requested",
    "approved",
    "rejected",
    "received",
    "refunded",
  ];
  if (!allowedStatuses.includes(returnStatus))
    fail(400, "VALIDATION_ERROR", "Invalid return status.");
  const amount = Number(refundAmount || 0);
  if (!Number.isFinite(amount) || amount < 0)
    fail(400, "VALIDATION_ERROR", "Refund amount must be zero or greater.");
  if (returnStatus !== "none" && !String(reason || "").trim())
    fail(400, "VALIDATION_ERROR", "A return or refund reason is required.");
  const [[order]] = await pool.execute(
    "SELECT id,grand_total FROM orders WHERE order_number=?",
    [number],
  );
  if (!order) fail(404, "ORDER_NOT_FOUND", "Order not found.");
  if (amount > Number(order.grand_total))
    fail(400, "VALIDATION_ERROR", "Refund cannot exceed the order total.");
  await pool.execute(
    "UPDATE orders SET return_status=?,refund_amount=?,refund_reason=? WHERE id=?",
    [returnStatus, amount, String(reason || "").trim() || null, order.id],
  );
  await audit(pool, adminId, "order.return_updated", "orders", order.id, req);
  return detail(pool, number);
}

import crypto from "node:crypto";
import { AuthError } from "./auth.service.js";
import { quote } from "./checkoutPricing.service.js";
import { earnForOrder } from "./reward.service.js";

const hash = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const orderNumber = () =>
  `NB-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
const normalizeAddress = (a = {}) => ({
  firstName: String(a.firstName || "").trim(),
  lastName: String(a.lastName || "").trim(),
  phone: String(a.phone || "").replace(/\D/g, ""),
  addressLine1: String(a.addressLine1 || "").trim(),
  addressLine2: String(a.addressLine2 || "").trim(),
  landmark: String(a.landmark || "").trim(),
  city: String(a.city || "").trim(),
  state: String(a.state || "").trim(),
  postalCode: String(a.postalCode || "").trim(),
  countryCode: String(a.countryCode || "IN").toUpperCase(),
});
export async function placeCodOrder(pool, input = {}, customer) {
  if (input.paymentMethod !== "cod")
    throw new AuthError(
      422,
      "ONLINE_PAYMENT_NOT_AVAILABLE_YET",
      "Online payment is not available yet.",
    );
  if (!input.idempotencyKey)
    throw new AuthError(
      400,
      "VALIDATION_ERROR",
      "An idempotency key is required.",
    );
  const address = normalizeAddress(input.shippingAddress);
  if (
    !address.firstName ||
    !address.lastName ||
    !/^\d{10}$/.test(address.phone) ||
    !address.addressLine1 ||
    !address.city ||
    !address.state ||
    !/^\d{6}$/.test(address.postalCode)
  )
    throw new AuthError(
      400,
      "VALIDATION_ERROR",
      "Please provide a complete shipping address.",
    );
  const fingerprint = hash({
    paymentMethod: input.paymentMethod,
    shippingMethod: input.shippingMethod,
    shippingAddress: address,
    contact: input.contact,
    couponCode: input.couponCode || "",
    giftCardCode: input.giftCardCode || "",
    items: customer ? undefined : input.items,
  });
  const existingConnection = await pool.getConnection();
  try {
    const [existing] = await existingConnection.execute(
      "SELECT id,request_fingerprint FROM orders WHERE idempotency_key=? LIMIT 1",
      [input.idempotencyKey],
    );
    if (existing[0]) {
      if (existing[0].request_fingerprint !== fingerprint)
        throw new AuthError(
          409,
          "IDEMPOTENCY_KEY_CONFLICT",
          "This order attempt does not match the original request.",
        );
      return getOrder(pool, existing[0].id, customer?.id);
    }
  } finally {
    existingConnection.release();
  }
  const calculated = await quote(pool, {
    customerId: customer?.id,
    items: customer ? undefined : input.items,
    shippingMethod: input.shippingMethod,
    couponCode: input.couponCode,
    giftCardCode: input.giftCardCode,
  });
  if (!calculated.checkoutReady)
    throw new AuthError(
      409,
      "CART_INVALID",
      "Please review the items in your cart before placing the order.",
    );
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const inventoryRows = [];
    for (const item of [...calculated.items].sort(
      (a, b) => a.skuId - b.skuId,
    )) {
      const [rows] = await connection.execute(
        "SELECT i.*, ps.track_inventory, ps.allow_backorder FROM inventory i JOIN product_skus ps ON ps.id=i.sku_id WHERE i.sku_id=? FOR UPDATE",
        [item.skuId],
      );
      if (rows[0] && rows[0].track_inventory && !rows[0].allow_backorder) {
        const available = rows[0].quantity_on_hand - rows[0].reserved_quantity;
        if (available < item.quantity)
          throw new AuthError(
            409,
            "INSUFFICIENT_STOCK",
            `Only ${available} items are currently available.`,
          );
        inventoryRows.push({ row: rows[0], item });
      }
    }
    let gift = null;
    if (input.giftCardCode) {
      const digest = crypto
        .createHash("sha256")
        .update(String(input.giftCardCode).trim().toUpperCase())
        .digest("hex");
      const [rows] = await connection.execute(
        'SELECT * FROM gift_cards WHERE code_hash=? AND status="active" AND deleted_at IS NULL FOR UPDATE',
        [digest],
      );
      gift = rows[0];
      if (
        !gift ||
        (gift.expires_at && new Date(gift.expires_at) <= new Date()) ||
        Number(gift.current_balance) <= 0
      )
        throw new AuthError(
          409,
          "GIFT_CARD_INVALID",
          "This gift card cannot be used.",
        );
    }
    const p = calculated.pricing;
    const [created] = await connection.execute(
      `INSERT INTO orders (order_number,idempotency_key,request_fingerprint,customer_id,customer_email,customer_phone,status,payment_method,payment_status,items_subtotal,mrp_total,product_discount,coupon_discount,shipping_amount,gift_card_amount,grand_total,coupon_code,shipping_method_code,shipping_method_name,shipping_estimated_days_min,shipping_estimated_days_max,customer_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        orderNumber(),
        input.idempotencyKey,
        fingerprint,
        customer?.id || null,
        input.contact?.email || customer?.email || "",
        input.contact?.phone || address.phone,
        "confirmed",
        "cod",
        p.payableTotal === 0 ? "paid" : "pending",
        p.subtotal,
        p.mrpTotal,
        p.productDiscount,
        p.coupon?.discount || 0,
        p.shipping.fee,
        p.giftCard?.applied || 0,
        p.payableTotal,
        p.coupon?.code || null,
        p.shipping.method,
        p.shipping.method === "STANDARD"
          ? "Standard Delivery"
          : "Express Delivery",
        null,
        null,
        input.customerNote || null,
      ],
    );
    const orderId = created.insertId;
    for (const item of calculated.items) {
      await connection.execute(
        "INSERT INTO order_items (order_id,product_id,sku_id,sku_code,product_name,product_slug,variant_title,attributes_json,image_path,quantity,unit_price,unit_mrp,line_subtotal,line_mrp_total,line_product_discount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          orderId,
          item.product.id,
          item.skuId,
          item.sku,
          item.product.name,
          item.product.slug,
          null,
          null,
          null,
          item.quantity,
          item.price,
          item.mrp,
          item.lineSubtotal,
          item.mrp * item.quantity,
          (item.mrp - item.price) * item.quantity,
        ],
      );
    }
    await connection.execute(
      "INSERT INTO order_addresses (order_id,first_name,last_name,phone,address_line_1,address_line_2,landmark,city,state,postal_code,country_code) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [
        orderId,
        address.firstName,
        address.lastName,
        address.phone,
        address.addressLine1,
        address.addressLine2 || null,
        address.landmark || null,
        address.city,
        address.state,
        address.postalCode,
        address.countryCode,
      ],
    );
    await connection.execute(
      'INSERT INTO order_status_history (order_id,status,note) VALUES (?,"confirmed","Order placed successfully.")',
      [orderId],
    );
    for (const { row, item } of inventoryRows) {
      await connection.execute(
        "UPDATE inventory SET reserved_quantity=reserved_quantity+? WHERE id=?",
        [item.quantity, row.id],
      );
      await connection.execute(
        'INSERT INTO inventory_movements (sku_id,movement_type,quantity_change,quantity_before,quantity_after,reserved_before,reserved_after,note) VALUES (?,"reservation",0,?,?,?, ?,"COD order reservation")',
        [
          row.sku_id,
          row.quantity_on_hand,
          row.quantity_on_hand,
          row.reserved_quantity,
          row.reserved_quantity + item.quantity,
        ],
      );
    }
    if (p.coupon?.code) {
      const [rows] = await connection.execute(
        "SELECT id FROM coupons WHERE code=? FOR UPDATE",
        [p.coupon.code],
      );
      if (rows[0]) {
        await connection.execute(
          "UPDATE coupons SET usage_count=usage_count+1 WHERE id=?",
          [rows[0].id],
        );
        await connection.execute(
          "INSERT INTO coupon_redemptions (coupon_id,customer_id,order_id,discount_amount) VALUES (?,?,?,?)",
          [rows[0].id, customer?.id || null, orderId, p.coupon.discount],
        );
      }
    }
    if (gift) {
      const before = Number(gift.current_balance);
      const applied = Math.min(before, p.payableTotal + p.giftCard.applied);
      const after = before - applied;
      await connection.execute(
        "UPDATE gift_cards SET current_balance=?,status=? WHERE id=?",
        [after, after > 0 ? "active" : "exhausted", gift.id],
      );
      await connection.execute(
        'INSERT INTO gift_card_transactions (gift_card_id,transaction_type,amount,balance_before,balance_after,reference_type,reference_id) VALUES (?,"redeem",?,?,?,?,?)',
        [gift.id, applied, before, after, "order", orderId],
      );
    }
    if (customer) {
      const [carts] = await connection.execute(
        "SELECT id FROM customer_carts WHERE customer_id=? FOR UPDATE",
        [customer.id],
      );
      if (carts[0])
        await connection.execute(
          "DELETE FROM customer_cart_items WHERE cart_id=?",
          [carts[0].id],
        );
    }
    await connection.commit();
    if (customer) await earnForOrder(pool, customer.id, orderId, p.subtotal);
    return getOrder(pool, orderId, customer?.id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function getOrder(pool, id, customerId) {
  const [orders] = await pool.execute(
    "SELECT * FROM orders WHERE id=? AND (? IS NULL OR customer_id=?)",
    [id, customerId || null, customerId || null],
  );
  if (!orders[0])
    throw new AuthError(404, "ORDER_NOT_FOUND", "Order not found.");
  const order = orders[0];
  const [items] = await pool.execute(
    "SELECT * FROM order_items WHERE order_id=?",
    [id],
  );
  const [addresses] = await pool.execute(
    "SELECT * FROM order_addresses WHERE order_id=?",
    [id],
  );
  const [history] = await pool.execute(
    "SELECT status,note,created_at AS createdAt FROM order_status_history WHERE order_id=? ORDER BY created_at",
    [id],
  );
  return {
    orderNumber: order.order_number,
    status: order.status,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    placedAt: order.placed_at,
    pricing: {
      subtotal: Number(order.items_subtotal),
      couponDiscount: Number(order.coupon_discount),
      shipping: Number(order.shipping_amount),
      giftCardApplied: Number(order.gift_card_amount),
      total: Number(order.grand_total),
    },
    items: items.map((i) => ({
      sku: i.sku_code,
      name: i.product_name,
      slug: i.product_slug,
      quantity: i.quantity,
      price: Number(i.unit_price),
      mrp: Number(i.unit_mrp),
      lineSubtotal: Number(i.line_subtotal),
    })),
    shippingAddress: addresses[0] || null,
    timeline: history,
  };
}
export async function listOrders(pool, customerId) {
  const [rows] = await pool.execute(
    "SELECT o.order_number,o.status,o.payment_method,o.payment_status,o.placed_at,o.grand_total,COUNT(oi.id) item_count FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE o.customer_id=? GROUP BY o.id ORDER BY o.placed_at DESC",
    [customerId],
  );
  return rows.map((r) => ({
    orderNumber: r.order_number,
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    placedAt: r.placed_at,
    itemCount: r.item_count,
    grandTotal: Number(r.grand_total),
  }));
}
export async function releaseOrderReservations(
  pool,
  orderId,
  reason = "Order reservation released",
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT oi.sku_id,oi.quantity,i.id,i.quantity_on_hand,i.reserved_quantity FROM order_items oi JOIN inventory i ON i.sku_id=oi.sku_id WHERE oi.order_id=? FOR UPDATE",
      [orderId],
    );
    for (const row of rows) {
      const released = Math.min(row.quantity, row.reserved_quantity);
      if (released) {
        await connection.execute(
          "UPDATE inventory SET reserved_quantity=reserved_quantity-? WHERE id=?",
          [released, row.id],
        );
        await connection.execute(
          'INSERT INTO inventory_movements (sku_id,movement_type,quantity_change,quantity_before,quantity_after,reserved_before,reserved_after,note) VALUES (?,"release",0,?,?,?, ?,?)',
          [
            row.sku_id,
            row.quantity_on_hand,
            row.quantity_on_hand,
            row.reserved_quantity,
            row.reserved_quantity - released,
            reason,
          ],
        );
      }
    }
    await connection.commit();
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}

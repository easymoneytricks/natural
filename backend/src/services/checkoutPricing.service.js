import crypto from "node:crypto";
import { AuthError } from "./auth.service.js";
import { getCart } from "./customerCart.service.js";

const paise = (value) => Math.round(Number(value || 0) * 100);
const rupees = (value) => Number((value / 100).toFixed(2));
const hash = (code) =>
  crypto
    .createHash("sha256")
    .update(
      String(code || "")
        .trim()
        .toUpperCase(),
    )
    .digest("hex");

async function guestItems(pool, input = []) {
  const connection = await pool.getConnection();
  try {
    const result = [];
    for (const item of Array.isArray(input) ? input : []) {
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) continue;
      const [rows] = await connection.execute(
        `SELECT ps.id sku_id,ps.sku,ps.price,ps.mrp,ps.track_inventory,ps.allow_backorder,ps.is_active sku_active,ps.deleted_at sku_deleted,p.id product_id,p.slug,p.name,p.is_active product_active,p.deleted_at product_deleted,i.quantity_on_hand,i.reserved_quantity FROM product_skus ps JOIN products p ON p.id=ps.product_id LEFT JOIN inventory i ON i.sku_id=ps.id WHERE ps.id=?`,
        [Number(item.skuId)],
      );
      if (rows[0]) result.push({ ...rows[0], quantity });
    }
    return result;
  } finally {
    connection.release();
  }
}
function line(row) {
  const available = row.track_inventory
    ? Math.max(
        0,
        Number(row.quantity_on_hand || 0) - Number(row.reserved_quantity || 0),
      )
    : null;
  const purchasable = Boolean(
    row.sku_active &&
    !row.sku_deleted &&
    row.product_active &&
    !row.product_deleted &&
    (!row.track_inventory || row.allow_backorder || available > 0),
  );
  return {
    skuId: row.sku_id,
    sku: row.sku,
    product: { id: row.product_id, slug: row.slug, name: row.name },
    quantity: row.quantity,
    price: Number(row.price),
    mrp: Number(row.mrp),
    lineSubtotal: purchasable ? Number(row.price) * row.quantity : 0,
    availability: {
      available,
      inStock: !row.track_inventory || available > 0,
      purchasable,
      quantityValid:
        purchasable &&
        (!row.track_inventory ||
          row.allow_backorder ||
          available >= row.quantity),
    },
    issue: !purchasable
      ? "SKU_UNAVAILABLE"
      : purchasable &&
          row.track_inventory &&
          !row.allow_backorder &&
          available < row.quantity
        ? "INSUFFICIENT_STOCK"
        : null,
  };
}
export async function shippingMethods(pool) {
  const [rows] = await pool.execute(
    "SELECT code,name,description,fee,free_shipping_threshold,estimated_days_min,estimated_days_max FROM shipping_methods WHERE is_active=1 ORDER BY sort_order,id",
  );
  return rows.map((r) => ({
    code: r.code,
    name: r.name,
    description: r.description,
    fee: Number(r.fee),
    freeShippingThreshold:
      r.free_shipping_threshold === null
        ? null
        : Number(r.free_shipping_threshold),
    estimatedDaysMin: r.estimated_days_min,
    estimatedDaysMax: r.estimated_days_max,
  }));
}
export async function quote(
  pool,
  {
    customerId,
    items,
    shippingMethod = "STANDARD",
    couponCode,
    giftCardCode,
  } = {},
) {
  const cart = customerId ? await getCart(pool, customerId) : null;
  const raw = customerId
    ? cart.items.map((i) => ({
        sku_id: i.skuId,
        sku: i.sku,
        price: i.price,
        mrp: i.mrp,
        quantity: i.quantity,
        product_id: i.product.id,
        slug: i.product.slug,
        name: i.product.name,
        track_inventory: i.availability.available !== null,
        allow_backorder: false,
        sku_active: i.availability.purchasable,
        product_active: true,
        quantity_on_hand: i.availability.available,
        reserved_quantity: 0,
      }))
    : await guestItems(pool, items);
  const lines = raw.map(line);
  const issues = lines
    .filter((i) => i.issue)
    .map((i) => ({
      code: i.issue,
      skuId: i.skuId,
      requested: i.quantity,
      available: i.availability.available,
    }));
  const valid = lines.filter((i) => i.availability.quantityValid);
  const subtotal = valid.reduce((s, i) => s + paise(i.price) * i.quantity, 0);
  const mrpTotal = valid.reduce((s, i) => s + paise(i.mrp) * i.quantity, 0);
  let coupon = null;
  if (couponCode) {
    const code = String(couponCode).trim().toUpperCase();
    const [rows] = await pool.execute(
      "SELECT * FROM coupons WHERE code=? AND is_active=1 AND deleted_at IS NULL LIMIT 1",
      [code],
    );
    const c = rows[0];
    if (!c)
      issues.push({
        code: "COUPON_NOT_FOUND",
        message: "This coupon is not available.",
      });
    else if (c.expires_at && new Date(c.expires_at) <= new Date())
      issues.push({
        code: "COUPON_EXPIRED",
        message: "This coupon has expired.",
      });
    else if (subtotal < paise(c.minimum_cart_amount))
      issues.push({
        code: "COUPON_MINIMUM_NOT_MET",
        message: `Add more items to use ${code}.`,
      });
    else {
      const discount =
        c.discount_type === "percentage"
          ? Math.round((subtotal * Number(c.discount_value)) / 100)
          : paise(c.discount_value);
      coupon = {
        code,
        discount: rupees(
          Math.min(
            discount,
            c.maximum_discount_amount === null
              ? discount
              : paise(c.maximum_discount_amount),
          ),
        ),
      };
    }
  }
  const methods = await shippingMethods(pool);
  const ship = methods.find(
    (m) => m.code === String(shippingMethod).toUpperCase(),
  );
  if (!ship)
    issues.push({
      code: "SHIPPING_METHOD_UNAVAILABLE",
      message: "Selected delivery method is unavailable.",
    });
  const shipping = ship
    ? ship.freeShippingThreshold !== null &&
      subtotal >= paise(ship.freeShippingThreshold)
      ? 0
      : paise(ship.fee)
    : 0;
  const couponDiscount = paise(coupon?.discount);
  const beforeGift = Math.max(0, subtotal - couponDiscount + shipping);
  let giftCard = null;
  if (giftCardCode) {
    const [rows] = await pool.execute(
      "SELECT * FROM gift_cards WHERE code_hash=? AND deleted_at IS NULL LIMIT 1",
      [hash(giftCardCode)],
    );
    const card = rows[0];
    if (!card)
      issues.push({
        code: "GIFT_CARD_NOT_FOUND",
        message: "This gift card is not available.",
      });
    else if (card.status !== "active")
      issues.push({
        code:
          card.status === "exhausted"
            ? "GIFT_CARD_EMPTY"
            : "GIFT_CARD_DISABLED",
        message: "This gift card cannot be used.",
      });
    else if (card.expires_at && new Date(card.expires_at) <= new Date())
      issues.push({
        code: "GIFT_CARD_EXPIRED",
        message: "This gift card has expired.",
      });
    else {
      const applied = Math.min(paise(card.current_balance), beforeGift);
      giftCard = {
        last4: card.code_last4,
        availableBalance: Number(card.current_balance),
        applied: rupees(applied),
      };
    }
  }
  const giftApplied = paise(giftCard?.applied);
  return {
    items: lines,
    pricing: {
      mrpTotal: rupees(mrpTotal),
      productDiscount: rupees(mrpTotal - subtotal),
      subtotal: rupees(subtotal),
      coupon: coupon ? { code: coupon.code, discount: coupon.discount } : null,
      shipping: {
        method: ship?.code || String(shippingMethod).toUpperCase(),
        fee: rupees(shipping),
        freeShippingApplied: shipping === 0,
      },
      giftCard: giftCard ? { ...giftCard } : null,
      payableTotal: rupees(Math.max(0, beforeGift - giftApplied)),
    },
    checkoutReady: !issues.length && lines.length > 0,
    issues,
  };
}

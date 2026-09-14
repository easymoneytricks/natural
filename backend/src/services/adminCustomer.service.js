import { AuthError } from "./auth.service.js";
import { revokeAllSessions } from "./auth.service.js";
import { audit } from "./adminCatalog.service.js";
const fail = (s, c, m) => {
  throw new AuthError(s, c, m);
};
export async function list(pool, q = {}) {
  const w = ["c.deleted_at IS NULL"],
    a = [];
  if (q.q) {
    w.push(
      "(c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)",
    );
    const x = `%${q.q}%`;
    a.push(x, x, x, x);
  }
  if (q.status) {
    w.push("c.status=?");
    a.push(q.status);
  }
  const [rows] = await pool.execute(
    `SELECT c.id,c.first_name,c.last_name,c.email,c.phone,c.status,c.last_login_at,c.created_at,(SELECT COUNT(*) FROM orders o WHERE o.customer_id=c.id) order_count,(SELECT COALESCE(SUM(o.grand_total),0) FROM orders o WHERE o.customer_id=c.id AND o.payment_status IN ('paid','pending')) order_total FROM customers c WHERE ${w.join(" AND ")} ORDER BY c.created_at DESC LIMIT 100`,
    a,
  );
  return rows.map((r) => ({
    ...r,
    id: Number(r.id),
    name: `${r.first_name} ${r.last_name}`.trim(),
    orderCount: Number(r.order_count),
    orderTotal: Number(r.order_total),
  }));
}
export async function summary(pool) {
  const [[r]] = await pool.execute(
    "SELECT COUNT(*) total,COUNT(CASE WHEN status='active' THEN 1 END) active,COUNT(CASE WHEN status='disabled' THEN 1 END) disabled,COUNT(CASE WHEN created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) THEN 1 END) newCustomers FROM customers WHERE deleted_at IS NULL",
  );
  return {
    total: Number(r.total),
    active: Number(r.active),
    disabled: Number(r.disabled),
    newCustomers: Number(r.newCustomers),
  };
}
export async function detail(pool, id) {
  const [[c]] = await pool.execute(
    "SELECT id,first_name,last_name,email,phone,status,email_verified_at,phone_verified_at,last_login_at,created_at,updated_at FROM customers WHERE id=? AND deleted_at IS NULL",
    [id],
  );
  if (!c) fail(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  const [addresses] = await pool.execute(
    "SELECT id,label,first_name,last_name,phone,address_line_1,address_line_2,landmark,city,state,postal_code,country_code,address_type,is_default,created_at FROM customer_addresses WHERE customer_id=? AND deleted_at IS NULL ORDER BY is_default DESC,updated_at DESC",
    [id],
  );
  const [orders] = await pool.execute(
    "SELECT order_number,status,payment_status,payment_method,grand_total,placed_at FROM orders WHERE customer_id=? ORDER BY placed_at DESC LIMIT 50",
    [id],
  );
  const [[cart]] = await pool.execute(
    "SELECT COUNT(ci.id) item_count,COALESCE(SUM(ci.quantity),0) quantity FROM customer_carts cc LEFT JOIN customer_cart_items ci ON ci.cart_id=cc.id WHERE cc.customer_id=?",
    [id],
  );
  const [[wish]] = await pool.execute(
    "SELECT COUNT(*) count FROM customer_wishlist_items WHERE customer_id=?",
    [id],
  );
  const [wishlist] = await pool.execute(
    `SELECT p.id,p.name,p.slug,COALESCE((SELECT pm.file_path FROM product_media pm WHERE pm.product_id=p.id AND pm.deleted_at IS NULL ORDER BY pm.is_primary DESC,pm.id LIMIT 1),'') image
     FROM customer_wishlist_items wi JOIN products p ON p.id=wi.product_id
     WHERE wi.customer_id=? ORDER BY wi.created_at DESC`,
    [id],
  );
  const [cartItems] = await pool.execute(
    `SELECT ci.sku_id,ci.quantity,ps.sku,ps.price,ps.mrp,p.name product_name,p.slug product_slug,
      COALESCE(i.quantity_on_hand-i.reserved_quantity,0) available
     FROM customer_cart_items ci JOIN customer_carts cc ON cc.id=ci.cart_id
     JOIN product_skus ps ON ps.id=ci.sku_id JOIN products p ON p.id=ps.product_id
     LEFT JOIN inventory i ON i.sku_id=ps.id WHERE cc.customer_id=? ORDER BY ci.updated_at DESC`,
    [id],
  );
  return {
    customer: {
      ...c,
      id: Number(c.id),
      name: `${c.first_name} ${c.last_name}`.trim(),
    },
    addresses,
    orders: orders.map((o) => ({ ...o, grandTotal: Number(o.grand_total) })),
    commerce: {
      cartItemCount: Number(cart.item_count || 0),
      cartQuantity: Number(cart.quantity || 0),
      wishlistCount: Number(wish.count || 0),
    },
    wishlist: wishlist.map((item) => ({ ...item, id: Number(item.id) })),
    cart: cartItems.map((item) => ({
      ...item,
      skuId: Number(item.sku_id),
      quantity: Number(item.quantity),
      price: Number(item.price),
      mrp: Number(item.mrp),
      available: Number(item.available || 0),
    })),
  };
}
export async function setStatus(pool, id, status, adminId, req) {
  if (!["active", "disabled"].includes(status))
    fail(400, "INVALID_CUSTOMER_STATUS", "Invalid customer status.");
  const [[c]] = await pool.execute(
    "SELECT status FROM customers WHERE id=? AND deleted_at IS NULL",
    [id],
  );
  if (!c) fail(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  await pool.execute(
    "UPDATE customers SET status=?,deletion_requested_at=CASE WHEN ?='active' THEN NULL ELSE deletion_requested_at END WHERE id=?",
    [status, status, id],
  );
  if (status === "disabled") await revokeAllSessions(pool, id);
  await audit(
    pool,
    adminId,
    `customer.${status === "disabled" ? "disabled" : "enabled"}`,
    "customers",
    id,
    req,
  );
  return { status };
}

export async function deletePermanently(pool, id, adminId, req) {
  const [[customer]] = await pool.execute(
    "SELECT id FROM customers WHERE id=? AND deleted_at IS NULL",
    [id],
  );
  if (!customer) fail(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  await revokeAllSessions(pool, id);
  await pool.execute(
    "UPDATE customers SET status='disabled',deleted_at=NOW() WHERE id=? AND deleted_at IS NULL",
    [id],
  );
  await audit(pool, adminId, "customer.deleted", "customers", id, req);
  return { deleted: true };
}

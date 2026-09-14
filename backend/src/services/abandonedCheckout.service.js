const json = (value, fallback) => {
  try {
    return JSON.parse(value || "null") || fallback;
  } catch {
    return fallback;
  }
};

export async function upsert(pool, input, customer) {
  const sessionKey = String(input.sessionKey || "")
    .trim()
    .slice(0, 100);
  if (!sessionKey) return null;
  const items = Array.isArray(input.items)
    ? input.items.slice(0, 50).map((item) => ({
        skuId: Number(item.skuId) || null,
        name: String(item.name || "Product").slice(0, 200),
        quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
        price: Math.max(0, Number(item.price) || 0),
        image: item.image ? String(item.image).slice(0, 500) : null,
      }))
    : [];
  if (!items.length) return null;
  const email =
    String(input.email || customer?.email || "")
      .trim()
      .slice(0, 255) || null;
  const phone =
    String(input.phone || customer?.phone || "")
      .trim()
      .slice(0, 40) || null;
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const estimatedTotal = Number(input.estimatedTotal) || subtotal;
  const checkout =
    input.checkout && typeof input.checkout === "object"
      ? JSON.stringify(input.checkout)
      : null;
  await pool.execute(
    `INSERT INTO abandoned_checkouts
      (session_key,customer_id,email,phone,status,cart_json,checkout_json,subtotal,estimated_total,last_seen_at)
      VALUES(?,?,?,?, 'active',?,?,?,?,NOW())
      ON DUPLICATE KEY UPDATE customer_id=VALUES(customer_id),email=VALUES(email),phone=VALUES(phone),
      status=IF(status='converted','converted','active'),cart_json=VALUES(cart_json),checkout_json=VALUES(checkout_json),
      subtotal=VALUES(subtotal),estimated_total=VALUES(estimated_total),last_seen_at=NOW()`,
    [
      sessionKey,
      customer?.id || null,
      email,
      phone,
      JSON.stringify(items),
      checkout,
      subtotal,
      estimatedTotal,
    ],
  );
  return { sessionKey };
}

export async function list(pool, query = {}) {
  const status = ["active", "converted", "expired"].includes(query.status)
    ? query.status
    : "active";
  const q = String(query.q || "").trim();
  const params = [status];
  let where = "a.status=?";
  if (q) {
    where +=
      " AND (a.email LIKE ? OR a.phone LIKE ? OR JSON_UNQUOTE(JSON_EXTRACT(a.cart_json,'$[*].name')) LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const [rows] = await pool.execute(
    `SELECT a.id,a.session_key,a.email,a.phone,a.status,a.subtotal,a.estimated_total,
      a.last_seen_at,a.created_at,a.converted_order_number,JSON_LENGTH(a.cart_json) item_count,
      c.first_name,c.last_name
     FROM abandoned_checkouts a LEFT JOIN customers c ON c.id=a.customer_id
     WHERE ${where} ORDER BY a.last_seen_at DESC LIMIT 200`,
    params,
  );
  return rows.map((row) => ({
    ...row,
    items: Number(row.item_count || 0),
    subtotal: Number(row.subtotal),
    estimatedTotal: Number(row.estimated_total),
  }));
}

export async function detail(pool, id) {
  const [rows] = await pool.execute(
    "SELECT * FROM abandoned_checkouts WHERE id=?",
    [id],
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    ...row,
    cart: json(row.cart_json, []),
    checkout: json(row.checkout_json, {}),
    subtotal: Number(row.subtotal),
    estimatedTotal: Number(row.estimated_total),
  };
}

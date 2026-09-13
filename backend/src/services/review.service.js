import { AuthError } from "./auth.service.js";

const fail = (status, code, message) => {
  throw new AuthError(status, code, message);
};

export async function listForProduct(pool, slug) {
  const [rows] = await pool.execute(
    `SELECT r.id,r.rating,r.title,r.body,r.created_at,c.first_name,c.last_name
     FROM product_reviews r JOIN products p ON p.id=r.product_id
     JOIN customers c ON c.id=r.customer_id
     WHERE p.slug=? AND r.status='approved' ORDER BY r.created_at DESC`,
    [slug],
  );
  const reviews = rows.map((row) => ({
    id: Number(row.id),
    rating: Number(row.rating),
    title: row.title,
    body: row.body,
    author:
      `${row.first_name} ${String(row.last_name || "").charAt(0)}.`.trim(),
    createdAt: row.created_at,
    verifiedPurchase: true,
  }));
  return {
    reviews,
    rating: reviews.length
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          ).toFixed(1),
        )
      : 0,
    reviewCount: reviews.length,
  };
}

export async function create(pool, customerId, slug, input) {
  const rating = Number(input?.rating);
  const title = String(input?.title || "")
    .trim()
    .slice(0, 160);
  const body = String(input?.body || "").trim();
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    body.length < 10 ||
    body.length > 3000
  )
    fail(
      400,
      "INVALID_REVIEW",
      "Please provide a rating and a review between 10 and 3000 characters.",
    );
  const [[purchase]] = await pool.execute(
    `SELECT p.id,o.id AS order_id FROM products p JOIN order_items oi ON oi.product_id=p.id
     JOIN orders o ON o.id=oi.order_id
     WHERE p.slug=? AND o.customer_id=? AND o.status IN ('confirmed','processing','shipped','delivered')
       AND o.payment_status IN ('paid','pending') ORDER BY o.placed_at DESC LIMIT 1`,
    [slug, customerId],
  );
  if (!purchase)
    fail(
      403,
      "PURCHASE_REQUIRED",
      "Only customers who purchased this product can review it.",
    );
  try {
    const [result] = await pool.execute(
      "INSERT INTO product_reviews(product_id,customer_id,order_id,rating,title,body) VALUES(?,?,?,?,?,?)",
      [purchase.id, customerId, purchase.order_id, rating, title || null, body],
    );
    return { id: Number(result.insertId), status: "pending" };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      fail(
        409,
        "REVIEW_ALREADY_EXISTS",
        "You have already reviewed this product.",
      );
    throw error;
  }
}

export async function adminList(pool, query = {}) {
  const status = ["pending", "approved", "rejected", "deleted"].includes(
    query.status,
  )
    ? query.status
    : null;
  const [rows] = await pool.execute(
    `SELECT r.id,r.rating,r.title,r.body,r.status,r.admin_note,r.created_at,r.updated_at,
      p.name product_name,p.slug product_slug,c.first_name,c.last_name,c.email,o.order_number
     FROM product_reviews r JOIN products p ON p.id=r.product_id JOIN customers c ON c.id=r.customer_id JOIN orders o ON o.id=r.order_id
     WHERE (? IS NULL OR r.status=?) ORDER BY r.created_at DESC LIMIT 200`,
    [status, status],
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    rating: Number(row.rating),
  }));
}

export async function updateStatus(pool, id, status, note) {
  if (!["pending", "approved", "rejected", "deleted"].includes(status))
    fail(400, "INVALID_REVIEW_STATUS", "Invalid review status.");
  const [result] = await pool.execute(
    "UPDATE product_reviews SET status=?,admin_note=?,approved_at=IF(?='approved',NOW(),approved_at) WHERE id=?",
    [status, String(note || "").trim() || null, status, id],
  );
  if (!result.affectedRows) fail(404, "REVIEW_NOT_FOUND", "Review not found.");
  return { id: Number(id), status };
}

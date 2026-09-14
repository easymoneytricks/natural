import { AuthError } from "./auth.service.js";

const fail = (status, code, message) => {
  throw new AuthError(status, code, message);
};

export async function subscribe(pool, input) {
  const email = String(input?.email || "")
    .trim()
    .toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email))
    fail(400, "INVALID_EMAIL", "Please enter a valid email address.");
  await pool.execute(
    `INSERT INTO newsletter_subscribers(email,status,source,subscribed_at,unsubscribed_at)
     VALUES(?, 'subscribed', ?, NOW(), NULL)
     ON DUPLICATE KEY UPDATE status='subscribed',source=VALUES(source),unsubscribed_at=NULL`,
    [email, String(input?.source || "storefront").slice(0, 40)],
  );
  return { email, status: "subscribed" };
}

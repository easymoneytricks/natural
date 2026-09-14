import crypto from "node:crypto";
import { AuthError } from "./auth.service.js";

const fail = (statusCode, code, message) => {
  throw new AuthError(statusCode, code, message);
};
const hashCode = (value) =>
  crypto.createHash("sha256").update(String(value || "").trim().toUpperCase()).digest("hex");

export async function list(pool, customerId) {
  const [rows] = await pool.execute(
    `SELECT gc.id,gc.code_last4,gc.initial_value,gc.current_balance,gc.currency,gc.status,gc.expires_at,cgc.claimed_at
     FROM customer_gift_cards cgc JOIN gift_cards gc ON gc.id=cgc.gift_card_id
     WHERE cgc.customer_id=? AND gc.deleted_at IS NULL ORDER BY cgc.claimed_at DESC`,
    [customerId],
  );
  return rows.map((row) => ({
    id: Number(row.id),
    codeLast4: row.code_last4,
    initialValue: Number(row.initial_value),
    currentBalance: Number(row.current_balance),
    currency: row.currency,
    status: row.status,
    expiresAt: row.expires_at,
    claimedAt: row.claimed_at,
  }));
}

export async function claim(pool, customerId, code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!/^NBGC-[A-F0-9]{16}$/.test(normalized))
    fail(400, "INVALID_GIFT_CARD_CODE", "Enter a valid gift card code.");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[card]] = await connection.execute(
      "SELECT * FROM gift_cards WHERE code_hash=? AND deleted_at IS NULL FOR UPDATE",
      [hashCode(normalized)],
    );
    if (!card) fail(404, "GIFT_CARD_NOT_FOUND", "Gift card code not found.");
    if (card.status !== "active" || Number(card.current_balance) <= 0)
      fail(409, "GIFT_CARD_UNAVAILABLE", "This gift card has no usable balance.");
    if (card.expires_at && new Date(card.expires_at) <= new Date())
      fail(409, "GIFT_CARD_EXPIRED", "This gift card has expired.");
    try {
      await connection.execute(
        "INSERT INTO customer_gift_cards(customer_id,gift_card_id) VALUES(?,?)",
        [customerId, card.id],
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        fail(409, "GIFT_CARD_ALREADY_CLAIMED", "This gift card is already linked to an account.");
      throw error;
    }
    await connection.commit();
    return { id: Number(card.id), codeLast4: card.code_last4, currentBalance: Number(card.current_balance), currency: card.currency };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

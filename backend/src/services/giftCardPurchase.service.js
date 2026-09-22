import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import { AuthError } from "./auth.service.js";
import { read } from "./storeSettings.service.js";

const fail = (status, code, message) => {
  throw new AuthError(status, code, message);
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashCode = (value) =>
  crypto
    .createHash("sha256")
    .update(String(value || "").trim().toUpperCase())
    .digest("hex");
const encryptionKey = (secret) =>
  crypto.createHash("sha256").update(secret).digest();
const encrypt = (value, secret) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`;
};
const decrypt = (value, secret) => {
  if (!value) return "";
  const [ivText, tagText, dataText] = String(value).split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(secret),
    Buffer.from(ivText, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};
const orderNumber = () =>
  `GC-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

export async function denominations(pool) {
  const settings = await read(pool, true);
  let values = settings.gift_cards?.denominations;
  if (typeof values === "string") {
    try {
      values = JSON.parse(values);
    } catch {
      values = [];
    }
  }
  return [...new Set((Array.isArray(values) ? values : [500, 1000, 2000, 5000])
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0))].sort(
    (a, b) => a - b,
  );
}

export async function createPurchase(pool, input = {}, customer, secret) {
  const amount = Number(input.amount);
  const allowed = await denominations(pool);
  const buyerEmail = String(input.buyerEmail || customer?.email || "")
    .trim()
    .toLowerCase();
  const mode = input.deliveryMode === "gift" ? "gift" : "self";
  const recipientEmail = String(input.recipientEmail || "").trim().toLowerCase();
  if (!allowed.includes(amount)) fail(400, "INVALID_GIFT_CARD_AMOUNT", "Choose an available gift card amount.");
  if (!emailPattern.test(buyerEmail)) fail(400, "INVALID_EMAIL", "Enter a valid email address.");
  if (mode === "gift" && !emailPattern.test(recipientEmail))
    fail(400, "INVALID_RECIPIENT_EMAIL", "Enter a valid recipient email address.");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const number = orderNumber();
    const idempotency = randomUUID();
    const fingerprint = hashCode(`${buyerEmail}|${amount}|${mode}|${recipientEmail}`);
    const [created] = await connection.execute(
      `INSERT INTO orders (order_number,idempotency_key,request_fingerprint,customer_id,customer_email,customer_phone,status,payment_method,payment_status,items_subtotal,mrp_total,product_discount,coupon_discount,shipping_amount,tax_amount,gift_card_amount,grand_total,shipping_method_code,shipping_method_name,customer_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        number,
        idempotency,
        fingerprint,
        customer?.id || null,
        buyerEmail,
        String(input.phone || "0000000000").replace(/\D/g, "").slice(0, 20) || "0000000000",
        "pending",
        "online",
        "pending",
        amount,
        amount,
        0,
        0,
        0,
        0,
        0,
        amount,
        "DIGITAL",
        "Digital delivery",
        String(input.message || "").trim().slice(0, 500) || null,
      ],
    );
    await connection.execute(
      "INSERT INTO order_addresses (order_id,first_name,last_name,phone,address_line_1,city,state,postal_code,country_code) VALUES (?,?,?,?,?,?,?,?,?)",
      [created.insertId, "Digital", "Delivery", "0000000000", "Digital gift card", "Online", "Digital", "000000", "IN"],
    );
    await connection.execute(
      "INSERT INTO gift_card_purchases(order_id,amount,buyer_email,recipient_email,recipient_name,message,delivery_mode) VALUES(?,?,?,?,?,?,?)",
      [created.insertId, amount, buyerEmail, mode === "gift" ? recipientEmail : null, String(input.recipientName || "").trim().slice(0, 255) || null, String(input.message || "").trim().slice(0, 500) || null, mode],
    );
    await connection.execute(
      "INSERT INTO order_status_history(order_id,status,note) VALUES(?,?,?)",
      [created.insertId, "pending", "Gift card payment initiated."],
    );
    await connection.commit();
    return { orderNumber: number, amount, email: buyerEmail, id: Number(created.insertId) };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function issuePurchase(pool, orderId, secret) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[purchase]] = await connection.execute(
      "SELECT gcp.*,o.order_number FROM gift_card_purchases gcp JOIN orders o ON o.id=gcp.order_id WHERE gcp.order_id=? FOR UPDATE",
      [orderId],
    );
    if (!purchase) {
      await connection.commit();
      return null;
    }
    if (purchase.gift_card_id) {
      await connection.commit();
      return { ...purchase, code: decrypt(purchase.code_encrypted, secret), alreadyIssued: true };
    }
    const code = `NBGC-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const [created] = await connection.execute(
      "INSERT INTO gift_cards(code_hash,code_last4,initial_value,current_balance) VALUES(?,?,?,?)",
      [hashCode(code), code.slice(-4), purchase.amount, purchase.amount],
    );
    await connection.execute(
      "INSERT INTO gift_card_transactions(gift_card_id,transaction_type,amount,balance_before,balance_after,reference_type,reference_id) VALUES(?,?,?,0,?,?,?)",
      [created.insertId, "issue", purchase.amount, purchase.amount, "gift_card_purchase", purchase.id],
    );
    await connection.execute(
      "UPDATE gift_card_purchases SET gift_card_id=?,code_encrypted=?,issued_at=NOW() WHERE id=?",
      [created.insertId, encrypt(code, secret), purchase.id],
    );
    await connection.commit();
    return { ...purchase, gift_card_id: created.insertId, code, alreadyIssued: false };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function status(pool, orderNumber, email, secret) {
  const [[row]] = await pool.execute(
    `SELECT o.order_number,o.payment_status,gcp.amount,gcp.delivery_mode,gcp.buyer_email,gcp.recipient_email,gcp.gift_card_id,gcp.code_encrypted
     FROM gift_card_purchases gcp JOIN orders o ON o.id=gcp.order_id
     WHERE o.order_number=? AND LOWER(gcp.buyer_email)=LOWER(?) LIMIT 1`,
    [orderNumber, email],
  );
  if (!row) fail(404, "GIFT_CARD_PURCHASE_NOT_FOUND", "Gift card purchase not found.");
  return {
    orderNumber: row.order_number,
    paymentStatus: row.payment_status,
    amount: Number(row.amount),
    deliveryMode: row.delivery_mode,
    recipientEmail: row.recipient_email,
    code: row.gift_card_id ? decrypt(row.code_encrypted, secret) : null,
  };
}

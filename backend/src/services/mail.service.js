import nodemailer from "nodemailer";
import { pool } from "../config/database.js";
import { readPrivate } from "./storeSettings.service.js";

let transport;
let transportKey = "";

async function getTransport() {
  const settings = (await readPrivate(pool)).smtp || {};
  const host = settings.host || process.env.SMTP_HOST;
  const port = Number(settings.port || process.env.SMTP_PORT || 587);
  const user = settings.username || process.env.SMTP_USER;
  const pass = settings.password || process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) {
    const error = new Error("SMTP is not configured.");
    error.code = "SMTP_NOT_CONFIGURED";
    error.statusCode = 503;
    throw error;
  }
  const key = `${host}:${port}:${user}:${pass}:${settings.secure || "false"}`;
  if (transport && key === transportKey) return { transport, settings };
  transport = nodemailer.createTransport({
    host,
    port,
    secure: String(settings.secure || "false") === "true" || port === 465,
    auth: { user, pass },
  });
  transportKey = key;
  return { transport, settings };
}

export async function sendEmail({
  eventType,
  to,
  subject,
  html,
  text,
  referenceType = null,
  referenceId = null,
}) {
  if (!to) return { skipped: true, reason: "missing_recipient" };
  const [created] = await pool.execute(
    "INSERT INTO email_deliveries(event_type,recipient,subject,reference_type,reference_id,status) VALUES(?,?,?,?,?,'queued')",
    [eventType, to, subject, referenceType, referenceId],
  );
  const id = created.insertId;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { transport, settings } = await getTransport();
      const fromEmail =
        settings.from_email || process.env.SMTP_FROM_EMAIL || settings.username;
      const fromName = settings.from_name || "Natural Beauty";
      const result = await transport.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });
      await pool.execute(
        "UPDATE email_deliveries SET status='sent',attempts=?,provider_id=?,sent_at=NOW() WHERE id=?",
        [attempt, result.messageId || null, id],
      );
      return { sent: true, id, messageId: result.messageId };
    } catch (error) {
      lastError = error;
      await pool.execute(
        "UPDATE email_deliveries SET attempts=?,error_message=? WHERE id=?",
        [attempt, String(error.message || error).slice(0, 500), id],
      );
    }
  }
  await pool.execute("UPDATE email_deliveries SET status='failed' WHERE id=?", [
    id,
  ]);
  throw lastError;
}

export function orderEmail({ order, recipient, name }) {
  const total = Number(
    order.pricing?.total || order.grandTotal || 0,
  ).toLocaleString("en-IN");
  return {
    eventType: "order.confirmed",
    to: recipient,
    subject: `Order confirmed · ${order.orderNumber}`,
    referenceType: "order",
    referenceId: order.orderNumber,
    text: `Hi ${name || "there"}, your Natural Beauty order ${order.orderNumber} has been received. Total: ₹${total}.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#24352b"><h1 style="font-family:Georgia,serif">Your order is confirmed</h1><p>Hi ${name || "there"},</p><p>We have received order <strong>${order.orderNumber}</strong>.</p><p style="font-size:20px">Total: <strong>₹${total}</strong></p><p>We will keep you updated as your ritual moves along.</p></div>`,
  };
}

export async function sendTestEmail(recipient) {
  return sendEmail({
    eventType: "smtp.test",
    to: recipient,
    subject: "Natural Beauty SMTP test",
    text: "Your Natural Beauty SMTP configuration is working.",
    html: "<p>Your Natural Beauty SMTP configuration is working.</p>",
  });
}

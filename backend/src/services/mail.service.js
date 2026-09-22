import nodemailer from "nodemailer";
import { pool } from "../config/database.js";
import { read, readPrivate } from "./storeSettings.service.js";

let transport;
let transportKey = "";

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
const money = (value) => `&#8377;${Number(value || 0).toLocaleString("en-IN")}`;
const plainMoney = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
const paragraph = (value) =>
  `<p style="margin:0 0 16px;color:#52665a;font-size:16px">${value}</p>`;
const button = (label, href) =>
  `<a href="${esc(href)}" style="display:inline-block;background:#385941;color:#fffdf8;text-decoration:none;padding:13px 20px;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:bold">${esc(label)} &rarr;</a>`;

const rawShell = ({ eyebrow, title, preview, body }) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head><body style="margin:0;background:#f5f4ee;color:#24352b;font-family:Arial,Helvetica,sans-serif;line-height:1.6"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preview)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4ee;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fffdf8;border:1px solid #e2e4da"><tr><td style="padding:28px 36px;border-bottom:1px solid #e2e4da"><span style="font-family:Georgia,serif;font-size:27px;color:#1d2c22">{{BUSINESS_NAME}}</span><div style="margin-top:6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5c725f">Thoughtful products, simply considered</div></td></tr><tr><td style="padding:38px 36px"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#55715b;font-weight:bold">${esc(eyebrow)}</div><h1 style="margin:13px 0 18px;font-family:Georgia,serif;font-size:36px;line-height:1.12;font-weight:normal;color:#1d2c22">${esc(title)}</h1>${body}</td></tr><tr><td style="padding:20px 36px;background:#edf1e8;border-top:1px solid #e2e4da;color:#627267;font-size:12px">You are receiving this email from {{BUSINESS_NAME}}. Need help? Reply to this email and our care team will be happy to help.</td></tr></table><div style="max-width:640px;padding:18px 12px;color:#7b877d;font-size:11px">{{BUSINESS_NAME}}</div></td></tr></table></body></html>`;

const shell = (args) => rawShell(args);

const applyBusinessBranding = (value, businessName) =>
  String(value || "")
    .replaceAll("{{BUSINESS_NAME}}", businessName)
    .replaceAll("Natural Beauty", businessName)
    .replaceAll("natural beauty", businessName)
    .replaceAll("skincare", "products")
    .replaceAll("Skincare", "Products")
    .replaceAll("formulas", "products")
    .replaceAll("Formulas", "Products")
    .replaceAll("ritual", "routine")
    .replaceAll("Ritual", "Routine");

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
  const publicSettings = await read(pool, true);
  const businessName = String(
    publicSettings.store?.store_name || publicSettings.seo?.site_title || "Your store",
  ).trim() || "Your store";
  subject = applyBusinessBranding(subject, businessName);
  text = applyBusinessBranding(text, businessName);
  html = applyBusinessBranding(html, businessName);
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
      const fromName = applyBusinessBranding(settings.from_name || businessName, businessName);
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

export function orderEmail({ order, recipient, name, admin = false }) {
  const number = order.orderNumber || order.order_number;
  const total =
    order.pricing?.grandTotal ?? order.pricing?.total ?? order.grandTotal;
  const subject = admin
    ? `New order received · ${number}`
    : `Order confirmed · ${number}`;
  const body = `${paragraph(`Hi ${esc(name || (admin ? "team" : "there"))},`)}${paragraph(admin ? "A new customer order has been placed and is ready for your team to review." : "Thank you for choosing Natural Beauty. We have received your order and will keep you updated as it moves along.")}<div style="margin:24px 0;padding:20px;background:#edf1e8"><div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#55715b">Order number</div><div style="margin-top:5px;font-family:Georgia,serif;font-size:23px">${esc(number)}</div><div style="margin-top:12px;font-size:17px;font-weight:bold">Total: ${money(total)}</div></div>${button(admin ? "Open orders" : "View your order", `${admin ? process.env.ADMIN_URL || "http://localhost:5174" : process.env.STOREFRONT_URL || "http://localhost:5173"}/orders/${encodeURIComponent(number)}`)}`;
  return {
    eventType: admin ? "order.received" : "order.confirmed",
    to: recipient,
    subject,
    referenceType: "order",
    referenceId: number,
    text: `Hi ${name || "there"}, order ${number} has been received. Total: ${plainMoney(total)}.`,
    html: shell({
      eyebrow: admin ? "Operations" : "Order confirmed",
      title: admin ? "A new order has arrived" : "Your ritual is on its way",
      preview: subject,
      body,
    }),
  };
}

export function giftCardEmail({ recipient, recipientName, amount, code, orderNumber, message }) {
  const subject = `Your gift card is ready · ${orderNumber}`;
  const body = `${paragraph(`Hi ${esc(recipientName || "there")},`)}${paragraph("Your gift card payment was confirmed. Use the secure code below whenever you are ready to redeem it.")}${message ? paragraph(`<strong>Message from the purchaser:</strong><br>${esc(message)}`) : ""}<div style="margin:24px 0;padding:24px;background:#edf1e8;text-align:center"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#55715b">Gift card value</div><div style="margin-top:5px;font-family:Georgia,serif;font-size:28px">${money(amount)}</div><div style="margin-top:18px;font-family:monospace;font-size:22px;letter-spacing:2px;color:#1d2c22">${esc(code)}</div></div>${button("Shop with your gift card", `${process.env.STOREFRONT_URL || "http://localhost:5173"}/shop`)}`;
  return {
    eventType: "gift_card.issued",
    to: recipient,
    subject,
    referenceType: "gift_card_purchase",
    referenceId: orderNumber,
    text: `Your gift card worth ${plainMoney(amount)} is ready. Code: ${code}`,
    html: shell({ eyebrow: "Gift card", title: "A thoughtful gift, ready to use", preview: subject, body }),
  };
}

export function orderStatusEmail({ order, recipient, name, status, note }) {
  const titles = {
    confirmed: "Your order is confirmed",
    processing: "We are preparing your order",
    shipped: "Your order has shipped",
    delivered: "Your order has arrived",
    cancelled: "Your order has been cancelled",
    return_requested: "We received your return request",
    return_approved: "Your return request is approved",
    return_rejected: "Your return request needs attention",
    return_received: "Your returned order was received",
    return_refunded: "Your refund has been initiated",
    return_none: "Your return record was updated",
  };
  const number = order.orderNumber || order.order_number;
  const title = titles[status] || "Your order status was updated";
  const shipping = order.shipping || {};
  const tracking =
    status === "shipped" && (shipping.courier || shipping.trackingId)
      ? `<div style="margin:20px 0;padding:16px 18px;background:#edf1e8;color:#52665a"><strong>Shipment tracking</strong><br>${shipping.courier ? `Courier: ${esc(shipping.courier)}<br>` : ""}${shipping.trackingId ? `Tracking ID: ${esc(shipping.trackingId)}` : ""}</div>`
      : "";
  const body = `${paragraph(`Hi ${esc(name || "there")},`)}${paragraph(`The status of order <strong>${esc(number)}</strong> is now <strong>${esc(status)}</strong>.`)}${tracking}${note ? paragraph(`Note from our team: ${esc(note)}`) : ""}${button("View order", `${process.env.STOREFRONT_URL || "http://localhost:5173"}/account/orders/${encodeURIComponent(number)}`)}`;
  return {
    eventType: `order.${status}`,
    to: recipient,
    subject: `${title} · ${number}`,
    referenceType: "order",
    referenceId: number,
    text: `Order ${number} is now ${status}.${status === "shipped" && (shipping.courier || shipping.trackingId) ? ` Courier: ${shipping.courier || "Not provided"}. Tracking ID: ${shipping.trackingId || "Not provided"}.` : ""}`,
    html: shell({
      eyebrow: "Order update",
      title,
      preview: `Order ${number} is now ${status}.`,
      body,
    }),
  };
}

export function contactReceivedEmail({ recipient, name }) {
  const body = `${paragraph(`Hi ${esc(name || "there")},`)}${paragraph("Thanks for reaching out to Natural Beauty. Your message is with our care team, and we will reply as soon as possible during support hours.")}${button("Explore skincare", `${process.env.STOREFRONT_URL || "http://localhost:5173"}/shop`)}`;
  return {
    eventType: "contact.received",
    to: recipient,
    subject: "We received your message · Natural Beauty",
    text: `Hi ${name || "there"}, we received your message and will be in touch soon.`,
    html: shell({
      eyebrow: "Customer care",
      title: "Your note is with us",
      preview: "We received your Natural Beauty message.",
      body,
    }),
  };
}

export function contactAdminEmail({ submission }) {
  const body = `${paragraph("A new customer enquiry has been submitted through the storefront.")}<div style="padding:20px;background:#edf1e8"><strong>${esc(submission.name)}</strong><br><a href="mailto:${esc(submission.email)}" style="color:#385941">${esc(submission.email)}</a><p style="margin:14px 0 0;color:#52665a">${esc(submission.message)}</p></div>${button("Open contact inbox", `${process.env.ADMIN_URL || "http://localhost:5174"}/contact`)}`;
  return {
    eventType: "contact.received.admin",
    to: process.env.ADMIN_NOTIFICATION_EMAIL,
    subject: `New customer enquiry · ${submission.name}`,
    referenceType: "contact_submission",
    referenceId: submission.id,
    text: `New enquiry from ${submission.name} (${submission.email}): ${submission.message}`,
    html: shell({
      eyebrow: "Customer care",
      title: "New enquiry received",
      preview: `New enquiry from ${submission.name}`,
      body,
    }),
  };
}

export function contactResponseEmail({
  recipient,
  name,
  message,
  submissionId,
}) {
  const body = `${paragraph(`Hi ${esc(name || "there")},`)}${paragraph("Thank you for contacting Natural Beauty. Here is a message from our care team:")}<div style="margin:22px 0;padding:20px;background:#edf1e8;border-left:3px solid #385941;color:#52665a;font-size:16px;white-space:pre-line">${esc(message)}</div>${paragraph("If you need anything else, simply reply to this email and our team will be happy to help.")}${button("Continue shopping", `${process.env.STOREFRONT_URL || "http://localhost:5173"}/shop`)}`;
  return {
    eventType: "contact.response",
    to: recipient,
    subject: "A note from Natural Beauty customer care",
    referenceType: "contact_submission",
    referenceId: submissionId,
    text: `Hi ${name || "there"},\n\n${message}\n\nReply to this email if you need more help.`,
    html: shell({
      eyebrow: "Customer care",
      title: "A note from our care team",
      preview: "You have a new message from Natural Beauty customer care.",
      body,
    }),
  };
}

export async function sendTestEmail(recipient) {
  return sendEmail({
    eventType: "smtp.test",
    to: recipient,
    subject: "Natural Beauty SMTP test",
    text: "Your Natural Beauty SMTP configuration is working.",
    html: shell({
      eyebrow: "System check",
      title: "Email delivery is connected",
      preview: "Your Natural Beauty SMTP configuration is working.",
      body: paragraph(
        "This is a test message from your Natural Beauty admin settings. Your transactional email connection is ready for staging verification.",
      ),
    }),
  });
}

export function emailVerificationEmail({ recipient, code }) {
  const body = `${paragraph("Use this one-time code to finish creating your Natural Beauty account:")}<div style="margin:24px 0;padding:18px;text-align:center;background:#edf1e8;font-family:Georgia,serif;font-size:34px;letter-spacing:8px;color:#385941"><strong>${esc(code)}</strong></div>${paragraph("This code expires in 10 minutes. If you did not create an account, you can safely ignore this email.")}`;
  return {
    eventType: "customer.email_verification",
    to: recipient,
    subject: "Verify your Natural Beauty email",
    text: `Your Natural Beauty verification code is ${code}. It expires in 10 minutes.`,
    html: shell({
      eyebrow: "Welcome to Natural Beauty",
      title: "Verify your email",
      preview: "Your Natural Beauty verification code is ready.",
      body,
    }),
  };
}

export function passwordResetEmail({ recipient, token }) {
  const link = `${process.env.STOREFRONT_URL || "http://localhost:5173"}/reset-password?token=${encodeURIComponent(token)}`;
  const body = `${paragraph("We received a request to reset your Natural Beauty password.")}${paragraph("This secure link expires in 30 minutes and can only be used once.")}${button("Choose a new password", link)}${paragraph("If you did not request this, you can safely ignore this email.")}`;
  return {
    eventType: "customer.password_reset",
    to: recipient,
    subject: "Reset your Natural Beauty password",
    text: `Reset your password within 30 minutes: ${link}`,
    html: shell({
      eyebrow: "Account recovery",
      title: "Choose a new password",
      preview: "Your secure password reset link is ready.",
      body,
    }),
  };
}

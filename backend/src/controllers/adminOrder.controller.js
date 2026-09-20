import { pool } from "../config/database.js";
import * as s from "../services/adminOrder.service.js";
import { orderStatusEmail, sendEmail } from "../services/mail.service.js";
import PDFDocument from "pdfkit";
const w = (f) => (req, res, next) => f(req, res).catch(next);
export const list = w(async (req, res) =>
  res.json({ data: await s.list(pool, req.query) }),
);
export const summary = w(async (req, res) =>
  res.json({ data: await s.summary(pool) }),
);
export const detail = w(async (req, res) =>
  res.json({ data: await s.detail(pool, req.params.orderNumber) }),
);
export const status = w(async (req, res) => {
  const result = await s.updateStatus(
    pool,
    req.params.orderNumber,
    req.body.status,
    req.body.note,
    req.admin.id,
    req,
  );
  if (result.customer?.email)
    sendEmail(
      orderStatusEmail({
        order: result.order,
        recipient: result.customer.email,
        status: req.body.status,
        note: req.body.note,
      }),
    ).catch(() => {});
  res.json({ data: result });
});
export const shipping = w(async (req, res) =>
  res.json({
    data: await s.shipping(
      pool,
      req.params.orderNumber,
      req.body.courier,
      req.body.trackingId,
      req.admin.id,
      req,
    ),
  }),
);
export const returnState = w(async (req, res) => {
  const result = await s.updateReturn(
    pool,
    req.params.orderNumber,
    req.body.returnStatus,
    req.body.refundAmount,
    req.body.reason,
    req.admin.id,
    req,
  );
  if (result.customer?.email) {
    sendEmail(
      orderStatusEmail({
        order: result.order,
        recipient: result.customer.email,
        status: `return_${result.order.returnStatus}`,
        note: req.body.reason,
      }),
    ).catch(() => {});
  }
  res.json({ data: result });
});
export const invoice = w(async (req, res) => {
  const detail = await s.detail(pool, req.params.orderNumber);
  const document = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${detail.order.orderNumber}-invoice.pdf"`,
  );
  document.pipe(res);
  document.fontSize(22).text(detail.order.sellerLegalName || "Seller");
  document.fontSize(11).text("Tax invoice");
  document
    .fontSize(10)
    .text("Seller: " + (detail.order.sellerLegalName || "Seller"))
    .text("Address: " + (detail.order.sellerAddress || "Not configured"))
    .text(
      detail.order.sellerGstin
        ? "GSTIN: " + detail.order.sellerGstin
        : "GSTIN: Not configured",
    );
  document.moveDown();
  document.fontSize(14).text(`Order ${detail.order.orderNumber}`);
  document
    .fontSize(10)
    .text(`Placed ${new Date(detail.order.placedAt).toLocaleString("en-IN")}`);
  document.text(`Customer: ${detail.customer.email}`);
  document.moveDown();
  detail.items.forEach((item, index) => {
    document.text(
      `${index + 1}. ${item.product_name} | ${item.sku_code} | Qty ${item.quantity} | INR ${Number(item.line_subtotal).toFixed(2)} | HSN/SAC: ${item.hsn_sac || detail.pricing.tax?.hsnSac || "Not configured"}`,
    );
  });
  document.moveDown();
  document
    .fontSize(12)
    .text(`Subtotal: INR ${detail.pricing.subtotal.toFixed(2)}`);
  document.text(
    `Discounts: INR ${(detail.pricing.couponDiscount || 0).toFixed(2)}`,
  );
  document.text(`Shipping: INR ${detail.pricing.shipping.toFixed(2)}`);
  document.text(
    `${detail.pricing.tax?.label || "Tax"}: INR ${Number(detail.pricing.tax?.amount || 0).toFixed(2)}`,
  );
  document.text(
    `Place of supply: ${detail.pricing.tax?.placeOfSupply || "Not specified"} | HSN/SAC: ${detail.pricing.tax?.hsnSac || "Not configured"}`,
  );
  document
    .fontSize(15)
    .text(`Total: INR ${detail.pricing.grandTotal.toFixed(2)}`);
  document.end();
});

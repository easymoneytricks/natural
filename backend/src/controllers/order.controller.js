import { pool } from "../config/database.js";
import {
  listOrders,
  getOrder,
  placeCodOrder,
  trackPublicOrder,
} from "../services/order.service.js";
import rateLimit from "express-rate-limit";

export const trackOrder = [
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }),
  async (req, res, next) => {
    try {
      res.json({ data: await trackPublicOrder(pool, req.body || {}) });
    } catch (error) {
      next(error);
    }
  },
];
import { orderEmail, sendEmail } from "../services/mail.service.js";
import PDFDocument from "pdfkit";
export async function createOrder(req, res, next) {
  try {
    const order = await placeCodOrder(pool, req.body, req.customer);
    const customerEmail = req.body?.contact?.email || order.customerEmail;
    const customerName = req.body?.shippingAddress?.firstName;
    Promise.allSettled([
      customerEmail
        ? sendEmail(
            orderEmail({ order, recipient: customerEmail, name: customerName }),
          )
        : Promise.resolve(),
      process.env.ADMIN_NOTIFICATION_EMAIL
        ? sendEmail({
            ...orderEmail({
              order,
              recipient: process.env.ADMIN_NOTIFICATION_EMAIL,
              name: "team",
              admin: true,
            }),
            eventType: "order.received",
            subject: `New order received · ${order.orderNumber}`,
          })
        : Promise.resolve(),
    ]).catch(() => {});
    res.status(201).json({ data: { order } });
  } catch (e) {
    next(e);
  }
}
export async function customerOrders(req, res, next) {
  try {
    res.json({ data: await listOrders(pool, req.customer.id) });
  } catch (e) {
    next(e);
  }
}
export async function customerOrder(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT id FROM orders WHERE order_number=? AND customer_id=?",
      [req.params.orderNumber, req.customer.id],
    );
    if (!rows[0]) {
      const e = new Error("Order not found.");
      e.statusCode = 404;
      e.code = "ORDER_NOT_FOUND";
      throw e;
    }
    res.json({
      data: { order: await getOrder(pool, rows[0].id, req.customer.id) },
    });
  } catch (e) {
    next(e);
  }
}

export async function customerInvoice(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT id FROM orders WHERE order_number=? AND customer_id=?",
      [req.params.orderNumber, req.customer.id],
    );
    if (!rows[0]) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      error.code = "ORDER_NOT_FOUND";
      throw error;
    }

    const order = await getOrder(pool, rows[0].id, req.customer.id);
    const document = new PDFDocument({ size: "A4", margin: 48 });
    const money = (value) => `INR ${Number(value || 0).toFixed(2)}`;
    const address = order.shippingAddress || {};
    const customerName = [req.customer.first_name, req.customer.last_name]
      .filter(Boolean)
      .join(" ");
    const fullAddress = [
      [address.first_name, address.last_name].filter(Boolean).join(" "),
      address.address_line_1,
      address.address_line_2,
      [address.city, address.state, address.postal_code]
        .filter(Boolean)
        .join(", "),
      address.country,
    ]
      .filter(Boolean)
      .join("\n");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${order.orderNumber}-invoice.pdf"`,
    );
    document.pipe(res);

    document
      .fillColor("#294936")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Natural Beauty");
    document
      .fillColor("#68766c")
      .fontSize(9)
      .font("Helvetica")
      .text("BOTANICAL SKINCARE · MODERN SCIENCE");
    document.moveDown(1.5);
    document
      .fillColor("#202521")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("INVOICE");
    document.fontSize(10).font("Helvetica").fillColor("#526057");
    document.text(`Order ${order.orderNumber}`);
    document.text(
      `Placed ${new Date(order.placedAt).toLocaleDateString("en-IN")}`,
    );
    document.moveDown(1.5);

    const infoTop = document.y;
    const taxSnapshot = order.pricing.tax || {};
    document
      .fillColor("#294936")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("SUPPLIER", 48, infoTop);
    document
      .fillColor("#202521")
      .fontSize(10)
      .font("Helvetica")
      .text(taxSnapshot.sellerLegalName || "Natural Beauty", 48, infoTop + 16, {
        width: 220,
      })
      .fillColor("#68766c")
      .fontSize(9)
      .text(
        taxSnapshot.sellerAddress || "Registered address pending",
        48,
        infoTop + 33,
        {
          width: 220,
        },
      );
    document
      .fillColor("#68766c")
      .fontSize(9)
      .text(
        taxSnapshot.sellerGstin
          ? `GSTIN: ${taxSnapshot.sellerGstin}`
          : "GSTIN: Not configured",
        48,
        infoTop + 52,
        { width: 220 },
      );
    document
      .fillColor("#294936")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("BILLED TO", 320, infoTop);
    document
      .fillColor("#202521")
      .fontSize(10)
      .font("Helvetica")
      .text(customerName || req.customer.email || "", 320, infoTop + 16, {
        width: 220,
      });
    document
      .fillColor("#68766c")
      .fontSize(9)
      .text(req.customer.email || "", 320, infoTop + 33, { width: 220 });
    document
      .fillColor("#294936")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("DELIVERING TO", 320, infoTop + 52);
    document
      .fillColor("#202521")
      .fontSize(10)
      .font("Helvetica")
      .text(fullAddress || "Address not provided", 320, infoTop + 68, {
        width: 220,
        lineGap: 3,
      });
    document.y = Math.max(document.y, infoTop + 132);
    document.moveDown(1);

    const tableTop = document.y;
    document.rect(48, tableTop, 499, 26).fill("#edf2eb");
    document.fillColor("#294936").fontSize(9).font("Helvetica-Bold");
    document.text("ITEM", 60, tableTop + 9);
    document.text("QTY", 370, tableTop + 9);
    document.text("AMOUNT", 445, tableTop + 9);
    let rowY = tableTop + 36;
    document.font("Helvetica").fontSize(10).fillColor("#202521");
    order.items.forEach((item) => {
      document.text(item.name, 60, rowY, { width: 285 });
      document
        .fillColor("#68766c")
        .fontSize(8)
        .text(`SKU ${item.sku}`, 60, rowY + 15);
      document
        .fillColor("#202521")
        .fontSize(10)
        .text(String(item.quantity), 370, rowY + 3);
      document.text(money(item.lineSubtotal), 445, rowY + 3);
      document
        .strokeColor("#d9dfd8")
        .moveTo(48, rowY + 34)
        .lineTo(547, rowY + 34)
        .stroke();
      rowY += 52;
    });
    document.y = rowY + 12;
    const totalsX = 340;
    document
      .fontSize(10)
      .fillColor("#526057")
      .text("Subtotal", totalsX, document.y);
    document.text(money(order.pricing.subtotal), 455, document.y, {
      width: 92,
      align: "right",
    });
    document.text("Discount", totalsX, document.y + 20);
    document.text(
      `- ${money(order.pricing.couponDiscount)}`,
      455,
      document.y + 20,
      { width: 92, align: "right" },
    );
    document.text("Shipping", totalsX, document.y + 40);
    document.text(money(order.pricing.shipping), 455, document.y + 40, {
      width: 92,
      align: "right",
    });
    document.text(order.pricing.tax?.label || "Tax", totalsX, document.y + 60);
    document.text(money(order.pricing.tax?.amount), 455, document.y + 60, {
      width: 92,
      align: "right",
    });
    document
      .strokeColor("#294936")
      .moveTo(totalsX, document.y + 85)
      .lineTo(547, document.y + 85)
      .stroke();
    document
      .fillColor("#294936")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Total", totalsX, document.y + 98);
    document.text(money(order.pricing.total), 430, document.y + 98, {
      width: 117,
      align: "right",
    });
    const tax = order.pricing.tax || {};
    const taxBreakdown =
      tax.type === "cgst_sgst"
        ? `CGST ${money(tax.cgst)} · SGST ${money(tax.sgst)}`
        : tax.type === "igst"
          ? `IGST ${money(tax.igst)}`
          : "Tax not applied";
    document
      .fillColor("#68766c")
      .font("Helvetica")
      .fontSize(9)
      .text(taxBreakdown, 48, document.y + 120)
      .text(tax.hsnSac ? `HSN / SAC: ${tax.hsnSac}` : "", 48, document.y + 135)
      .text(
        `Place of supply: ${tax.placeOfSupply || "Not specified"} · Reverse charge: ${tax.reverseCharge ? "Yes" : "No"}`,
        48,
        document.y + 150,
      )
      .text(
        `Payment: ${order.paymentMethod || "—"} · ${order.paymentStatus || "pending"}`,
        48,
        document.y + 170,
      );
    document
      .fillColor("#68766c")
      .fontSize(8)
      .text("Thank you for choosing thoughtful skincare.", 48, 770, {
        align: "center",
        width: 499,
      });
    document.end();
  } catch (error) {
    next(error);
  }
}

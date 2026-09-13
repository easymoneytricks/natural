import { pool } from "../config/database.js";
import * as s from "../services/adminOrder.service.js";
import { orderStatusEmail, sendEmail } from "../services/mail.service.js";
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

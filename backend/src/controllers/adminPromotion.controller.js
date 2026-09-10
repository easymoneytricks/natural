import { pool } from "../config/database.js";
import * as s from "../services/adminPromotion.service.js";
const w = (f) => (req, res, next) => f(req, res).catch(next);
export const coupons = w(async (req, res) =>
  res.json({ data: await s.coupons(pool, req.query) }),
);
export const saveCoupon = w(async (req, res) =>
  res.json({
    data: await s.saveCoupon(
      pool,
      req.body,
      req.params.id || null,
      req.admin.id,
      req,
    ),
  }),
);
export const giftCards = w(async (req, res) =>
  res.json({ data: await s.giftCards(pool) }),
);
export const generateGiftCard = w(async (req, res) =>
  res.status(201).json({
    data: await s.generateGiftCard(pool, req.body, req.admin.id, req),
  }),
);
export const giftDetail = w(async (req, res) =>
  res.json({ data: await s.giftDetail(pool, req.params.id) }),
);
export const giftStatus = w(async (req, res) =>
  res.json({
    data: await s.giftStatus(
      pool,
      req.params.id,
      req.body.status,
      req.admin.id,
      req,
    ),
  }),
);

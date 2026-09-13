import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminPromotion.controller.js";
import rateLimit from "express-rate-limit";
const r = Router();
r.use(requireAdminAuth);
const v = requireAdminPermission("promotions.view"),
  m = requireAdminPermission("promotions.manage");
const mutationLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
r.get("/promotions/coupons", v, c.coupons);
r.post("/promotions/coupons", mutationLimit, m, c.saveCoupon);
r.patch("/promotions/coupons/:id", mutationLimit, m, c.saveCoupon);
r.get("/promotions/gift-cards", v, c.giftCards);
r.post("/promotions/gift-cards", mutationLimit, m, c.generateGiftCard);
r.get("/promotions/gift-cards/:id", v, c.giftDetail);
r.patch("/promotions/gift-cards/:id/status", mutationLimit, m, c.giftStatus);
export default r;

import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminPromotion.controller.js";
import rateLimit from "express-rate-limit";
const r = Router();
r.use(requireAdminAuth);
const couponView = requireAdminPermission("promotions.coupons.view", "promotions.view"),
  couponCreate = requireAdminPermission("promotions.coupons.create", "promotions.create", "promotions.manage"),
  couponUpdate = requireAdminPermission("promotions.coupons.update", "promotions.update", "promotions.manage"),
  giftView = requireAdminPermission("promotions.gift-cards.view", "promotions.view"),
  giftCreate = requireAdminPermission("promotions.gift-cards.create", "promotions.create", "promotions.manage"),
  giftUpdate = requireAdminPermission("promotions.gift-cards.update", "promotions.update", "promotions.manage");
const mutationLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
r.get("/promotions/coupons", couponView, c.coupons);
r.post("/promotions/coupons", mutationLimit, couponCreate, c.saveCoupon);
r.patch("/promotions/coupons/:id", mutationLimit, couponUpdate, c.saveCoupon);
r.get("/promotions/gift-cards", giftView, c.giftCards);
r.post("/promotions/gift-cards", mutationLimit, giftCreate, c.generateGiftCard);
r.get("/promotions/gift-cards/:id", giftView, c.giftDetail);
r.patch("/promotions/gift-cards/:id/status", mutationLimit, giftUpdate, c.giftStatus);
export default r;

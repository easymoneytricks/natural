import { Router } from "express";
import rateLimit from "express-rate-limit";
import { optionalCustomerAuth } from "../middleware/optionalCustomerAuth.js";
import * as controller from "../controllers/giftCardPurchase.controller.js";

const router = Router();
const purchaseLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.get("/gift-cards/denominations", controller.denominations);
router.post(
  "/gift-cards/purchase",
  purchaseLimit,
  optionalCustomerAuth,
  controller.create,
);
router.get("/gift-cards/purchase/:orderNumber", controller.status);

export default router;

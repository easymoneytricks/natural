import { Router } from "express";
import { optionalCustomerAuth } from "../middleware/optionalCustomerAuth.js";
import {
  getQuote,
  getShippingMethods,
} from "../controllers/checkout.controller.js";
import { paymentMethods } from "../controllers/payment.controller.js";
import rateLimit from "express-rate-limit";
import { capture } from "../controllers/abandonedCheckout.controller.js";
const router = Router();
const quoteLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
router.get("/shipping-methods", getShippingMethods);
router.get("/payment-methods", paymentMethods);
router.post("/quote", quoteLimit, optionalCustomerAuth, getQuote);
router.post("/abandoned", quoteLimit, optionalCustomerAuth, capture);
export default router;

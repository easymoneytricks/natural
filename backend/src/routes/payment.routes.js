import { Router } from "express";
import {
  createRazorpayOrder,
  paymentMethods,
  verifyRazorpay,
  createCashfreeOrder,
  cashfreeWebhook,
  webhook,
} from "../controllers/payment.controller.js";
import rateLimit from "express-rate-limit";
const router = Router();
const paymentLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
router.get("/methods", paymentMethods);
router.post("/razorpay/create", paymentLimit, createRazorpayOrder);
router.post("/razorpay/verify", paymentLimit, verifyRazorpay);
router.post("/cashfree/create", paymentLimit, createCashfreeOrder);
export default router;
export { webhook, cashfreeWebhook };

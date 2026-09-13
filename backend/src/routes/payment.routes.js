import { Router } from "express";
import {
  createRazorpayOrder,
  paymentMethods,
  verifyRazorpay,
  createCashfreeOrder,
  cashfreeWebhook,
  webhook,
} from "../controllers/payment.controller.js";
const router = Router();
router.get("/methods", paymentMethods);
router.post("/razorpay/create", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpay);
router.post("/cashfree/create", createCashfreeOrder);
export default router;
export { webhook, cashfreeWebhook };

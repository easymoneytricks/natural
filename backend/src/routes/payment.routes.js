import { Router } from "express";
import {
  createRazorpayOrder,
  paymentMethods,
  verifyRazorpay,
  webhook,
} from "../controllers/payment.controller.js";
const router = Router();
router.get("/methods", paymentMethods);
router.post("/razorpay/create", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpay);
export default router;
export { webhook };

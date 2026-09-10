import { Router } from "express";
import { optionalCustomerAuth } from "../middleware/optionalCustomerAuth.js";
import {
  getQuote,
  getShippingMethods,
} from "../controllers/checkout.controller.js";
import { paymentMethods } from "../controllers/payment.controller.js";
const router = Router();
router.get("/shipping-methods", getShippingMethods);
router.get("/payment-methods", paymentMethods);
router.post("/quote", optionalCustomerAuth, getQuote);
export default router;

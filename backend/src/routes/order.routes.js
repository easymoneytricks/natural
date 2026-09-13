import { Router } from "express";
import { optionalCustomerAuth } from "../middleware/optionalCustomerAuth.js";
import { requireCustomerAuth } from "../middleware/customerAuth.js";
import rateLimit from "express-rate-limit";
import {
  createOrder,
  customerOrder,
  customerInvoice,
  customerOrders,
} from "../controllers/order.controller.js";
import { trackOrder } from "../controllers/order.controller.js";
const router = Router();
router.post("/track-order", trackOrder);
router.post(
  "/orders",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  optionalCustomerAuth,
  createOrder,
);
router.get("/customer/orders", requireCustomerAuth, customerOrders);
router.get(
  "/customer/orders/:orderNumber/invoice",
  requireCustomerAuth,
  customerInvoice,
);
router.get("/customer/orders/:orderNumber", requireCustomerAuth, customerOrder);
export default router;

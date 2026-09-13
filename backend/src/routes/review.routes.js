import { Router } from "express";
import { optionalCustomerAuth } from "../middleware/optionalCustomerAuth.js";
import { requireCustomerAuth } from "../middleware/customerAuth.js";
import * as controller from "../controllers/review.controller.js";

const router = Router();
router.get("/products/:slug/reviews", optionalCustomerAuth, controller.list);
router.post("/products/:slug/reviews", requireCustomerAuth, controller.create);
export default router;

import { Router } from "express";
import { requireCustomerAuth } from "../middleware/customerAuth.js";
import * as controller from "../controllers/customerGiftCard.controller.js";

const router = Router();
router.use(requireCustomerAuth);
router.get("/gift-cards", controller.list);
router.post("/gift-cards/claim", controller.claim);
export default router;

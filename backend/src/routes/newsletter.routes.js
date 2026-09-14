import { Router } from "express";
import rateLimit from "express-rate-limit";
import { subscribe } from "../controllers/newsletter.controller.js";

const router = Router();
router.post(
  "/newsletter-subscriptions",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  subscribe,
);

export default router;

import { Router } from "express";
import { create } from "../controllers/contact.controller.js";
import rateLimit from "express-rate-limit";

const router = Router();
router.post(
  "/contact-submissions",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  create,
);
export default router;

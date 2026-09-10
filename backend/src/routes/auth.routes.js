import { Router } from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import {
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.js";
import { requireCustomerAuth } from "../middleware/customerAuth.js";

const router = Router();
const sensitiveLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many attempts. Please try again later.",
      },
    }),
});

router.use(cookieParser());
router.post("/register", sensitiveLimit, register);
router.post("/login", sensitiveLimit, login);
router.post("/refresh", sensitiveLimit, refresh);
router.post("/logout", logout);
router.post("/logout-all", requireCustomerAuth, logoutAll);
router.get("/me", requireCustomerAuth, me);

export default router;

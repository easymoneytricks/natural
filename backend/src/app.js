import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import customerCommerceRoutes from "./routes/customerCommerce.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes, {
  cashfreeWebhook,
  webhook,
} from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminCatalogRoutes from "./routes/adminCatalog.routes.js";
import adminProductRoutes from "./routes/adminProduct.routes.js";
import adminInventoryRoutes from "./routes/adminInventory.routes.js";
import adminOrderRoutes from "./routes/adminOrder.routes.js";
import adminCustomerRoutes from "./routes/adminCustomer.routes.js";
import adminPromotionRoutes from "./routes/adminPromotion.routes.js";
import adminStaffRoutes from "./routes/adminStaff.routes.js";
import adminMediaRoutes from "./routes/adminMedia.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import adminContactRoutes from "./routes/adminContact.routes.js";
import adminSystemRoutes from "./routes/adminSystem.routes.js";
import storeSettingsRoutes from "./routes/storeSettings.routes.js";
import contentPageRoutes from "./routes/contentPage.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import seoRoutes from "./routes/seo.routes.js";
import adminRewardRoutes from "./routes/adminReward.routes.js";
import customerGiftCardRoutes from "./routes/customerGiftCard.routes.js";
import adminReviewRoutes from "./routes/adminReview.routes.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger.js";
import { csrfOriginGuard } from "./middleware/csrfOriginGuard.js";

export function createApp() {
  const backendRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const uploadsRoot = path.resolve(
    env.media.root || path.resolve(backendRoot, "storage", "uploads"),
  );
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", env.trustProxy);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": [
            "'self'",
            "https://www.google.com/recaptcha/",
            "https://www.gstatic.com/recaptcha/",
          ],
          "frame-src": ["'self'", "https://www.google.com/recaptcha/"],
          "style-src": ["'self'", "https:", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "https:"],
        },
      },
    }),
  );
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use((req, res, next) => {
    const requestId = req.get("x-request-id") || crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);
    const started = Date.now();
    res.on("finish", () =>
      logger.info("http.request", {
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - started,
      }),
    );
    next();
  });
  app.use(
    "/api/v1",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 600,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: {
        error: { code: "RATE_LIMITED", message: "Too many requests." },
      },
    }),
  );
  app.use(csrfOriginGuard);
  app.use((req, res, next) => {
    if (
      env.requireHttps &&
      !req.secure &&
      !req.path.startsWith("/api/health") &&
      !req.path.startsWith("/api/v1/webhooks/")
    )
      return res.status(400).json({
        error: {
          code: "HTTPS_REQUIRED",
          message: "HTTPS is required for this endpoint.",
        },
      });
    next();
  });
  app.post(
    "/api/v1/webhooks/razorpay",
    express.raw({ type: "application/json", limit: "1mb" }),
    (req, res, next) => {
      req.rawBody = req.body;
      try {
        req.body = JSON.parse(req.body.toString("utf8"));
      } catch {}
      webhook(req, res, next);
    },
  );
  app.post(
    "/api/v1/webhooks/cashfree",
    express.raw({ type: "application/json", limit: "1mb" }),
    (req, res, next) => {
      req.rawBody = req.body.toString("utf8");
      try {
        req.body = JSON.parse(req.rawBody);
      } catch {
        req.body = {};
      }
      cashfreeWebhook(req, res, next);
    },
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(seoRoutes);
  app.use("/api", healthRoutes);
  app.use("/api/v1", catalogRoutes);
  app.use("/api/v1", storeSettingsRoutes);
  app.use("/api/v1", contentPageRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/customer", customerRoutes);
  app.use("/api/v1/customer", customerCommerceRoutes);
  app.use("/api/v1/checkout", checkoutRoutes);
  app.use("/api/v1", orderRoutes);
  app.use("/api/v1", reviewRoutes);
  app.use("/api/v1", contactRoutes);
  app.use("/api/v1", newsletterRoutes);
  app.use("/api/v1/payments", paymentRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/admin", adminCatalogRoutes);
  app.use("/api/v1/admin", adminProductRoutes);
  app.use("/api/v1/admin", adminInventoryRoutes);
  app.use("/api/v1/admin", adminOrderRoutes);
  app.use("/api/v1/admin", adminCustomerRoutes);
  app.use("/api/v1/admin", adminPromotionRoutes);
  app.use("/api/v1/admin", adminStaffRoutes);
  app.use("/api/v1/admin", adminMediaRoutes);
  app.use("/api/v1/admin", adminContactRoutes);
  app.use("/api/v1/admin", adminSystemRoutes);
  app.use("/api/v1/customer", rewardRoutes);
  app.use("/api/v1/customer", customerGiftCardRoutes);
  app.use("/api/v1/admin", adminRewardRoutes);
  app.use("/api/v1/admin", adminReviewRoutes);
  app.use(
    "/uploads",
    express.static(uploadsRoot, {
      dotfiles: "deny",
      index: false,
      setHeaders: (res) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    }),
  );
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

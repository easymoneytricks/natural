import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as controller from "../controllers/adminSystem.controller.js";

const router = Router();
router.use(requireAdminAuth);
router.get(
  "/system/overview",
  requireAdminPermission("settings.view.detail", "settings.view"),
  controller.overview,
);
router.get(
  "/reports/summary",
  requireAdminPermission("reports.view", "dashboard.view"),
  controller.reports,
);
router.get(
  "/useful-info",
  requireAdminPermission("reports.useful-info.view", "reports.view", "dashboard.view"),
  controller.usefulInfo,
);
router.post(
  "/system/email-test",
  requireAdminPermission("settings.update", "settings.manage"),
  controller.testEmail,
);
export default router;

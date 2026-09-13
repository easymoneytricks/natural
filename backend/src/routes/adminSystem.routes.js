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
  requireAdminPermission("settings.view"),
  controller.overview,
);
router.get(
  "/reports/summary",
  requireAdminPermission("dashboard.view"),
  controller.reports,
);
router.get(
  "/useful-info",
  requireAdminPermission("dashboard.view"),
  controller.usefulInfo,
);
router.post(
  "/system/email-test",
  requireAdminPermission("settings.manage"),
  controller.testEmail,
);
export default router;

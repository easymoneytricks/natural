import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as controller from "../controllers/storeSettings.controller.js";
const router = Router();
router.get("/store-settings", controller.publicSettings);
router.get(
  "/admin/settings",
  requireAdminAuth,
  requireAdminPermission("settings.view"),
  controller.settings,
);
router.patch(
  "/admin/settings",
  requireAdminAuth,
  requireAdminPermission("settings.manage"),
  controller.update,
);
export default router;

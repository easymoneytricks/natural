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
  requireAdminPermission(
    "settings.general.view",
    "settings.content.view",
    "settings.commerce.view",
    "settings.security.view",
    "settings.view",
  ),
  controller.settings,
);
router.patch(
  "/admin/settings",
  requireAdminAuth,
  requireAdminPermission(
    "settings.general.update",
    "settings.content.update",
    "settings.commerce.update",
    "settings.security.update",
    "settings.critical.manage",
    "settings.manage",
  ),
  controller.update,
);
export default router;

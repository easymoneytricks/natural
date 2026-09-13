import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as controller from "../controllers/contentPage.controller.js";
const router = Router();
router.get("/pages/:slug", controller.publicPage);
router.get(
  "/admin/pages",
  requireAdminAuth,
  requireAdminPermission("content.view"),
  controller.list,
);
router.get(
  "/admin/pages/:id",
  requireAdminAuth,
  requireAdminPermission("content.view"),
  controller.detail,
);
router.post(
  "/admin/pages",
  requireAdminAuth,
  requireAdminPermission("content.manage"),
  controller.save,
);
router.patch(
  "/admin/pages/:id",
  requireAdminAuth,
  requireAdminPermission("content.manage"),
  controller.save,
);
export default router;

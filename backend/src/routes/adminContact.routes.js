import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as controller from "../controllers/adminContact.controller.js";

const router = Router();
router.use(
  requireAdminAuth,
  requireAdminPermission("contact.view", "customers.view"),
);
router.get("/contact-submissions", controller.list);
router.patch(
  "/contact-submissions/:id",
  requireAdminPermission("contact.update", "customers.manage"),
  controller.update,
);
export default router;

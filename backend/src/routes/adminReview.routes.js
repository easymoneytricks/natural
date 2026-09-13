import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as controller from "../controllers/adminReview.controller.js";

const router = Router();
router.use(requireAdminAuth);
router.get("/reviews", requireAdminPermission("reviews.view"), controller.list);
router.patch(
  "/reviews/:id/status",
  requireAdminPermission("reviews.manage"),
  controller.status,
);
export default router;

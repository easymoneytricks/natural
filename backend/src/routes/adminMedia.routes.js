import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import {
  list,
  remove,
  update,
  upload,
} from "../controllers/adminMedia.controller.js";
import { upload as uploadMiddleware } from "../services/mediaStorage.service.js";

const router = Router();
router.use(requireAdminAuth);
router.get("/media", requireAdminPermission("catalog.media.view", "catalog.view"), list);
router.delete("/media/:id", requireAdminPermission("catalog.media.delete", "catalog.manage"), remove);
router.patch("/media/:id", requireAdminPermission("catalog.media.update", "catalog.manage"), update);
router.post(
  "/media",
  requireAdminPermission("catalog.media.upload", "catalog.manage"),
  uploadMiddleware.single("image"),
  upload,
);
export default router;

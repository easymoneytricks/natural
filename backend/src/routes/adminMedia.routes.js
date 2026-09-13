import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import { list } from "../controllers/adminMedia.controller.js";

const router = Router();
router.use(requireAdminAuth);
router.get("/media", requireAdminPermission("catalog.view"), list);
export default router;

import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import { upload } from "../services/mediaStorage.service.js";
import * as c from "../controllers/adminCatalog.controller.js";
const router = Router();
router.use(requireAdminAuth);
for (const type of ["brands", "categories"]) {
  const base = `/${type}`;
  router.get(base, requireAdminPermission("catalog.view"), c.list(type));
  router.get(
    `${base}/:id`,
    requireAdminPermission("catalog.view"),
    c.detail(type),
  );
  router.post(base, requireAdminPermission("catalog.manage"), c.save(type));
  router.patch(
    `${base}/:id`,
    requireAdminPermission("catalog.manage"),
    c.save(type),
  );
  router.delete(
    `${base}/:id`,
    requireAdminPermission("catalog.manage"),
    c.remove(type),
  );
  router.post(
    `${base}/:id/restore`,
    requireAdminPermission("catalog.manage"),
    c.restore(type),
  );
  router.delete(
    `${base}/:id/permanent`,
    requireAdminPermission("catalog.manage"),
    c.permanent(type),
  );
  router.post(
    `${base}/:id/image`,
    requireAdminPermission("catalog.manage"),
    upload.single("image"),
    c.uploadImage(type),
  );
  router.delete(
    `${base}/:id/image`,
    requireAdminPermission("catalog.manage"),
    c.removeImage(type),
  );
}
export default router;

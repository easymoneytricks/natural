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
  const view = requireAdminPermission(`catalog.${type}.view`, "catalog.view");
  const create = requireAdminPermission(`catalog.${type}.create`, "catalog.manage");
  const update = requireAdminPermission(`catalog.${type}.update`, "catalog.manage");
  const remove = requireAdminPermission(`catalog.${type}.delete`, "catalog.manage");
  router.get(base, view, c.list(type));
  router.get(
    `${base}/:id`,
    view,
    c.detail(type),
  );
  router.post(base, create, c.save(type));
  router.patch(
    `${base}/:id`,
    update,
    c.save(type),
  );
  router.delete(
    `${base}/:id`,
    remove,
    c.remove(type),
  );
  router.post(
    `${base}/:id/restore`,
    update,
    c.restore(type),
  );
  router.delete(
    `${base}/:id/permanent`,
    remove,
    c.permanent(type),
  );
  router.post(
    `${base}/:id/image`,
    update,
    upload.single("image"),
    c.uploadImage(type),
  );
  router.delete(
    `${base}/:id/image`,
    remove,
    c.removeImage(type),
  );
}
export default router;

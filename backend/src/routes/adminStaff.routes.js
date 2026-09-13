import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as controller from "../controllers/adminStaff.controller.js";

const router = Router();
router.use(requireAdminAuth);
const view = requireAdminPermission("staff.view");
const manage = requireAdminPermission("staff.manage");

router.get("/staff/users", view, controller.users);
router.post("/staff/users", manage, controller.saveUser);
router.patch("/staff/users/:id", manage, controller.saveUser);
router.get("/staff/roles", view, controller.roles);
router.get("/staff/roles/:id", view, controller.roleDetail);
router.post("/staff/roles", manage, controller.saveRole);
router.patch("/staff/roles/:id", manage, controller.saveRole);
router.patch(
  "/staff/roles/:id/permissions",
  manage,
  controller.updateRolePermissions,
);
router.get("/staff/permissions", view, controller.permissions);

export default router;

import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as controller from "../controllers/adminStaff.controller.js";

const router = Router();
router.use(requireAdminAuth);
const userView = requireAdminPermission("staff.users.view", "staff.view"),
  userCreate = requireAdminPermission("staff.users.create", "staff.manage"),
  userUpdate = requireAdminPermission("staff.users.update", "staff.manage"),
  roleView = requireAdminPermission("staff.roles.view", "staff.view"),
  roleCreate = requireAdminPermission("staff.roles.create", "staff.manage"),
  roleUpdate = requireAdminPermission("staff.roles.update", "staff.manage"),
  permissionView = requireAdminPermission("staff.permissions.view", "staff.view"),
  permissionUpdate = requireAdminPermission("staff.permissions.update", "staff.manage");

router.get("/staff/users", userView, controller.users);
router.post("/staff/users", userCreate, controller.saveUser);
router.patch("/staff/users/:id", userUpdate, controller.saveUser);
router.get("/staff/roles", roleView, controller.roles);
router.get("/staff/roles/:id", roleView, controller.roleDetail);
router.post("/staff/roles", roleCreate, controller.saveRole);
router.patch("/staff/roles/:id", roleUpdate, controller.saveRole);
router.patch(
  "/staff/roles/:id/permissions",
  permissionUpdate,
  controller.updateRolePermissions,
);
router.get("/staff/permissions", permissionView, controller.permissions);

export default router;

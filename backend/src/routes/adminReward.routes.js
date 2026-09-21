import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import { customer, config, updateConfig } from "../controllers/adminReward.controller.js";
const r = Router();
r.use(requireAdminAuth);
r.get(
  "/rewards/config",
  requireAdminPermission("rewards.view", "customers.view"),
  config,
);
r.patch(
  "/rewards/config",
  requireAdminPermission("rewards.update", "customers.manage"),
  updateConfig,
);
r.get(
  "/customers/:customerId/rewards",
  requireAdminPermission("rewards.view", "customers.view"),
  customer,
);
export default r;

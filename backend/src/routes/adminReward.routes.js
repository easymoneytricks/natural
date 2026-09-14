import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import { customer, config, updateConfig } from "../controllers/adminReward.controller.js";
const r = Router();
r.use(requireAdminAuth);
r.get("/rewards/config", requireAdminPermission("customers.view"), config);
r.patch("/rewards/config", requireAdminPermission("customers.manage"), updateConfig);
r.get("/customers/:customerId/rewards", requireAdminPermission("customers.view"), customer);
export default r;

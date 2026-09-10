import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminInventory.controller.js";
const r = Router();
r.use(requireAdminAuth);
const v = requireAdminPermission("inventory.view"),
  m = requireAdminPermission("inventory.manage");
r.get("/inventory", v, c.list);
r.get("/inventory/summary", v, c.summary);
r.get("/inventory/:skuId", v, c.detail);
r.get("/inventory/:skuId/movements", v, c.movements);
r.post("/inventory/:skuId/adjust", m, c.adjust);
r.post("/inventory/:skuId/correct", m, c.correct);
r.patch("/inventory/:skuId/reorder-level", m, c.reorder);
export default r;

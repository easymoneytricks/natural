import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminOrder.controller.js";
const r = Router();
r.use(requireAdminAuth);
const v = requireAdminPermission("orders.view"),
  m = requireAdminPermission("orders.manage");
r.get("/orders", v, c.list);
r.get("/orders/summary", v, c.summary);
r.get("/orders/:orderNumber", v, c.detail);
r.patch("/orders/:orderNumber/status", m, c.status);
r.patch("/orders/:orderNumber/shipping", m, c.shipping);
export default r;

import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminOrder.controller.js";
const r = Router();
r.use(requireAdminAuth);
const v = requireAdminPermission("orders.view.detail", "orders.view"),
  m = requireAdminPermission("orders.update", "orders.manage"),
  returns = requireAdminPermission("orders.returns.manage", "orders.manage");
r.get("/orders", v, c.list);
r.get("/orders/summary", v, c.summary);
r.get("/orders/:orderNumber", v, c.detail);
r.patch("/orders/:orderNumber/status", m, c.status);
r.patch("/orders/:orderNumber/shipping", m, c.shipping);
r.patch("/orders/:orderNumber/return", returns, c.returnState);
r.get("/orders/:orderNumber/invoice", v, c.invoice);
export default r;

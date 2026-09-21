import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminCustomer.controller.js";
const r = Router();
r.use(requireAdminAuth);
const v = requireAdminPermission("customers.view.detail", "customers.view"),
  m = requireAdminPermission("customers.update", "customers.manage"),
  remove = requireAdminPermission("customers.delete", "customers.manage");
r.get("/customers", v, c.list);
r.get("/customers/summary", v, c.summary);
r.get("/customers/:id", v, c.detail);
r.patch("/customers/:id/status", m, c.status);
r.delete("/customers/:id", remove, c.remove);
r.post("/customers/:id/restore", m, c.restore);
r.delete("/customers/:id/permanent", remove, c.permanentlyRemove);
export default r;

import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminCustomer.controller.js";
const r = Router();
r.use(requireAdminAuth);
const v = requireAdminPermission("customers.view"),
  m = requireAdminPermission("customers.manage");
r.get("/customers", v, c.list);
r.get("/customers/summary", v, c.summary);
r.get("/customers/:id", v, c.detail);
r.patch("/customers/:id/status", m, c.status);
export default r;

import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminProduct.controller.js";
import * as e from "../controllers/adminProductExtras.controller.js";
const r = Router();
r.use(requireAdminAuth);
const view = requireAdminPermission("catalog.view"),
  manage = requireAdminPermission("catalog.manage");
r.get("/attributes", view, e.attrs);
r.get("/products", view, c.list);
r.get("/products/:id", view, c.detail);
r.post("/products", manage, c.save);
r.patch("/products/:id", manage, c.save);
r.delete("/products/:id", manage, e.remove);
r.post("/products/:id/restore", manage, e.restore);
r.put("/products/:id/content", manage, e.content);
r.post("/products/:id/media", manage, e.mediaUpload);
r.patch("/products/:id/media/:mediaId", manage, e.mediaUpdate);
r.delete("/products/:id/media/:mediaId", manage, e.mediaRemove);
r.post("/products/:productId/skus", manage, c.sku);
r.patch("/products/:productId/skus/:skuId", manage, c.sku);
r.delete("/products/:productId/skus/:skuId", manage, c.removeSku);
r.post("/products/:productId/skus/:skuId/restore", manage, c.restoreSku);
export default r;

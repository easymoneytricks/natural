import { Router } from "express";
import {
  requireAdminAuth,
  requireAdminPermission,
} from "../middleware/adminAuth.js";
import * as c from "../controllers/adminProduct.controller.js";
import * as e from "../controllers/adminProductExtras.controller.js";
const r = Router();
r.use(requireAdminAuth);
const view = requireAdminPermission("catalog.products.view", "catalog.view"),
  create = requireAdminPermission("catalog.products.create", "catalog.manage"),
  update = requireAdminPermission("catalog.products.update", "catalog.manage"),
  remove = requireAdminPermission("catalog.products.delete", "catalog.manage");
r.get("/attributes", view, e.attrs);
r.get("/products", view, c.list);
r.get("/products/:id", view, c.detail);
r.post("/products", create, c.save);
r.patch("/products/:id", update, c.save);
r.delete("/products/:id/permanent", remove, e.permanentlyRemove);
r.delete("/products/:id", remove, e.remove);
r.post("/products/:id/restore", update, e.restore);
r.put("/products/:id/content", update, e.content);
r.post("/products/:id/media", update, e.mediaUpload);
r.post("/products/:id/media/library", update, e.mediaAttach);
r.patch("/products/:id/media/:mediaId", update, e.mediaUpdate);
r.delete("/products/:id/media/:mediaId", remove, e.mediaRemove);
r.post("/products/:productId/skus", create, c.sku);
r.patch("/products/:productId/skus/:skuId", update, c.sku);
r.delete("/products/:productId/skus/:skuId", remove, c.removeSku);
r.post("/products/:productId/skus/:skuId/restore", update, c.restoreSku);
export default r;

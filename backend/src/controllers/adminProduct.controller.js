import { pool } from "../config/database.js";
import * as service from "../services/adminProduct.service.js";
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
export const list = wrap(async (req, res) =>
  res.json({
    data: await service.list(pool, {
      search: req.query.q,
      status: req.query.status,
      brand: req.query.brand,
      category: req.query.category,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit,
    }),
  }),
);
export const detail = wrap(async (req, res) =>
  res.json({ data: await service.detail(pool, req.params.id) }),
);
export const save = wrap(async (req, res) =>
  res.json({
    data: await service.save(
      pool,
      req.body,
      req.params.id || null,
      req.admin.id,
      req,
    ),
  }),
);
export const sku = wrap(async (req, res) =>
  res.json({
    data: await service.sku(
      pool,
      req.params.productId,
      req.body,
      req.params.skuId || null,
      req.admin.id,
      req,
    ),
  }),
);

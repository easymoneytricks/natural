import { pool } from "../config/database.js";
import * as service from "../services/contentPage.service.js";
const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);
export const publicPage = wrap(async (req, res) =>
  res.json({ data: await service.bySlug(pool, req.params.slug) }),
);
export const list = wrap(async (req, res) =>
  res.json({ data: await service.list(pool, req.query) }),
);
export const detail = wrap(async (req, res) =>
  res.json({ data: await service.detail(pool, req.params.id) }),
);
export const save = wrap(async (req, res) =>
  res.json({
    data: await service.save(pool, req.body, req.params.id, req.admin.id, req),
  }),
);

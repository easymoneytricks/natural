import { pool } from "../config/database.js";
import * as service from "../services/contact.service.js";

const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);
export const list = wrap(async (req, res) =>
  res.json({ data: await service.list(pool, req.query) }),
);
export const update = wrap(async (req, res) =>
  res.json({
    data: await service.update(
      pool,
      req.params.id,
      req.body,
      req.admin.id,
      req,
    ),
  }),
);

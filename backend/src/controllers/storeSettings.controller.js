import { pool } from "../config/database.js";
import * as service from "../services/storeSettings.service.js";
const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);
export const publicSettings = wrap(async (req, res) =>
  res.json({ data: await service.read(pool, true) }),
);
export const settings = wrap(async (req, res) =>
  res.json({ data: await service.read(pool) }),
);
export const update = wrap(async (req, res) =>
  res.json({ data: await service.update(pool, req.body, req.admin.id, req) }),
);

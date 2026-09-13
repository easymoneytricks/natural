import { pool } from "../config/database.js";
import * as service from "../services/contact.service.js";

const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);
export const create = wrap(async (req, res) =>
  res.status(201).json({ data: await service.create(pool, req.body) }),
);

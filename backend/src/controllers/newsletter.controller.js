import { pool } from "../config/database.js";
import * as service from "../services/newsletter.service.js";

const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);

export const subscribe = wrap(async (req, res) => {
  const result = await service.subscribe(pool, req.body);
  res.status(201).json({ data: result });
});

import { pool } from "../config/database.js";
import * as service from "../services/customerGiftCard.service.js";

export async function list(req, res, next) {
  try { res.json({ data: await service.list(pool, req.customer.id) }); } catch (error) { next(error); }
}
export async function claim(req, res, next) {
  try { res.status(201).json({ data: await service.claim(pool, req.customer.id, req.body?.code) }); } catch (error) { next(error); }
}

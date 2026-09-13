import { pool } from "../config/database.js";
import * as media from "../services/adminMedia.service.js";

export async function list(req, res, next) {
  try {
    res.json({ data: await media.list(pool, req.query) });
  } catch (error) {
    next(error);
  }
}

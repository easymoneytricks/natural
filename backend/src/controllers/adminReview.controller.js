import { pool } from "../config/database.js";
import * as service from "../services/review.service.js";

export async function list(req, res, next) {
  try {
    res.json({ data: await service.adminList(pool, req.query) });
  } catch (error) {
    next(error);
  }
}
export async function status(req, res, next) {
  try {
    res.json({
      data: await service.updateStatus(
        pool,
        req.params.id,
        req.body.status,
        req.body.note,
      ),
    });
  } catch (error) {
    next(error);
  }
}

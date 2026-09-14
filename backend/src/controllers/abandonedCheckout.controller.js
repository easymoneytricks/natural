import { pool } from "../config/database.js";
import * as service from "../services/abandonedCheckout.service.js";

export async function capture(req, res, next) {
  try {
    res.json({ data: await service.upsert(pool, req.body, req.customer) });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    res.json({ data: await service.list(pool, req.query) });
  } catch (error) {
    next(error);
  }
}

export async function detail(req, res, next) {
  try {
    const data = await service.detail(pool, req.params.id);
    if (!data)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Abandoned checkout not found.",
        },
      });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

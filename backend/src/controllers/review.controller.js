import { pool } from "../config/database.js";
import * as service from "../services/review.service.js";

export async function list(req, res, next) {
  try {
    res.json({ data: await service.listForProduct(pool, req.params.slug) });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json({
      data: await service.create(
        pool,
        req.customer.id,
        req.params.slug,
        req.body,
      ),
    });
  } catch (error) {
    next(error);
  }
}

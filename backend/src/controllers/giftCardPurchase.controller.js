import { pool } from "../config/database.js";
import { env } from "../config/env.js";
import * as service from "../services/giftCardPurchase.service.js";

export async function denominations(req, res, next) {
  try {
    res.json({ data: await service.denominations(pool) });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json({
      data: await service.createPurchase(
        pool,
        req.body || {},
        req.customer,
        env.auth.accessSecret,
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function status(req, res, next) {
  try {
    res.json({
      data: await service.status(
        pool,
        req.params.orderNumber,
        req.query.email,
        env.auth.accessSecret,
      ),
    });
  } catch (error) {
    next(error);
  }
}

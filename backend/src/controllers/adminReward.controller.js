import { pool } from "../config/database.js";
import * as s from "../services/reward.service.js";
export const customer = async (req, res, next) => {
  try {
    res.json({ data: await s.adminList(pool, req.params.customerId) });
  } catch (e) {
    next(e);
  }
};
export const config = async (req, res, next) => {
  try {
    const [[r]] = await pool.execute(
      "SELECT enabled,points_per_rupee,rupees_per_point,min_points_to_redeem,max_redemption_percent,expiry_enabled,expiry_days FROM reward_config WHERE id=1",
    );
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
};
export const updateConfig = async (req, res, next) => {
  try {
    res.json({ data: await s.updateConfig(pool, req.body || {}) });
  } catch (e) {
    next(e);
  }
};

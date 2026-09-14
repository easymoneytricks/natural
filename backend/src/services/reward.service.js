import { AuthError } from "./auth.service.js";
const fail = (s, c, m) => {
  throw new AuthError(s, c, m);
};
export async function account(pool, customerId) {
  await pool.execute(
    "INSERT INTO reward_accounts(customer_id) VALUES(?) ON DUPLICATE KEY UPDATE customer_id=VALUES(customer_id)",
    [customerId],
  );
  await expirePoints(pool, customerId);
  const [[a]] = await pool.execute(
    "SELECT available_points,lifetime_earned,lifetime_redeemed FROM reward_accounts WHERE customer_id=?",
    [customerId],
  );
  const [t] = await pool.execute(
    "SELECT r.transaction_type,r.points,r.note,r.created_at FROM reward_transactions r JOIN reward_accounts a ON a.id=r.reward_account_id WHERE a.customer_id=? ORDER BY r.created_at DESC LIMIT 50",
    [customerId],
  );
  return {
    availablePoints: Number(a.available_points),
    lifetimeEarned: Number(a.lifetime_earned),
    lifetimeRedeemed: Number(a.lifetime_redeemed),
    transactions: t,
  };
}

async function expirePoints(pool, customerId) {
  const [[cfg]] = await pool.execute(
    "SELECT expiry_enabled FROM reward_config WHERE id=1",
  );
  if (!cfg?.expiry_enabled) return;
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const [expired] = await c.execute(
      "SELECT t.id,t.reward_account_id,t.points FROM reward_transactions t JOIN reward_accounts a ON a.id=t.reward_account_id WHERE a.customer_id=? AND t.transaction_type='earn' AND t.expires_at IS NOT NULL AND t.expires_at<=NOW() AND t.expired_at IS NULL AND t.points>0 FOR UPDATE",
      [customerId],
    );
    for (const row of expired) {
      await c.execute(
        'INSERT INTO reward_transactions(reward_account_id,transaction_type,points,note) VALUES(?,"expiry",?,?)',
        [row.reward_account_id, -row.points, `Expired earning #${row.id}`],
      );
      await c.execute(
        "UPDATE reward_accounts SET available_points=GREATEST(available_points-?,0) WHERE id=?",
        [row.points, row.reward_account_id],
      );
      await c.execute("UPDATE reward_transactions SET expired_at=NOW() WHERE id=?", [row.id]);
    }
    await c.commit();
  } catch (error) {
    await c.rollback();
    throw error;
  } finally {
    c.release();
  }
}
export async function adminList(pool, customerId) {
  return account(pool, customerId);
}
export async function updateConfig(pool, input) {
  const enabled = input.enabled === true || input.enabled === "true" || Number(input.enabled) === 1 ? 1 : 0;
  const expiryEnabled = input.expiryEnabled === true || input.expiryEnabled === "true" || Number(input.expiryEnabled) === 1 ? 1 : 0;
  const pointsPerRupee = Number(input.pointsPerRupee);
  const rupeesPerPoint = Number(input.rupeesPerPoint);
  const minPoints = Number(input.minPointsToRedeem);
  const maxPercent = Number(input.maxRedemptionPercent);
  const expiryDays = input.expiryDays === "" || input.expiryDays == null ? null : Number(input.expiryDays);
  if (!Number.isFinite(pointsPerRupee) || pointsPerRupee < 0)
    fail(400, "INVALID_REWARD_CONFIG", "Points per rupee must be zero or greater.");
  if (!Number.isFinite(rupeesPerPoint) || rupeesPerPoint <= 0)
    fail(400, "INVALID_REWARD_CONFIG", "The value of one point must be greater than zero.");
  if (!Number.isInteger(minPoints) || minPoints < 1)
    fail(400, "INVALID_REWARD_CONFIG", "Minimum redemption points must be at least 1.");
  if (!Number.isInteger(maxPercent) || maxPercent < 1 || maxPercent > 100)
    fail(400, "INVALID_REWARD_CONFIG", "Maximum redemption percentage must be between 1 and 100.");
  if (expiryEnabled && (!Number.isInteger(expiryDays) || expiryDays < 1))
    fail(400, "INVALID_REWARD_CONFIG", "Expiry days must be at least 1 when expiry is enabled.");
  await pool.execute(
    "UPDATE reward_config SET enabled=?,points_per_rupee=?,rupees_per_point=?,min_points_to_redeem=?,max_redemption_percent=?,expiry_enabled=?,expiry_days=? WHERE id=1",
    [enabled, pointsPerRupee, rupeesPerPoint, minPoints, maxPercent, expiryEnabled, expiryDays],
  );
  const [[config]] = await pool.execute("SELECT * FROM reward_config WHERE id=1");
  return config;
}
export async function earnForOrder(pool, customerId, orderId, amount) {
  const [[cfg]] = await pool.execute("SELECT * FROM reward_config WHERE id=1");
  if (!cfg?.enabled) return;
  const points = Math.floor(Number(amount) * Number(cfg.points_per_rupee));
  if (points <= 0) return;
  await pool.execute(
    "INSERT INTO reward_accounts(customer_id) VALUES(?) ON DUPLICATE KEY UPDATE customer_id=VALUES(customer_id)",
    [customerId],
  );
  const [[a]] = await pool.execute(
    "SELECT id FROM reward_accounts WHERE customer_id=?",
    [customerId],
  );
  try {
    const expiresAt = cfg.expiry_enabled && cfg.expiry_days
      ? new Date(Date.now() + Number(cfg.expiry_days) * 86400000)
      : null;
    await pool.execute(
      'INSERT INTO reward_transactions(reward_account_id,transaction_type,points,order_id,note,expires_at) VALUES(?,"earn",?,?,"Order reward",?)',
      [a.id, points, orderId, expiresAt],
    );
    await pool.execute(
      "UPDATE reward_accounts SET available_points=available_points+?,lifetime_earned=lifetime_earned+? WHERE id=?",
      [points, points, a.id],
    );
  } catch (e) {
    if (e.code !== "ER_DUP_ENTRY") throw e;
  }
}
export async function redeem(pool, customerId, points) {
  const [[cfg]] = await pool.execute("SELECT * FROM reward_config WHERE id=1");
  if (!cfg?.enabled)
    fail(409, "REWARDS_DISABLED", "Rewards are currently unavailable.");
  if (!Number.isInteger(points) || points < cfg.min_points_to_redeem)
    fail(
      400,
      "INVALID_REWARD_REDEMPTION",
      "Minimum points requirement not met.",
    );
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const [[a]] = await c.execute(
      "SELECT * FROM reward_accounts WHERE customer_id=? FOR UPDATE",
      [customerId],
    );
    if (!a || a.available_points < points)
      fail(409, "INSUFFICIENT_REWARD_POINTS", "Insufficient reward points.");
    await c.execute(
      "UPDATE reward_accounts SET available_points=available_points-?,lifetime_redeemed=lifetime_redeemed+? WHERE id=?",
      [points, points, a.id],
    );
    await c.execute(
      'INSERT INTO reward_transactions(reward_account_id,transaction_type,points,note) VALUES(?,"redeem",?,"Checkout redemption")',
      [a.id, -points],
    );
    await c.commit();
    return { points, discount: Number(points) * Number(cfg.rupees_per_point) };
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}

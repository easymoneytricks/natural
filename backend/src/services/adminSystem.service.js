export async function systemOverview(pool) {
  const [[database]] = await pool.execute(
    "SELECT 1 AS connected, VERSION() AS version, NOW() AS server_time",
  );
  const [[users]] = await pool.execute(
    "SELECT COUNT(*) AS total, SUM(status='active') AS active FROM admin_users WHERE deleted_at IS NULL",
  );
  const [[sessions]] = await pool.execute(
    "SELECT COUNT(*) AS active FROM admin_sessions WHERE revoked_at IS NULL AND expires_at>NOW()",
  );
  const [[audit]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM admin_audit_logs WHERE created_at>=DATE_SUB(NOW(),INTERVAL 24 HOUR)",
  );
  return {
    status: database.connected === 1 ? "operational" : "degraded",
    database: {
      connected: database.connected === 1,
      version: database.version,
      serverTime: database.server_time,
    },
    adminUsers: {
      total: Number(users.total),
      active: Number(users.active || 0),
    },
    activeSessions: Number(sessions.active),
    auditEventsLast24Hours: Number(audit.total),
    runtime: {
      node: process.version,
      environment: process.env.NODE_ENV || "development",
    },
  };
}

export async function reportSummary(pool, query = {}) {
  const days = Math.min(Math.max(Number(query.days) || 30, 7), 90);
  const [[totals]] = await pool.execute(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(grand_total),0) AS gross_revenue,
      COALESCE(SUM(CASE WHEN payment_status='paid' THEN grand_total ELSE 0 END),0) AS paid_revenue,
      COALESCE(SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END),0) AS cancelled
     FROM orders WHERE placed_at>=DATE_SUB(CURDATE(),INTERVAL ? DAY)`,
    [days],
  );
  const [[customers]] = await pool.execute(
    "SELECT COUNT(*) AS new_customers FROM customers WHERE created_at>=DATE_SUB(CURDATE(),INTERVAL ? DAY)",
    [days],
  );
  const [daily] = await pool.execute(
    `SELECT DATE(placed_at) AS date,COUNT(*) AS orders,COALESCE(SUM(grand_total),0) AS revenue
     FROM orders WHERE placed_at>=DATE_SUB(CURDATE(),INTERVAL ? DAY)
     GROUP BY DATE(placed_at) ORDER BY date`,
    [days],
  );
  const [statuses] = await pool.execute(
    "SELECT status,COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC",
  );
  return {
    days,
    totals: {
      orders: Number(totals.orders),
      grossRevenue: Number(totals.gross_revenue),
      paidRevenue: Number(totals.paid_revenue),
      cancelled: Number(totals.cancelled),
      newCustomers: Number(customers.new_customers),
    },
    daily: daily.map((row) => ({
      date: row.date,
      orders: Number(row.orders),
      revenue: Number(row.revenue),
    })),
    statuses: statuses.map((row) => ({
      status: row.status,
      count: Number(row.count),
    })),
  };
}

export async function usefulInfo(pool) {
  const [wishlisted] = await pool.execute(
    `SELECT p.id,p.name,p.slug,COUNT(*) wishlist_count,COUNT(DISTINCT wi.customer_id) shoppers
     FROM customer_wishlist_items wi JOIN products p ON p.id=wi.product_id
     WHERE p.deleted_at IS NULL GROUP BY p.id,p.name,p.slug
     ORDER BY wishlist_count DESC,shoppers DESC,p.name LIMIT 5`,
  );
  const [carted] = await pool.execute(
    `SELECT p.id,p.name,p.slug,SUM(ci.quantity) cart_quantity,COUNT(DISTINCT cc.customer_id) shoppers
     FROM customer_cart_items ci JOIN customer_carts cc ON cc.id=ci.cart_id
     JOIN product_skus ps ON ps.id=ci.sku_id JOIN products p ON p.id=ps.product_id
     WHERE p.deleted_at IS NULL AND ps.deleted_at IS NULL
     GROUP BY p.id,p.name,p.slug ORDER BY cart_quantity DESC,shoppers DESC,p.name LIMIT 5`,
  );
  const [[totals]] = await pool.execute(
    `SELECT (SELECT COUNT(*) FROM customer_wishlist_items) wishlist_lines,
      (SELECT COALESCE(SUM(quantity),0) FROM customer_cart_items) cart_units,
      (SELECT COUNT(DISTINCT customer_id) FROM customer_wishlist_items) wishlist_shoppers,
      (SELECT COUNT(DISTINCT cc.customer_id) FROM customer_cart_items ci JOIN customer_carts cc ON cc.id=ci.cart_id) cart_shoppers`,
  );
  return {
    totals: Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [key, Number(value || 0)]),
    ),
    mostWishlisted: wishlisted.map((row) => ({
      ...row,
      id: Number(row.id),
      wishlistCount: Number(row.wishlist_count),
      shoppers: Number(row.shoppers),
    })),
    mostInCart: carted.map((row) => ({
      ...row,
      id: Number(row.id),
      cartQuantity: Number(row.cart_quantity),
      shoppers: Number(row.shoppers),
    })),
  };
}

const parseMetadataJson = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "object")
    return Object.keys(value).length ? value : null;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && Object.keys(parsed).length
      ? parsed
      : null;
  } catch {
    return null;
  }
};

export async function list(pool, query = {}) {
  const where = ["1=1"];
  const values = [];
  if (query.q) {
    where.push(
      "(l.action LIKE ? OR l.entity_type LIKE ? OR l.entity_id LIKE ? OR u.email LIKE ?)",
    );
    values.push(`%${query.q}%`, `%${query.q}%`, `%${query.q}%`, `%${query.q}%`);
  }
  if (query.action) {
    where.push("l.action=?");
    values.push(query.action);
  }
  if (query.entity) {
    where.push("l.entity_type=?");
    values.push(query.entity);
  }
  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 100);
  const offset = Math.max(Number(query.offset) || 0, 0);
  const [rows] = await pool.execute(
    `SELECT l.id,l.action,l.entity_type,l.entity_id,l.metadata_json,l.ip_address,l.user_agent,l.created_at,
      u.first_name,u.last_name,u.email
     FROM admin_audit_logs l LEFT JOIN admin_users u ON u.id=l.admin_user_id
     WHERE ${where.join(" AND ")} ORDER BY l.created_at DESC,l.id DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );
  return rows.map((row) => ({
    id: Number(row.id),
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: parseMetadataJson(row.metadata_json),
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
    actor: row.email
      ? { name: `${row.first_name} ${row.last_name}`.trim(), email: row.email }
      : null,
  }));
}

export async function filters(pool) {
  const [actions] = await pool.execute(
    "SELECT DISTINCT action FROM admin_audit_logs ORDER BY action",
  );
  const [entities] = await pool.execute(
    "SELECT DISTINCT entity_type FROM admin_audit_logs WHERE entity_type IS NOT NULL ORDER BY entity_type",
  );
  return {
    actions: actions.map((row) => row.action),
    entities: entities.map((row) => row.entity_type),
  };
}

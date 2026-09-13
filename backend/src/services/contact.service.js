import { AuthError } from "./auth.service.js";

const fail = (status, code, message) => {
  throw new AuthError(status, code, message);
};

export async function create(pool, input) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  const message = String(input.message || "").trim();
  const orderNumber = String(input.orderNumber || "").trim() || null;
  if (name.length < 2 || name.length > 150)
    fail(400, "INVALID_NAME", "Please enter your name.");
  if (!/^\S+@\S+\.\S+$/.test(email))
    fail(400, "INVALID_EMAIL", "Please enter a valid email address.");
  if (message.length < 10 || message.length > 5000)
    fail(
      400,
      "INVALID_MESSAGE",
      "Message must be between 10 and 5000 characters.",
    );
  const [result] = await pool.execute(
    "INSERT INTO contact_submissions(name,email,order_number,message) VALUES(?,?,?,?)",
    [name, email, orderNumber, message],
  );
  return { id: Number(result.insertId), status: "new" };
}

export async function list(pool, query = {}) {
  const where = ["1=1"];
  const values = [];
  if (query.q) {
    where.push(
      "(name LIKE ? OR email LIKE ? OR order_number LIKE ? OR message LIKE ?)",
    );
    values.push(`%${query.q}%`, `%${query.q}%`, `%${query.q}%`, `%${query.q}%`);
  }
  if (query.status) {
    where.push("status=?");
    values.push(query.status);
  }
  const [rows] = await pool.execute(
    `SELECT id,name,email,order_number,message,status,admin_note,read_at,resolved_at,created_at,updated_at
     FROM contact_submissions WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT 100`,
    values,
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    orderNumber: row.order_number,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    readAt: row.read_at,
    resolvedAt: row.resolved_at,
  }));
}

export async function update(pool, id, input, adminId, req) {
  const status = String(input.status || "");
  if (!["new", "in_progress", "resolved", "spam"].includes(status))
    fail(400, "INVALID_STATUS", "Invalid contact status.");
  const [[row]] = await pool.execute(
    "SELECT id FROM contact_submissions WHERE id=?",
    [id],
  );
  if (!row) fail(404, "CONTACT_NOT_FOUND", "Contact submission not found.");
  await pool.execute(
    "UPDATE contact_submissions SET status=?,admin_note=?,read_at=COALESCE(read_at,NOW()),resolved_at=IF(?='resolved',COALESCE(resolved_at,NOW()),NULL) WHERE id=?",
    [status, String(input.adminNote || "").trim() || null, status, id],
  );
  await pool.execute(
    "INSERT INTO admin_audit_logs(admin_user_id,action,entity_type,entity_id,metadata_json,ip_address,user_agent) VALUES(?,?,?,?,?,?,?)",
    [
      adminId,
      "contact.updated",
      "contact_submissions",
      id,
      JSON.stringify({ status }),
      req.ip,
      String(req.get("user-agent") || "").slice(0, 500),
    ],
  );
  return (await list(pool)).find((entry) => entry.id === Number(id));
}

import { AuthError } from "./auth.service.js";
import { hashPassword } from "./adminAuth.service.js";
import { audit } from "./adminCatalog.service.js";

const fail = (status, code, message) => {
  throw new AuthError(status, code, message);
};

const normalizeRoles = (roles) => [
  ...new Set(
    (Array.isArray(roles) ? roles : []).map(Number).filter(Number.isInteger),
  ),
];

export async function users(pool, query = {}) {
  const values = [];
  const where = ["u.deleted_at IS NULL"];
  if (query.q) {
    where.push("(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)");
    values.push(`%${query.q}%`, `%${query.q}%`, `%${query.q}%`);
  }
  const [rows] = await pool.execute(
    `SELECT u.id,u.first_name,u.last_name,u.email,u.status,u.last_login_at,u.created_at,
      GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ', ') AS role_names,
      GROUP_CONCAT(r.id ORDER BY r.id SEPARATOR ',') AS role_ids
     FROM admin_users u
     LEFT JOIN admin_user_roles ur ON ur.admin_user_id=u.id
     LEFT JOIN admin_roles r ON r.id=ur.role_id AND r.deleted_at IS NULL
     WHERE ${where.join(" AND ")}
     GROUP BY u.id ORDER BY u.created_at DESC LIMIT 100`,
    values,
  );
  return rows.map((row) => ({
    id: Number(row.id),
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    status: row.status,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    roles: row.role_names ? row.role_names.split(", ") : [],
    roleIds: row.role_ids ? row.role_ids.split(",").map(Number) : [],
  }));
}

export async function roles(pool) {
  const [rows] = await pool.execute(
    `SELECT r.id,r.name,r.slug,r.description,r.is_system,r.created_at,
      COUNT(DISTINCT ur.admin_user_id) AS user_count,
      COUNT(DISTINCT rp.permission_id) AS permission_count
     FROM admin_roles r
     LEFT JOIN admin_user_roles ur ON ur.role_id=r.id
     LEFT JOIN admin_role_permissions rp ON rp.role_id=r.id
     WHERE r.deleted_at IS NULL GROUP BY r.id ORDER BY r.is_system DESC,r.name`,
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    system: Boolean(row.is_system),
    userCount: Number(row.user_count),
    permissionCount: Number(row.permission_count),
  }));
}

export async function permissions(pool) {
  const [rows] = await pool.execute(
    "SELECT id,name,slug,description FROM admin_permissions ORDER BY slug",
  );
  return rows.map((row) => ({ ...row, id: Number(row.id) }));
}

export async function roleDetail(pool, id) {
  const [[role]] = await pool.execute(
    "SELECT id,name,slug,description,is_system FROM admin_roles WHERE id=? AND deleted_at IS NULL",
    [id],
  );
  if (!role) fail(404, "ROLE_NOT_FOUND", "Role not found.");
  const [permissionRows] = await pool.execute(
    "SELECT permission_id FROM admin_role_permissions WHERE role_id=?",
    [id],
  );
  return {
    ...role,
    id: Number(role.id),
    system: Boolean(role.is_system),
    permissionIds: permissionRows.map((row) => Number(row.permission_id)),
  };
}

export async function saveUser(pool, input, id, actorId, req) {
  const firstName = String(input.firstName || "").trim();
  const lastName = String(input.lastName || "").trim();
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  const roleIds = normalizeRoles(input.roleIds);
  if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email))
    fail(400, "VALIDATION_ERROR", "Name and a valid email are required.");
  if (!id && String(input.password || "").length < 10)
    fail(400, "PASSWORD_TOO_SHORT", "Password must be at least 10 characters.");
  if (!roleIds.length) fail(400, "ROLE_REQUIRED", "Assign at least one role.");
  if (id && Number(id) === Number(actorId) && input.status === "disabled")
    fail(409, "CANNOT_DISABLE_SELF", "You cannot disable your own account.");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let userId = Number(id || 0);
    if (userId) {
      const [result] = await connection.execute(
        "UPDATE admin_users SET first_name=?,last_name=?,email=?,status=? WHERE id=? AND deleted_at IS NULL",
        [
          firstName,
          lastName,
          email,
          input.status === "disabled" ? "disabled" : "active",
          userId,
        ],
      );
      if (!result.affectedRows)
        fail(404, "USER_NOT_FOUND", "Admin user not found.");
      if (input.password) {
        if (String(input.password).length < 10)
          fail(
            400,
            "PASSWORD_TOO_SHORT",
            "Password must be at least 10 characters.",
          );
        await connection.execute(
          "UPDATE admin_users SET password_hash=? WHERE id=?",
          [await hashPassword(input.password), userId],
        );
      }
    } else {
      const [result] = await connection.execute(
        "INSERT INTO admin_users(first_name,last_name,email,password_hash,status) VALUES(?,?,?,?,?)",
        [
          firstName,
          lastName,
          email,
          await hashPassword(input.password),
          "active",
        ],
      );
      userId = Number(result.insertId);
    }
    await connection.execute(
      "DELETE FROM admin_user_roles WHERE admin_user_id=?",
      [userId],
    );
    for (const roleId of roleIds)
      await connection.execute(
        "INSERT INTO admin_user_roles(admin_user_id,role_id) VALUES(?,?)",
        [userId, roleId],
      );
    await connection.commit();
    await audit(
      pool,
      actorId,
      id ? "admin_user.updated" : "admin_user.created",
      "admin_users",
      userId,
      req,
    );
    return (await users(pool, { q: email })).find((user) => user.id === userId);
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY")
      fail(
        409,
        "EMAIL_EXISTS",
        "An admin user with this email already exists.",
      );
    throw error;
  } finally {
    connection.release();
  }
}

export async function saveRole(pool, input, id, actorId, req) {
  const name = String(input.name || "").trim();
  const slug = String(input.slug || name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!name || !slug) fail(400, "VALIDATION_ERROR", "Role name is required.");
  const roleIds = normalizeRoles(input.permissionIds);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let roleId = Number(id || 0);
    if (roleId) {
      const [[role]] = await connection.execute(
        "SELECT name,slug,is_system FROM admin_roles WHERE id=? AND deleted_at IS NULL",
        [roleId],
      );
      if (!role) fail(404, "ROLE_NOT_FOUND", "Role not found.");
      if (
        role.is_system &&
        ((input.slug && input.slug !== role.slug) ||
          (input.name && input.name !== role.name))
      )
        fail(409, "SYSTEM_ROLE_LOCKED", "System roles cannot be renamed.");
      await connection.execute(
        "UPDATE admin_roles SET name=?,slug=?,description=? WHERE id=?",
        [name, slug, input.description || null, roleId],
      );
    } else {
      const [result] = await connection.execute(
        "INSERT INTO admin_roles(name,slug,description,is_system) VALUES(?,?,?,0)",
        [name, slug, input.description || null],
      );
      roleId = Number(result.insertId);
    }
    await connection.execute(
      "DELETE FROM admin_role_permissions WHERE role_id=?",
      [roleId],
    );
    for (const permissionId of roleIds)
      await connection.execute(
        "INSERT INTO admin_role_permissions(role_id,permission_id) VALUES(?,?)",
        [roleId, permissionId],
      );
    await connection.commit();
    await audit(
      pool,
      actorId,
      id ? "admin_role.updated" : "admin_role.created",
      "admin_roles",
      roleId,
      req,
    );
    return roleDetail(pool, roleId);
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY")
      fail(409, "ROLE_SLUG_EXISTS", "That role slug already exists.");
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateRolePermissions(
  pool,
  id,
  permissionIds,
  actorId,
  req,
) {
  const detail = await roleDetail(pool, id);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "DELETE FROM admin_role_permissions WHERE role_id=?",
      [id],
    );
    for (const permissionId of normalizeRoles(permissionIds))
      await connection.execute(
        "INSERT INTO admin_role_permissions(role_id,permission_id) VALUES(?,?)",
        [id, permissionId],
      );
    await connection.commit();
    await audit(
      pool,
      actorId,
      "admin_role.permissions_updated",
      "admin_roles",
      id,
      req,
    );
    return roleDetail(pool, id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

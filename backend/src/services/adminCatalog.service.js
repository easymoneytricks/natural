import { AuthError } from "./auth.service.js";
import { removeManagedFile } from "./mediaStorage.service.js";
const slugify = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);
const fields = {
  brands: { table: "brands", path: "logo_path" },
  categories: { table: "categories", path: "image_path" },
};
const clientIp = (req) => req.ips?.[0] || req.ip || null;

async function audit(pool, adminId, action, entity, id, req, metadata = {}) {
  await pool.execute(
    "INSERT INTO admin_audit_logs (admin_user_id,action,entity_type,entity_id,metadata_json,ip_address,user_agent) VALUES (?,?,?,?,?,?,?)",
    [
      adminId,
      action,
      entity,
      String(id || ""),
      JSON.stringify(metadata && typeof metadata === "object" ? metadata : {}),
      clientIp(req),
      String(req.get("user-agent") || "").slice(0, 500),
    ],
  );
}
export async function list(pool, type, q = "", includeDeleted = false) {
  const f = fields[type];
  const search = q ? ` AND (name LIKE ? OR slug LIKE ?)` : "",
    params = q ? [`%${q}%`, `%${q}%`] : [];
  const lifecycle = includeDeleted
    ? " AND x.deleted_at IS NOT NULL"
    : " AND x.deleted_at IS NULL";
  const count =
    type === "brands"
      ? "(SELECT COUNT(*) FROM products p WHERE p.brand_id=x.id AND p.deleted_at IS NULL)"
      : "(SELECT COUNT(*) FROM product_categories pc JOIN products p ON p.id=pc.product_id WHERE pc.category_id=x.id AND p.deleted_at IS NULL)";
  const [rows] = await pool.execute(
    `SELECT x.*${type === "categories" ? ",parent.name AS parent_name,(SELECT GROUP_CONCAT(link.parent_id ORDER BY link.is_primary DESC,link.parent_id) FROM category_parent_links link WHERE link.category_id=x.id) AS parent_ids" : ""}, ${count} AS product_count${type === "categories" ? ",(SELECT COUNT(*) FROM category_parent_links child_link JOIN categories child ON child.id=child_link.category_id WHERE child_link.parent_id=x.id AND child.deleted_at IS NULL) AS child_count" : ""} FROM ${f.table} x${type === "categories" ? " LEFT JOIN categories parent ON parent.id=x.parent_id" : ""} WHERE 1=1${lifecycle}${search} ORDER BY x.deleted_at IS NULL DESC,x.sort_order,x.name`,
    params,
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    logo: row.logo_path || null,
    image: row.image_path || null,
    deletedAt: row.deleted_at || null,
    productCount: Number(row.product_count || 0),
    childCount: Number(row.child_count || 0),
    parentId: row.parent_id == null ? null : Number(row.parent_id),
    parentName: row.parent_name || null,
    parentIds: row.parent_ids
      ? row.parent_ids.split(",").map(Number)
      : row.parent_id == null
        ? []
        : [Number(row.parent_id)],
  }));
}
export async function save(pool, type, input, id, adminId, req) {
  const f = fields[type];
  const name = String(input.name || "").trim();
  const slug = slugify(input.slug || name);
  if (!name || !slug)
    throw new AuthError(400, "VALIDATION_ERROR", "Name is required.");
  const website = input.websiteUrl ? String(input.websiteUrl).trim() : null;
  if (website && !/^https?:\/\//i.test(website))
    throw new AuthError(
      400,
      "VALIDATION_ERROR",
      "Website URL must use http or https.",
    );
  let parentId = null;
  let parentIds = [];
  if (type === "categories" && (input.parentId || input.parentIds?.length)) {
    parentIds = [...new Set((input.parentIds || [input.parentId]).map(Number))].filter(Number.isInteger);
    parentId = parentIds[0] || null;
    for (const candidate of parentIds) {
      const [[p]] = await pool.execute(
        "SELECT id,deleted_at FROM categories WHERE id=?",
        [candidate],
      );
      if (!p || p.deleted_at)
        throw new AuthError(400, "INVALID_PARENT", "Parent category is unavailable.");
      if (id && candidate === Number(id))
        throw new AuthError(400, "CATEGORY_CYCLE", "A category cannot be its own parent.");
    }
    for (const candidate of parentIds) {
      let current = candidate;
      const seen = new Set();
      while (current && !seen.has(current)) {
        seen.add(current);
        const [[r]] = await pool.execute("SELECT parent_id FROM categories WHERE id=?", [current]);
        if (!r) break;
        if (id && Number(r.parent_id) === Number(id))
          throw new AuthError(400, "CATEGORY_CYCLE", "A category cannot be nested beneath its descendant.");
        current = r.parent_id;
      }
    }
  }
  /*
   * parentId remains the primary/legacy parent column. Additional parents are
   * synchronized into category_parent_links after the category is saved.
   */
  if (type === "categories" && !parentIds.length) parentIds = [];
  const table = f.table;
  const values =
    type === "brands"
      ? [
          name,
          slug,
          input.description || null,
          website,
          Boolean(input.isActive ?? true),
          Number(input.sortOrder || 0),
          input.seoTitle || null,
          input.seoDescription || null,
          input.seoKeywords || null,
          input.canonicalUrl || null,
        ]
      : [
          parentId,
          name,
          slug,
          input.description || null,
          Boolean(input.isActive ?? true),
          Number(input.sortOrder || 0),
          input.seoTitle || null,
          input.seoDescription || null,
          input.seoKeywords || null,
          input.canonicalUrl || null,
        ];
  try {
    if (id) {
      const cols =
        type === "brands"
          ? "name=?,slug=?,description=?,website_url=?,is_active=?,sort_order=?,seo_title=?,seo_description=?,seo_keywords=?,canonical_url=?"
          : "parent_id=?,name=?,slug=?,description=?,is_active=?,sort_order=?,seo_title=?,seo_description=?,seo_keywords=?,canonical_url=?";
      const [result] = await pool.execute(
        `UPDATE ${table} SET ${cols} WHERE id=? AND deleted_at IS NULL`,
        [...values, id],
      );
      if (!result.affectedRows)
        throw new AuthError(404, "NOT_FOUND", "Record not found.");
    } else {
      const cols =
        type === "brands"
          ? "name,slug,description,website_url,is_active,sort_order,seo_title,seo_description,seo_keywords,canonical_url"
          : "parent_id,name,slug,description,is_active,sort_order,seo_title,seo_description,seo_keywords,canonical_url";
      const [result] = await pool.execute(
        `INSERT INTO ${table} (${cols}) VALUES (${values.map(() => "?").join(",")})`,
        values,
      );
      if (type === "categories") id = result.insertId;
    }
    if (type === "categories") {
      await pool.execute("DELETE FROM category_parent_links WHERE category_id=?", [id]);
      for (const [index, candidate] of parentIds.entries())
        await pool.execute(
          "INSERT INTO category_parent_links (category_id,parent_id,is_primary) VALUES (?,?,?)",
          [id, candidate, index === 0 ? 1 : 0],
        );
    }
    const [rows] = await pool.execute(
      `SELECT * FROM ${table} WHERE slug=? LIMIT 1`,
      [slug],
    );
    await audit(
      pool,
      adminId,
      id ? `${type.slice(0, -1)}.updated` : `${type.slice(0, -1)}.created`,
      type,
      rows[0].id,
      req,
    );
    return rows[0];
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      throw new AuthError(
        409,
        "SLUG_ALREADY_EXISTS",
        "That slug is already in use.",
      );
    throw e;
  }
}
export async function softDelete(pool, type, id, adminId, req) {
  const table = fields[type].table;
  if (type === "categories") {
    const [[child]] = await pool.execute(
      "SELECT COUNT(*) count FROM categories WHERE parent_id=? AND deleted_at IS NULL",
      [id],
    );
    if (child.count)
      throw new AuthError(
        409,
        "CATEGORY_HAS_CHILDREN",
        "Remove or move child categories first.",
      );
  }
  const [[row]] = await pool.execute(
    `SELECT * FROM ${table} WHERE id=? AND deleted_at IS NULL`,
    [id],
  );
  if (!row) throw new AuthError(404, "NOT_FOUND", "Record not found.");
  await pool.execute(
    `UPDATE ${table} SET deleted_at=NOW(),is_active=0 WHERE id=?`,
    [id],
  );
  await audit(
    pool,
    adminId,
    `${type.slice(0, -1)}.soft_deleted`,
    type,
    id,
    req,
  );
}
export async function restore(pool, type, id, adminId, req) {
  const table = fields[type].table;
  const [[row]] = await pool.execute(
    `SELECT * FROM ${table} WHERE id=? AND deleted_at IS NOT NULL`,
    [id],
  );
  if (!row) throw new AuthError(404, "NOT_FOUND", "Record not found.");
  if (type === "categories" && row.parent_id) {
    const [[p]] = await pool.execute(
      "SELECT id,deleted_at FROM categories WHERE id=?",
      [row.parent_id],
    );
    if (!p || p.deleted_at)
      throw new AuthError(
        409,
        "INVALID_PARENT",
        "Restore the parent category first.",
      );
  }
  await pool.execute(
    `UPDATE ${table} SET deleted_at=NULL,is_active=1 WHERE id=?`,
    [id],
  );
  await audit(pool, adminId, `${type.slice(0, -1)}.restored`, type, id, req);
}
export async function permanentDelete(pool, type, id, adminId, req) {
  const table = fields[type].table;
  const [[count]] = await pool.execute(
    type === "brands"
      ? "SELECT COUNT(*) count FROM products WHERE brand_id=?"
      : "SELECT COUNT(*) count FROM product_categories WHERE category_id=?",
    [id],
  );
  if (Number(count.count))
    throw new AuthError(
      409,
      type === "brands" ? "BRAND_IN_USE" : "CATEGORY_IN_USE",
      "This record is still in use.",
    );
  if (type === "categories") {
    const [[child]] = await pool.execute(
      "SELECT COUNT(*) count FROM categories WHERE parent_id=?",
      [id],
    );
    if (Number(child.count))
      throw new AuthError(
        409,
        "CATEGORY_HAS_CHILDREN",
        "Remove child categories first.",
      );
  }
  const [[row]] = await pool.execute(`SELECT * FROM ${table} WHERE id=?`, [id]);
  if (!row) throw new AuthError(404, "NOT_FOUND", "Record not found.");
  await pool.execute(`DELETE FROM ${table} WHERE id=?`, [id]);
  await removeManagedFile(row[fields[type].path]);
  await audit(
    pool,
    adminId,
    `${type.slice(0, -1)}.permanently_deleted`,
    type,
    id,
    req,
  );
}
export { audit };

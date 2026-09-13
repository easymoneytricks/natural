import { AuthError } from "./auth.service.js";
import { audit } from "./adminCatalog.service.js";

const fail = (status, code, message) => {
  throw new AuthError(status, code, message);
};
const cleanSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const parseContent = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export async function list(pool, query = {}) {
  const where = ["1=1"];
  const values = [];
  if (query.q) {
    where.push("(title LIKE ? OR slug LIKE ?)");
    values.push(`%${query.q}%`, `%${query.q}%`);
  }
  if (query.status) {
    where.push("status=?");
    values.push(query.status);
  }
  const [rows] = await pool.execute(
    `SELECT id,slug,title,eyebrow,status,seo_title,updated_at,published_at FROM content_pages WHERE ${where.join(" AND ")} ORDER BY updated_at DESC LIMIT 100`,
    values,
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    seoTitle: row.seo_title,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }));
}

export async function detail(pool, id) {
  const [[row]] = await pool.execute("SELECT * FROM content_pages WHERE id=?", [
    id,
  ]);
  if (!row) fail(404, "PAGE_NOT_FOUND", "Page not found.");
  return {
    ...row,
    id: Number(row.id),
    content: parseContent(row.content_json),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

export async function bySlug(pool, slug) {
  const [[row]] = await pool.execute(
    "SELECT slug,title,eyebrow,intro,content_json,seo_title,seo_description FROM content_pages WHERE slug=? AND status='published'",
    [slug],
  );
  if (!row) fail(404, "PAGE_NOT_FOUND", "Page not found.");
  return {
    ...row,
    content: parseContent(row.content_json),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

export async function save(pool, input, id, adminId, req) {
  const title = String(input.title || "").trim();
  const slug = cleanSlug(input.slug || title);
  const content = Array.isArray(input.content) ? input.content : [];
  if (!title || !slug) fail(400, "VALIDATION_ERROR", "Page title is required.");
  if (
    !content.every((section) => Array.isArray(section) && section.length >= 2)
  )
    fail(400, "INVALID_CONTENT", "Each section needs a heading and body.");
  const status = ["draft", "published", "archived"].includes(input.status)
    ? input.status
    : "draft";
  try {
    if (id) {
      const [[previous]] = await pool.execute(
        "SELECT slug,title,intro,content_json,seo_title,seo_description,status FROM content_pages WHERE id=?",
        [id],
      );
      if (previous)
        await pool.execute(
          "INSERT INTO content_page_versions(page_id,slug,title,intro,content_json,seo_title,seo_description,status) VALUES(?,?,?,?,?,?,?,?)",
          [
            id,
            previous.slug,
            previous.title,
            previous.intro,
            previous.content_json,
            previous.seo_title,
            previous.seo_description,
            previous.status,
          ],
        );
      await pool.execute(
        "UPDATE content_pages SET slug=?,title=?,eyebrow=?,intro=?,content_json=?,seo_title=?,seo_description=?,status=?,published_at=IF(?='published',COALESCE(published_at,NOW()),NULL) WHERE id=?",
        [
          slug,
          title,
          input.eyebrow || null,
          input.intro || null,
          JSON.stringify(content),
          input.seoTitle || null,
          input.seoDescription || null,
          status,
          status,
          id,
        ],
      );
    } else
      await pool.execute(
        "INSERT INTO content_pages(slug,title,eyebrow,intro,content_json,seo_title,seo_description,status,published_at) VALUES(?,?,?,?,?,?,?,?,IF(?='published',NOW(),NULL))",
        [
          slug,
          title,
          input.eyebrow || null,
          input.intro || null,
          JSON.stringify(content),
          input.seoTitle || null,
          input.seoDescription || null,
          status,
          status,
        ],
      );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      fail(409, "SLUG_EXISTS", "That page slug already exists.");
    throw error;
  }
  const [[row]] = await pool.execute(
    "SELECT id FROM content_pages WHERE slug=?",
    [slug],
  );
  await audit(
    pool,
    adminId,
    id ? "content_page.updated" : "content_page.created",
    "content_pages",
    row.id,
    req,
  );
  return detail(pool, row.id);
}

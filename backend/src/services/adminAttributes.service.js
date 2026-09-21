import { AuthError } from "./auth.service.js";
import { audit } from "./adminCatalog.service.js";

const fail = (status, code, message) => { throw new AuthError(status, code, message); };
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);

export async function list(pool, includeInactive = true) {
  const [attributes] = await pool.execute(
    `SELECT id,name,slug,display_type,is_variant_axis,sort_order,is_active FROM attributes ${includeInactive ? "" : "WHERE is_active=1"} ORDER BY sort_order,id`,
  );
  for (const attribute of attributes) {
    const [values] = await pool.execute(
      `SELECT id,attribute_id,value,slug,display_value,metadata_json,sort_order,is_active FROM attribute_values WHERE attribute_id=? ${includeInactive ? "" : "AND is_active=1"} ORDER BY sort_order,id`,
      [attribute.id],
    );
    attribute.values = values.map((value) => ({
      ...value,
      metadata: typeof value.metadata_json === "string" ? (() => { try { return JSON.parse(value.metadata_json); } catch { return {}; } })() : (value.metadata_json || {}),
    }));
  }
  return attributes;
}

export async function create(pool, input, adminId, req) {
  const name = String(input?.name || "").trim();
  const slug = slugify(input?.slug || name);
  if (!name || !slug) fail(400, "INVALID_ATTRIBUTE", "Attribute name is required.");
  const displayType = ["button", "select", "swatch"].includes(input?.displayType) ? input.displayType : "button";
  try {
    const [result] = await pool.execute("INSERT INTO attributes(name,slug,display_type,is_variant_axis,sort_order,is_active) VALUES(?,?,?,?,?,?)", [name, slug, displayType, input?.isVariantAxis === false ? 0 : 1, Number(input?.sortOrder) || 0, input?.isActive === false ? 0 : 1]);
    await audit(pool, adminId, "catalog.attribute_created", "attributes", result.insertId, req);
    return (await list(pool, true)).find((item) => Number(item.id) === Number(result.insertId));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") fail(409, "ATTRIBUTE_EXISTS", "An attribute with this slug already exists.");
    throw error;
  }
}

export async function update(pool, id, input, adminId, req) {
  const [[attribute]] = await pool.execute("SELECT id FROM attributes WHERE id=?", [id]);
  if (!attribute) fail(404, "ATTRIBUTE_NOT_FOUND", "Attribute not found.");
  const fields = []; const values = [];
  if (input.name !== undefined) { fields.push("name=?"); values.push(String(input.name).trim()); }
  if (input.slug !== undefined) { fields.push("slug=?"); values.push(slugify(input.slug)); }
  if (input.displayType !== undefined && ["button", "select", "swatch"].includes(input.displayType)) { fields.push("display_type=?"); values.push(input.displayType); }
  if (input.isVariantAxis !== undefined) { fields.push("is_variant_axis=?"); values.push(input.isVariantAxis ? 1 : 0); }
  if (input.sortOrder !== undefined) { fields.push("sort_order=?"); values.push(Number(input.sortOrder) || 0); }
  if (input.isActive !== undefined) { fields.push("is_active=?"); values.push(input.isActive ? 1 : 0); }
  if (fields.length) await pool.execute(`UPDATE attributes SET ${fields.join(",")} WHERE id=?`, [...values, id]);
  await audit(pool, adminId, "catalog.attribute_updated", "attributes", id, req);
  return (await list(pool, true)).find((item) => Number(item.id) === Number(id));
}

export async function createValue(pool, attributeId, input, adminId, req) {
  const [[attribute]] = await pool.execute("SELECT id FROM attributes WHERE id=?", [attributeId]);
  if (!attribute) fail(404, "ATTRIBUTE_NOT_FOUND", "Attribute not found.");
  const value = String(input?.value || "").trim(); const slug = slugify(input?.slug || value);
  if (!value || !slug) fail(400, "INVALID_ATTRIBUTE_VALUE", "Attribute value is required.");
  try {
    const metadata = input?.colorHex ? JSON.stringify({ color: String(input.colorHex) }) : null;
    const [result] = await pool.execute("INSERT INTO attribute_values(attribute_id,value,slug,display_value,metadata_json,sort_order,is_active) VALUES(?,?,?,?,?,?,?)", [attributeId, value, slug, String(input?.displayValue || value).trim(), metadata, Number(input?.sortOrder) || 0, input?.isActive === false ? 0 : 1]);
    await audit(pool, adminId, "catalog.attribute_value_created", "attribute_values", result.insertId, req);
    return (await list(pool, true)).find((item) => Number(item.id) === Number(attributeId));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") fail(409, "ATTRIBUTE_VALUE_EXISTS", "This value already exists for the attribute.");
    throw error;
  }
}

export async function updateValue(pool, id, input, adminId, req) {
  const [[value]] = await pool.execute("SELECT id,attribute_id FROM attribute_values WHERE id=?", [id]);
  if (!value) fail(404, "ATTRIBUTE_VALUE_NOT_FOUND", "Attribute value not found.");
  const fields = []; const values = [];
  if (input.value !== undefined) { fields.push("value=?"); values.push(String(input.value).trim()); }
  if (input.slug !== undefined) { fields.push("slug=?"); values.push(slugify(input.slug)); }
  if (input.displayValue !== undefined) { fields.push("display_value=?"); values.push(String(input.displayValue).trim()); }
  if (input.colorHex !== undefined) { fields.push("metadata_json=?"); values.push(JSON.stringify({ color: String(input.colorHex || "") })); }
  if (input.sortOrder !== undefined) { fields.push("sort_order=?"); values.push(Number(input.sortOrder) || 0); }
  if (input.isActive !== undefined) { fields.push("is_active=?"); values.push(input.isActive ? 1 : 0); }
  if (fields.length) await pool.execute(`UPDATE attribute_values SET ${fields.join(",")} WHERE id=?`, [...values, id]);
  await audit(pool, adminId, "catalog.attribute_value_updated", "attribute_values", id, req);
  return (await list(pool, true)).find((item) => Number(item.id) === Number(value.attribute_id));
}

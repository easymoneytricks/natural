import { AuthError } from "./auth.service.js";
import { saveUpload, removeManagedFile } from "./mediaStorage.service.js";
import { audit } from "./adminCatalog.service.js";
import { productTransaction } from "./productTransaction.js";
import { validateSkuAttributes } from "./sku.service.js";
const fail = (s, c, m) => {
  throw new AuthError(s, c, m);
};
export async function syncContent(pool, id, input, adminId, req) {
  return productTransaction(pool, id, (connection) => writeContent(connection, id, input, adminId, req));
}

export async function writeContent(pool, id, input, adminId, req) {
  for (const table of ["product_benefits", "product_ingredients"]) {
    const key = table === "product_benefits" ? "benefits" : "ingredients";
    if (Array.isArray(input[key])) {
      await pool.execute(`DELETE FROM ${table} WHERE product_id=?`, [id]);
      for (const [i, x] of input[key].entries()) {
        if (table === "product_benefits")
          await pool.execute(
            "INSERT INTO product_benefits(product_id,benefit,sort_order) VALUES(?,?,?)",
            [id, String(x.benefit || x).trim(), i],
          );
        else
          await pool.execute(
            "INSERT INTO product_ingredients(product_id,name,description,is_key,sort_order) VALUES(?,?,?,?,?)",
            [
              id,
              String(x.name || "").trim(),
              x.description || null,
              !!(x.isKey ?? x.is_key),
              i,
            ],
          );
      }
    }
  }
  if (Array.isArray(input.attributes)) {
    await pool.execute(
      "DELETE FROM product_attribute_values WHERE product_id=?",
      [id],
    );
    await pool.execute("DELETE FROM product_attributes WHERE product_id=?", [
      id,
    ]);
    for (const [i, a] of input.attributes.entries()) {
      const [[attribute]] = await pool.execute("SELECT id FROM attributes WHERE id=?", [a.attributeId]);
      if (!attribute) fail(400, "INVALID_ATTRIBUTE", "Unknown product attribute.");
      await pool.execute(
        "INSERT INTO product_attributes(product_id,attribute_id,sort_order,is_required) VALUES(?,?,?,?)",
        [id, a.attributeId, i, a.isRequired !== false],
      );
      for (const [j, v] of (a.values || []).entries()) {
        const valueId = v.valueId ?? v.id ?? v;
        const [[value]] = await pool.execute("SELECT id FROM attribute_values WHERE id=? AND attribute_id=?", [valueId, a.attributeId]);
        if (!value) fail(400, "INVALID_ATTRIBUTE_VALUE", "Value does not belong to the chosen attribute.");
        await pool.execute(
          "INSERT INTO product_attribute_values(product_id,attribute_id,attribute_value_id,sort_order) VALUES(?,?,?,?)",
          [id, a.attributeId, valueId, j],
        );
      }
    }
    const [skus] = await pool.execute("SELECT id FROM product_skus WHERE product_id=? AND deleted_at IS NULL", [id]);
    for (const sku of skus) {
      const [assignments] = await pool.execute("SELECT attribute_id AS attributeId,attribute_value_id AS attributeValueId FROM sku_attribute_values WHERE sku_id=?", [sku.id]);
      try { await validateSkuAttributes(pool, id, assignments); }
      catch { fail(409, "SKU_ATTRIBUTE_CONFLICT", "These allowed values would invalidate an existing SKU. Update or archive that SKU first."); }
    }
  }
  await audit(pool, adminId, "product.content_updated", "products", id, req);
  return { success: true };
}
export async function mediaUpload(pool, id, file, adminId, req) {
  if (!file) fail(400, "INVALID_FILE", "An image is required.");
  const [[p]] = await pool.execute(
    "SELECT id FROM products WHERE id=? AND deleted_at IS NULL",
    [id],
  );
  if (!p) fail(404, "PRODUCT_NOT_FOUND", "Product not found.");
  const path = await saveUpload(file, "products");
  const [[count]] = await pool.execute(
    "SELECT COUNT(*) n FROM product_media WHERE product_id=? AND deleted_at IS NULL",
    [id],
  );
  const [r] = await pool.execute(
    'INSERT INTO product_media(product_id,media_type,file_path,alt_text,sort_order,is_primary) VALUES(?,"image",?,?,?,?)',
    [
      id,
      path,
      file.originalname?.slice(0, 255) || null,
      count.n ? Number(count.n) : 0,
      count.n ? 0 : 1,
    ],
  );
  await audit(
    pool,
    adminId,
    "product.media_uploaded",
    "product_media",
    r.insertId,
    req,
  );
  return { id: r.insertId, path, file_path: path, isPrimary: !count.n };
}
export async function mediaUpdate(pool, id, input, adminId, req) {
  const [[m]] = await pool.execute(
    "SELECT * FROM product_media WHERE id=? AND product_id=? AND deleted_at IS NULL",
    [input.mediaId, id],
  );
  if (!m) fail(404, "MEDIA_NOT_FOUND", "Media not found.");
  if (input.primary) {
    await pool.execute(
      "UPDATE product_media SET is_primary=0 WHERE product_id=?",
      [id],
    );
  }
  await pool.execute(
    "UPDATE product_media SET sort_order=?,alt_text=?,is_primary=? WHERE id=?",
    [
      Number(input.sortOrder || 0),
      input.altText || null,
      input.primary ? 1 : 0,
      input.mediaId,
    ],
  );
  await audit(
    pool,
    adminId,
    input.primary ? "product.primary_media_changed" : "product.media_reordered",
    "product_media",
    input.mediaId,
    req,
  );
  return { success: true };
}
export async function mediaRemove(pool, id, mediaId, adminId, req) {
  const [[m]] = await pool.execute(
    "SELECT * FROM product_media WHERE id=? AND product_id=? AND deleted_at IS NULL",
    [mediaId, id],
  );
  if (!m) fail(404, "MEDIA_NOT_FOUND", "Media not found.");
  await pool.execute(
    "UPDATE product_media SET deleted_at=NOW(),is_primary=0 WHERE id=?",
    [mediaId],
  );
  const [[p]] = await pool.execute(
    "SELECT id FROM product_media WHERE product_id=? AND deleted_at IS NULL ORDER BY sort_order,id LIMIT 1",
    [id],
  );
  if (p)
    await pool.execute("UPDATE product_media SET is_primary=1 WHERE id=?", [
      p.id,
    ]);
  await removeManagedFile(m.file_path);
  await audit(
    pool,
    adminId,
    "product.media_removed",
    "product_media",
    mediaId,
    req,
  );
  return { success: true };
}
export async function attributes(pool) {
  const [a] = await pool.execute(
    "SELECT id,name,slug,display_type,sort_order FROM attributes WHERE is_active=1 ORDER BY sort_order,id",
  );
  for (const x of a) {
    const [v] = await pool.execute(
      "SELECT id,attribute_id,value,slug,display_value,sort_order FROM attribute_values WHERE attribute_id=? AND is_active=1 ORDER BY sort_order,id",
      [x.id],
    );
    x.values = v;
  }
  return a;
}
export async function removeProduct(pool, id, adminId, req) {
  const [[p]] = await pool.execute(
    "SELECT id FROM products WHERE id=? AND deleted_at IS NULL",
    [id],
  );
  if (!p) fail(404, "PRODUCT_NOT_FOUND", "Product not found.");
  await pool.execute(
    'UPDATE products SET deleted_at=NOW(),is_active=0,status="archived" WHERE id=?',
    [id],
  );
  await audit(pool, adminId, "product.soft_deleted", "products", id, req);
}
export async function restoreProduct(pool, id, adminId, req) {
  const [[p]] = await pool.execute(
    "SELECT id FROM products WHERE id=? AND deleted_at IS NOT NULL",
    [id],
  );
  if (!p) fail(404, "PRODUCT_NOT_FOUND", "Product not found.");
  await pool.execute(
    'UPDATE products SET deleted_at=NULL,is_active=1,status="draft" WHERE id=?',
    [id],
  );
  await audit(pool, adminId, "product.restored", "products", id, req);
}

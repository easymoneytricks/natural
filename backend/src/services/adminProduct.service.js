import { AuthError } from "./auth.service.js";
import { normalizeCombination, validateSkuAttributes } from "./sku.service.js";
import { audit as catalogAudit } from "./adminCatalog.service.js";
const slugify = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 190);
const fail = (s, c, m) => {
  throw new AuthError(s, c, m);
};
export async function list(pool, q = {}) {
  const where = ["p.deleted_at IS NULL"],
    args = [];
  if (q.search) {
    where.push("(p.name LIKE ? OR p.slug LIKE ?)");
    args.push(`%${q.search}%`, `%${q.search}%`);
  }
  if (q.status) {
    where.push("p.status=?");
    args.push(q.status);
  }
  if (q.brand) {
    where.push("b.slug=?");
    args.push(q.brand);
  }
  if (q.category) {
    where.push(
      "EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON c.id=pc.category_id WHERE pc.product_id=p.id AND c.slug=?)",
    );
    args.push(q.category);
  }
  const sort =
    {
      updated_desc: "p.updated_at DESC",
      name: "p.name ASC",
      newest: "p.created_at DESC",
    }[q.sort] || "p.updated_at DESC";
  const limit = Math.min(Math.max(Number(q.limit) || 20, 1), 100),
    offset = Math.max(Number(q.page || 1) - 1, 0) * limit;
  const [rows] = await pool.execute(
    `SELECT p.id,p.name,p.slug,p.status,p.product_type,p.is_active,p.featured,p.best_seller,p.new_arrival,p.updated_at,b.name brand_name,(SELECT COUNT(*) FROM product_skus s WHERE s.product_id=p.id AND s.deleted_at IS NULL) sku_count,(SELECT COUNT(*) FROM product_skus s WHERE s.product_id=p.id AND s.deleted_at IS NULL AND s.is_active=1) active_sku_count,(SELECT pm.file_path FROM product_media pm WHERE pm.product_id=p.id AND pm.deleted_at IS NULL ORDER BY pm.is_primary DESC,pm.sort_order,pm.id LIMIT 1) primary_image FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE ${where.join(" AND ")} ORDER BY ${sort} LIMIT ? OFFSET ?`,
    [...args, limit, offset],
  );
  return rows.map((r) => ({
    ...r,
    id: Number(r.id),
    brand: r.brand_name ? { name: r.brand_name } : null,
    skuCount: Number(r.sku_count),
    activeSkuCount: Number(r.active_sku_count),
    primaryImage: r.primary_image,
  }));
}
export async function detail(pool, id) {
  const [[p]] = await pool.execute("SELECT * FROM products WHERE id=?", [id]);
  if (!p) fail(404, "PRODUCT_NOT_FOUND", "Product not found.");
  const [categories] = await pool.execute(
    "SELECT c.id,c.name,c.slug,pc.is_primary,pc.sort_order FROM product_categories pc JOIN categories c ON c.id=pc.category_id WHERE pc.product_id=?",
    [id],
  );
  const [benefits] = await pool.execute(
    "SELECT * FROM product_benefits WHERE product_id=? ORDER BY sort_order,id",
    [id],
  );
  const [ingredients] = await pool.execute(
    "SELECT * FROM product_ingredients WHERE product_id=? ORDER BY sort_order,id",
    [id],
  );
  const [media] = await pool.execute(
    "SELECT * FROM product_media WHERE product_id=? AND deleted_at IS NULL ORDER BY is_primary DESC,sort_order,id",
    [id],
  );
  const [attrs] = await pool.execute(
    'SELECT pa.attribute_id,pa.sort_order,pa.is_required,a.name,(SELECT JSON_ARRAYAGG(JSON_OBJECT("id",pav.attribute_value_id,"sortOrder",pav.sort_order)) FROM product_attribute_values pav WHERE pav.product_id=pa.product_id AND pav.attribute_id=pa.attribute_id) values_json FROM product_attributes pa JOIN attributes a ON a.id=pa.attribute_id WHERE pa.product_id=? ORDER BY pa.sort_order',
    [id],
  );
  const [skus] = await pool.execute(
    "SELECT s.*,COALESCE(i.quantity_on_hand,0) on_hand,COALESCE(i.reserved_quantity,0) reserved FROM product_skus s LEFT JOIN inventory i ON i.sku_id=s.id WHERE s.product_id=? ORDER BY s.sort_order,s.id",
    [id],
  );
  for (const s of skus) {
    const [a] = await pool.execute(
      "SELECT attribute_id,attribute_value_id FROM sku_attribute_values WHERE sku_id=?",
      [s.id],
    );
    s.attributes = a;
    s.available = Number(s.on_hand) - Number(s.reserved);
  }
  return {
    ...p,
    id: Number(p.id),
    categories,
    benefits,
    ingredients,
    media,
    attributes: attrs.map((a) => ({
      ...a,
      values:
        typeof a.values_json === "string"
          ? JSON.parse(a.values_json || "[]")
          : a.values_json || [],
    })),
    skus,
  };
}
export async function save(pool, input, id, adminId, req) {
  const name = String(input.name || "").trim(),
    slug = slugify(input.slug || name);
  if (!name || !slug)
    fail(400, "VALIDATION_ERROR", "Name and slug are required.");
  const price = Number(input.basePrice || 0),
    mrp = Number(input.baseMrp || 0);
  if (price < 0 || mrp < price)
    fail(400, "INVALID_PRICE", "Base price/MRP is invalid.");
  const vals = [
    input.brandId || null,
    name,
    slug,
    input.shortDescription || null,
    input.description || null,
    input.ingredientsText || null,
    input.howToUse || null,
    input.texture || null,
    input.usageTime || null,
    input.status || "draft",
    input.productType || "simple",
    price,
    mrp,
    !!input.isFeatured,
    !!input.isBestSeller,
    !!input.isNewArrival,
    input.isActive !== false,
    input.seoTitle || null,
    input.seoDescription || null,
  ];
  try {
    let pid = id;
    if (id) {
      const [r] = await pool.execute(
        "UPDATE products SET brand_id=?,name=?,slug=?,short_description=?,description=?,ingredients_text=?,how_to_use=?,texture=?,usage_time=?,status=?,product_type=?,base_price=?,base_mrp=?,featured=?,best_seller=?,new_arrival=?,is_active=?,seo_title=?,seo_description=? WHERE id=? AND deleted_at IS NULL",
        [...vals, id],
      );
      if (!r.affectedRows) fail(404, "PRODUCT_NOT_FOUND", "Product not found.");
    } else {
      const [r] = await pool.execute(
        "INSERT INTO products (brand_id,name,slug,short_description,description,ingredients_text,how_to_use,texture,usage_time,status,product_type,base_price,base_mrp,featured,best_seller,new_arrival,is_active,seo_title,seo_description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        vals,
      );
      pid = r.insertId;
    }
    if (Array.isArray(input.categories)) {
      await pool.execute("DELETE FROM product_categories WHERE product_id=?", [
        pid,
      ]);
      const primary =
        input.categories.find((c) => c.isPrimary)?.id ||
        input.categories[0]?.id;
      for (const c of input.categories)
        await pool.execute(
          "INSERT INTO product_categories (product_id,category_id,is_primary,sort_order) VALUES (?,?,?,?)",
          [pid, c.id, Number(c.id) === Number(primary), c.sortOrder || 0],
        );
    }
    await catalogAudit(
      pool,
      adminId,
      id ? "product.updated" : "product.created",
      "products",
      pid,
      req,
    );
    return detail(pool, pid);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      fail(409, "SLUG_ALREADY_EXISTS", "That slug is already in use.");
    throw e;
  }
}
export async function sku(pool, productId, input, skuId, adminId, req) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const assignments = (input.attributes || []).map((a) => ({
      attributeId: Number(a.attributeId),
      attributeValueId: Number(a.valueId ?? a.attributeValueId),
    }));
    const combination = await validateSkuAttributes(
      conn,
      productId,
      assignments,
    );
    if (input.price < 0 || input.mrp < input.price)
      fail(400, "INVALID_PRICE", "SKU price/MRP is invalid.");
    if (skuId) {
      const [r] = await conn.execute(
        "UPDATE product_skus SET sku=?,title=?,combination_key=?,price=?,mrp=?,barcode=?,weight_grams=?,is_active=?,track_inventory=?,allow_backorder=? WHERE id=? AND product_id=? AND deleted_at IS NULL",
        [
          input.sku,
          input.title || null,
          combination,
          input.price,
          input.mrp,
          input.barcode || null,
          input.weightGrams || null,
          input.isActive !== false,
          input.trackInventory !== false,
          !!input.allowBackorder,
          skuId,
          productId,
        ],
      );
      if (!r.affectedRows) fail(404, "SKU_NOT_FOUND", "SKU not found.");
      await conn.execute("DELETE FROM sku_attribute_values WHERE sku_id=?", [
        skuId,
      ]);
    } else {
      const [r] = await conn.execute(
        "INSERT INTO product_skus (product_id,sku,title,combination_key,price,mrp,barcode,is_active,track_inventory,allow_backorder,weight_grams) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        [
          productId,
          input.sku,
          input.title || null,
          combination,
          input.price,
          input.mrp,
          input.barcode || null,
          input.isActive !== false,
          input.trackInventory !== false,
          !!input.allowBackorder,
          input.weightGrams || null,
        ],
      );
      skuId = r.insertId;
    }
    for (const a of assignments)
      await conn.execute(
        "INSERT INTO sku_attribute_values (sku_id,attribute_id,attribute_value_id) VALUES (?,?,?)",
        [skuId, a.attributeId, a.attributeValueId],
      );
    await conn.commit();
    await catalogAudit(
      pool,
      adminId,
      skuId ? "sku.updated" : "sku.created",
      "product_skus",
      skuId,
      req,
    );
    return skuId;
  } catch (e) {
    await conn.rollback();
    if (e.code === "ER_DUP_ENTRY")
      fail(
        409,
        e.message?.includes("combination")
          ? "SKU_COMBINATION_EXISTS"
          : "SKU_CODE_EXISTS",
        "That SKU or combination already exists.",
      );
    throw e;
  } finally {
    conn.release();
  }
}
export async function removeSku(pool, productId, skuId, adminId, req) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[row]] = await conn.execute(
      "SELECT s.id, COALESCE(i.reserved_quantity,0) reserved FROM product_skus s LEFT JOIN inventory i ON i.sku_id=s.id WHERE s.id=? AND s.product_id=? AND s.deleted_at IS NULL FOR UPDATE",
      [skuId, productId],
    );
    if (!row) fail(404, "SKU_NOT_FOUND", "SKU not found.");
    if (Number(row.reserved) > 0)
      fail(
        409,
        "SKU_HAS_RESERVED_STOCK",
        "This SKU has reserved stock and cannot be deleted.",
      );
    await conn.execute(
      "UPDATE product_skus SET deleted_at=CURRENT_TIMESTAMP, is_active=0 WHERE id=? AND product_id=? AND deleted_at IS NULL",
      [skuId, productId],
    );
    await conn.commit();
    await catalogAudit(
      pool,
      adminId,
      "sku.deleted",
      "product_skus",
      skuId,
      req,
    );
    return { id: Number(skuId), deleted: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
export async function restoreSku(pool, productId, skuId, adminId, req) {
  try {
    const [result] = await pool.execute(
      "UPDATE product_skus SET deleted_at=NULL, is_active=1 WHERE id=? AND product_id=? AND deleted_at IS NOT NULL",
      [skuId, productId],
    );
    if (!result.affectedRows)
      fail(404, "SKU_NOT_FOUND", "Deleted SKU not found.");
    await catalogAudit(
      pool,
      adminId,
      "sku.restored",
      "product_skus",
      skuId,
      req,
    );
    return { id: Number(skuId), restored: true };
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      fail(
        409,
        "SKU_CONFLICT",
        "A live SKU already uses this code or combination.",
      );
    throw e;
  }
}

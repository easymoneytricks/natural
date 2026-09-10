const decimal = (value) =>
  value === null || value === undefined ? null : Number(value);
const parseJson = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export class CatalogNotFoundError extends Error {
  constructor(code, message) {
    super(message);
    this.statusCode = 404;
    this.code = code;
  }
}

const parseList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
const escapedLike = (value) => `%${value.replace(/[\\%_]/g, "\\$&")}%`;

function buildProductFilters(query) {
  const where = [
    `p.status = 'active'`,
    "p.is_active = 1",
    "p.deleted_at IS NULL",
  ];
  const params = [];
  const addExists = (sql, values) => {
    where.push(`EXISTS (${sql})`);
    params.push(...values);
  };
  const categories = parseList(query.category);
  const brands = parseList(query.brand);
  const skins = parseList(query.skin);
  const concerns = parseList(query.concern);
  const sizes = parseList(query.size);
  if (categories.length)
    addExists(
      `SELECT 1 FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id AND c.slug IN (${categories.map(() => "?").join(",")}) AND c.deleted_at IS NULL`,
      categories,
    );
  if (brands.length)
    addExists(
      `SELECT 1 FROM brands b2 WHERE b2.id = p.brand_id AND b2.slug IN (${brands.map(() => "?").join(",")}) AND b2.deleted_at IS NULL`,
      brands,
    );
  for (const [attributeSlug, values] of [
    ["skin-type", skins],
    ["concern", concerns],
    ["pack-size", sizes],
  ]) {
    if (values.length)
      addExists(
        `SELECT 1 FROM product_attribute_values pav JOIN attributes a ON a.id = pav.attribute_id JOIN attribute_values av ON av.id = pav.attribute_value_id WHERE pav.product_id = p.id AND a.slug = ? AND av.slug IN (${values.map(() => "?").join(",")}) AND a.is_active = 1 AND av.is_active = 1`,
        [attributeSlug, ...values],
      );
  }
  if (query.q)
    addExists(
      `SELECT 1 FROM brands sb WHERE sb.id = p.brand_id AND (p.name LIKE ? OR p.short_description LIKE ? OR sb.name LIKE ?)`,
      [escapedLike(query.q), escapedLike(query.q), escapedLike(query.q)],
    );
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const conditions = [
      "psp.product_id = p.id",
      "psp.is_active = 1",
      "psp.deleted_at IS NULL",
    ];
    if (query.minPrice !== undefined) {
      conditions.push("psp.price >= ?");
      params.push(query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      conditions.push("psp.price <= ?");
      params.push(query.maxPrice);
    }
    addExists(
      `SELECT 1 FROM product_skus psp WHERE ${conditions.join(" AND ")}`,
      [],
    );
  }
  if (
    query.availability === "in-stock" ||
    query.availability === "out-of-stock"
  ) {
    const purchasable = `(psa.track_inventory = 0 OR psa.allow_backorder = 1 OR COALESCE(ia.quantity_on_hand - ia.reserved_quantity, 0) > 0)`;
    const prefix = query.availability === "in-stock" ? "EXISTS" : "NOT EXISTS";
    where.push(
      `${prefix} (SELECT 1 FROM product_skus psa LEFT JOIN inventory ia ON ia.sku_id = psa.id WHERE psa.product_id = p.id AND psa.is_active = 1 AND psa.deleted_at IS NULL AND ${purchasable})`,
    );
  }
  return { where, params };
}

function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 12 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1)
    throw Object.assign(new Error("Page must be a positive integer."), {
      statusCode: 400,
      code: "INVALID_QUERY",
    });
  if (!Number.isInteger(limit) || limit < 1 || limit > 48)
    throw Object.assign(
      new Error("Limit must be an integer between 1 and 48."),
      { statusCode: 400, code: "INVALID_QUERY" },
    );
  return { page, limit, offset: (page - 1) * limit };
}

function normalizeQuery(query) {
  const next = { ...query };
  if (next.q !== undefined) {
    next.q = String(next.q).trim().slice(0, 100);
    if (!next.q) delete next.q;
  }
  for (const key of ["minPrice", "maxPrice"])
    if (next[key] !== undefined) {
      next[key] = Number(next[key]);
      if (!Number.isFinite(next[key]) || next[key] < 0)
        throw Object.assign(
          new Error(`${key} must be a non-negative number.`),
          { statusCode: 400, code: "INVALID_QUERY" },
        );
    }
  if (
    next.minPrice !== undefined &&
    next.maxPrice !== undefined &&
    next.minPrice > next.maxPrice
  )
    throw Object.assign(new Error("minPrice cannot exceed maxPrice."), {
      statusCode: 400,
      code: "INVALID_QUERY",
    });
  if (
    next.availability &&
    !["in-stock", "out-of-stock"].includes(next.availability)
  )
    delete next.availability;
  return next;
}

const imageSelect = `(SELECT JSON_OBJECT('src', pm.file_path, 'alt', pm.alt_text) FROM product_media pm WHERE pm.product_id = p.id AND pm.deleted_at IS NULL ORDER BY pm.is_primary DESC, pm.sort_order, pm.id LIMIT 1)`;

export async function listProducts(connection, rawQuery) {
  const query = normalizeQuery(rawQuery);
  const pagination = parsePagination(query);
  const { where, params } = buildProductFilters(query);
  const sortMap = {
    featured: "p.featured DESC, p.best_seller DESC, p.id DESC",
    "best-selling": "p.best_seller DESC, p.id DESC",
    newest: "p.created_at DESC, p.id DESC",
    "price-asc": "price_min ASC, p.id ASC",
    "price-desc": "price_min DESC, p.id DESC",
    "rating-desc": "p.best_seller DESC, p.id DESC",
  };
  const sort = sortMap[query.sort || "featured"] || sortMap.featured;
  const from = `FROM products p LEFT JOIN brands b ON b.id = p.brand_id AND b.deleted_at IS NULL
    LEFT JOIN product_skus ps ON ps.product_id = p.id AND ps.is_active = 1 AND ps.deleted_at IS NULL
    LEFT JOIN inventory i ON i.sku_id = ps.id WHERE ${where.concat(["(p.brand_id IS NULL OR b.id IS NOT NULL)"]).join(" AND ")} GROUP BY p.id, b.id`;
  const [countRows] = await connection.execute(
    `SELECT COUNT(*) AS total FROM (SELECT p.id ${from}) counted`,
    params,
  );
  const [rows] = await connection.execute(
    `SELECT p.id, p.slug, p.name, p.short_description, p.featured, p.best_seller, p.new_arrival,
    b.id AS brand_id, b.name AS brand_name, b.slug AS brand_slug,
    (SELECT c.id FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id AND c.deleted_at IS NULL ORDER BY pc.is_primary DESC, pc.sort_order, c.id LIMIT 1) AS category_id,
    (SELECT c.name FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id AND c.deleted_at IS NULL ORDER BY pc.is_primary DESC, pc.sort_order, c.id LIMIT 1) AS category_name,
    (SELECT c.slug FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = p.id AND c.deleted_at IS NULL ORDER BY pc.is_primary DESC, pc.sort_order, c.id LIMIT 1) AS category_slug,
    COALESCE(MIN(ps.price), p.base_price) AS price_min, COALESCE(MAX(ps.price), p.base_price) AS price_max,
    COALESCE(MIN(ps.mrp), p.base_mrp) AS mrp_min, COALESCE(MAX(ps.mrp), p.base_mrp) AS mrp_max,
    MAX(CASE WHEN ps.track_inventory = 0 OR ps.allow_backorder = 1 OR COALESCE(i.quantity_on_hand - i.reserved_quantity, 0) > 0 THEN 1 ELSE 0 END) AS available,
    ${imageSelect} AS image ${from} ORDER BY ${sort} LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  const total = Number(countRows[0].total);
  return {
    data: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description,
      category: row.category_id
        ? {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug,
          }
        : null,
      brand: row.brand_id
        ? { id: row.brand_id, name: row.brand_name, slug: row.brand_slug }
        : null,
      image: parseJson(row.image),
      price: {
        min: decimal(row.price_min),
        max: decimal(row.price_max),
        mrpMin: decimal(row.mrp_min),
        mrpMax: decimal(row.mrp_max),
      },
      badges: [
        ...(row.best_seller ? ["Bestseller"] : []),
        ...(row.new_arrival ? ["New"] : []),
      ],
      available: Boolean(row.available),
      featured: Boolean(row.featured),
      bestSeller: Boolean(row.best_seller),
      newArrival: Boolean(row.new_arrival),
    })),
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

async function findProduct(connection, slug) {
  const [rows] = await connection.execute(
    `SELECT p.*, b.id AS brand_id, b.name AS brand_name, b.slug AS brand_slug
    FROM products p LEFT JOIN brands b ON b.id = p.brand_id AND b.deleted_at IS NULL
    WHERE p.slug = ? AND p.status = 'active' AND p.is_active = 1 AND p.deleted_at IS NULL AND (p.brand_id IS NULL OR b.id IS NOT NULL)`,
    [slug],
  );
  if (!rows.length)
    throw new CatalogNotFoundError("PRODUCT_NOT_FOUND", "Product not found.");
  return rows[0];
}

export async function getProduct(connection, slug) {
  const product = await findProduct(connection, slug);
  const [categories] = await connection.execute(
    `SELECT c.id, c.name, c.slug, c.description, c.image_path, c.parent_id, pc.is_primary, pc.sort_order
    FROM product_categories pc JOIN categories c ON c.id = pc.category_id WHERE pc.product_id = ? AND c.deleted_at IS NULL AND c.is_active = 1 ORDER BY pc.is_primary DESC, pc.sort_order, c.id`,
    [product.id],
  );
  const [media] = await connection.execute(
    `SELECT file_path, alt_text, media_type, sort_order, is_primary FROM product_media WHERE product_id = ? AND deleted_at IS NULL ORDER BY is_primary DESC, sort_order, id`,
    [product.id],
  );
  const [benefits] = await connection.execute(
    "SELECT benefit, sort_order FROM product_benefits WHERE product_id = ? ORDER BY sort_order, id",
    [product.id],
  );
  const [ingredients] = await connection.execute(
    "SELECT name, description, is_key, sort_order FROM product_ingredients WHERE product_id = ? ORDER BY is_key DESC, sort_order, id",
    [product.id],
  );
  const [attributeRows] = await connection.execute(
    `SELECT a.id, a.name, a.slug, a.display_type, pa.is_required, pa.sort_order, av.id AS value_id, av.value, av.slug AS value_slug, av.display_value, pav.sort_order AS value_sort_order
    FROM product_attributes pa JOIN attributes a ON a.id = pa.attribute_id JOIN product_attribute_values pav ON pav.product_id = pa.product_id AND pav.attribute_id = pa.attribute_id JOIN attribute_values av ON av.id = pav.attribute_value_id
    WHERE pa.product_id = ? AND a.is_active = 1 AND av.is_active = 1 ORDER BY pa.sort_order, a.id, pav.sort_order, av.id`,
    [product.id],
  );
  const attributes = [];
  for (const row of attributeRows) {
    let attribute = attributes.find((item) => item.id === row.id);
    if (!attribute) {
      attribute = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        displayType: row.display_type,
        required: Boolean(row.is_required),
        values: [],
      };
      attributes.push(attribute);
    }
    attribute.values.push({
      id: row.value_id,
      value: row.value,
      slug: row.value_slug,
      displayValue: row.display_value || row.value,
    });
  }
  const [skuRows] = await connection.execute(
    `SELECT ps.id, ps.sku, ps.price, ps.mrp, ps.title, ps.track_inventory, ps.allow_backorder,
    COALESCE(i.quantity_on_hand - i.reserved_quantity, 0) AS available,
    (SELECT pm.file_path FROM sku_media sm JOIN product_media pm ON pm.id = sm.product_media_id WHERE sm.sku_id = ps.id AND pm.deleted_at IS NULL ORDER BY sm.is_primary DESC, sm.sort_order, sm.id LIMIT 1) AS primary_image,
    a.slug AS attribute_slug, av.id AS value_id, av.value, av.slug AS value_slug
    FROM product_skus ps LEFT JOIN inventory i ON i.sku_id = ps.id LEFT JOIN sku_attribute_values sav ON sav.sku_id = ps.id LEFT JOIN attributes a ON a.id = sav.attribute_id LEFT JOIN attribute_values av ON av.id = sav.attribute_value_id
    WHERE ps.product_id = ? AND ps.is_active = 1 AND ps.deleted_at IS NULL ORDER BY ps.sort_order, ps.id`,
    [product.id],
  );
  const skus = [];
  for (const row of skuRows) {
    let sku = skus.find((item) => item.id === row.id);
    if (!sku) {
      sku = {
        id: row.id,
        sku: row.sku,
        title: row.title,
        price: decimal(row.price),
        mrp: decimal(row.mrp),
        active: true,
        stock: {
          tracked: Boolean(row.track_inventory),
          available: row.track_inventory ? Number(row.available) : null,
          inStock:
            !row.track_inventory ||
            Number(row.available) > 0 ||
            Boolean(row.allow_backorder),
        },
        attributes: {},
        primaryImage: row.primary_image || null,
      };
      skus.push(sku);
    }
    if (row.attribute_slug)
      sku.attributes[row.attribute_slug] = {
        id: row.value_id,
        value: row.value,
        slug: row.value_slug,
      };
  }
  const prices = skus.map((sku) => sku.price);
  return {
    data: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand_id
        ? {
            id: product.brand_id,
            name: product.brand_name,
            slug: product.brand_slug,
          }
        : null,
      categories: categories.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        image: item.image_path,
        parentId: item.parent_id,
        isPrimary: Boolean(item.is_primary),
      })),
      shortDescription: product.short_description,
      description: product.description,
      howToUse: product.how_to_use,
      texture: product.texture,
      usageTime: product.usage_time,
      gallery: media.map((item) => ({
        src: item.file_path,
        alt: item.alt_text,
        type: item.media_type,
      })),
      benefits: benefits.map((item) => item.benefit),
      keyIngredients: ingredients
        .filter((item) => item.is_key)
        .map((item) => ({ name: item.name, description: item.description })),
      attributes,
      skus,
      price: {
        min: prices.length ? Math.min(...prices) : decimal(product.base_price),
        max: prices.length ? Math.max(...prices) : decimal(product.base_price),
        mrpMin: skus.length
          ? Math.min(...skus.map((sku) => sku.mrp))
          : decimal(product.base_mrp),
        mrpMax: skus.length
          ? Math.max(...skus.map((sku) => sku.mrp))
          : decimal(product.base_mrp),
      },
      available: skus.some((sku) => sku.stock.inStock),
      seo: { title: product.seo_title, description: product.seo_description },
    },
  };
}

export async function listCategories(connection) {
  const [rows] =
    await connection.execute(`SELECT c.id, c.name, c.slug, c.description, c.image_path, c.parent_id, c.sort_order
    FROM categories c WHERE c.is_active = 1 AND c.deleted_at IS NULL ORDER BY c.sort_order, c.id`);
  return {
    data: rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image_path,
      parentId: row.parent_id,
      sortOrder: row.sort_order,
    })),
  };
}

export async function getCategory(connection, slug) {
  const [rows] = await connection.execute(
    `SELECT id, name, slug, description, image_path, parent_id, sort_order FROM categories WHERE slug = ? AND is_active = 1 AND deleted_at IS NULL`,
    [slug],
  );
  if (!rows.length)
    throw new CatalogNotFoundError("CATEGORY_NOT_FOUND", "Category not found.");
  const row = rows[0];
  return {
    data: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image_path,
      parentId: row.parent_id,
      sortOrder: row.sort_order,
    },
  };
}

export async function listBrands(connection) {
  const [rows] = await connection.execute(
    "SELECT id, name, slug, description, logo_path, sort_order FROM brands WHERE is_active = 1 AND deleted_at IS NULL ORDER BY sort_order, id",
  );
  return {
    data: rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      logo: row.logo_path,
      sortOrder: row.sort_order,
    })),
  };
}

export async function getBrand(connection, slug) {
  const [rows] = await connection.execute(
    "SELECT id, name, slug, description, logo_path, sort_order FROM brands WHERE slug = ? AND is_active = 1 AND deleted_at IS NULL",
    [slug],
  );
  if (!rows.length)
    throw new CatalogNotFoundError("BRAND_NOT_FOUND", "Brand not found.");
  const row = rows[0];
  return {
    data: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      logo: row.logo_path,
      sortOrder: row.sort_order,
    },
  };
}

export async function getFilters(connection) {
  const [categories] = await connection.execute(
    "SELECT id, name, slug FROM categories WHERE is_active = 1 AND deleted_at IS NULL ORDER BY sort_order, id",
  );
  const [brands] = await connection.execute(
    "SELECT id, name, slug FROM brands WHERE is_active = 1 AND deleted_at IS NULL ORDER BY sort_order, id",
  );
  const [values] = await connection.execute(
    `SELECT a.slug AS attribute_slug, av.id, av.value, av.slug FROM attributes a JOIN attribute_values av ON av.attribute_id = a.id WHERE a.is_active = 1 AND av.is_active = 1 AND a.slug IN ('skin-type', 'concern', 'pack-size') ORDER BY a.sort_order, av.sort_order, av.id`,
  );
  const [price] = await connection.execute(
    `SELECT MIN(ps.price) AS min_price, MAX(ps.price) AS max_price FROM product_skus ps JOIN products p ON p.id = ps.product_id WHERE p.status = 'active' AND p.is_active = 1 AND p.deleted_at IS NULL AND ps.is_active = 1 AND ps.deleted_at IS NULL`,
  );
  const grouped = { skinTypes: [], concerns: [], packSizes: [] };
  for (const row of values) {
    const key =
      row.attribute_slug === "skin-type"
        ? "skinTypes"
        : row.attribute_slug === "pack-size"
          ? "packSizes"
          : "concerns";
    grouped[key].push({ id: row.id, value: row.value, slug: row.slug });
  }
  return {
    data: {
      categories: categories.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
      })),
      brands: brands.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
      })),
      ...grouped,
      priceRange: {
        min: decimal(price[0]?.min_price) || 0,
        max: decimal(price[0]?.max_price) || 0,
      },
    },
  };
}

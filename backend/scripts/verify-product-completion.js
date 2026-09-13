import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "../src/config/database.js";
import { env } from "../src/config/env.js";
import * as products from "../src/services/adminProduct.service.js";
import * as extras from "../src/services/adminProductExtras.service.js";
import { getProduct } from "../src/services/catalog.service.js";
import { removeManagedFile } from "../src/services/mediaStorage.service.js";
import { refreshAdmin } from "../src/services/adminAuth.service.js";
import {
  createAdminRefreshToken,
  hashAdminRefreshToken,
  verifyAdminAccessToken,
} from "../src/utils/adminTokens.js";

// All database fixtures and audit rows are rolled back, including successful saves.
if (!["localhost", "127.0.0.1", "::1"].includes(env.db.host)) {
  throw new Error(
    "This verification script only runs against a local database.",
  );
}
const connection = await pool.getConnection();
const files = [];
const request = {
  ip: "127.0.0.1",
  get: () => "product-completion-verification",
};
const db = {
  execute: (...args) => connection.execute(...args),
  query: (...args) => connection.query(...args),
  getConnection: async () => db,
  beginTransaction: () => connection.query("SAVEPOINT product_gate"),
  commit: () => connection.query("RELEASE SAVEPOINT product_gate"),
  rollback: () => connection.query("ROLLBACK TO SAVEPOINT product_gate"),
  release: () => {},
};
let checks = 0;
const pass = (message) => {
  checks++;
  console.log(`PASS ${message}`);
};
const rejects = async (operation, code) => {
  await assert.rejects(operation, (error) => error.code === code);
};

try {
  await connection.beginTransaction();
  const [[admin]] = await db.execute("SELECT id FROM admin_users LIMIT 1");
  assert.ok(admin, "An existing local admin is required for audit ownership.");
  const rawSession = createAdminRefreshToken();
  const [session] = await db.execute(
    "INSERT INTO admin_sessions (admin_user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(),INTERVAL 1 DAY))",
    [admin.id, hashAdminRefreshToken(rawSession)],
  );
  const refreshed = await refreshAdmin(db, rawSession);
  const refreshedAgain = await refreshAdmin(db, refreshed.rawToken);
  assert.equal(
    verifyAdminAccessToken(refreshedAgain.accessToken).sessionId,
    String(session.insertId),
  );
  await rejects(() => refreshAdmin(db, rawSession), "SESSION_EXPIRED");
  pass(
    "Admin refresh rotates the actual session twice and rejects the old token",
  );
  const available = (await extras.attributes(db))
    .filter((attribute) => attribute.values.length >= 2)
    .slice(0, 3);
  assert.equal(
    available.length,
    3,
    "Three seeded attributes with at least two values are required.",
  );
  const suffix = randomUUID().slice(0, 8);
  const input = {
    name: `Completion test ${suffix}`,
    slug: `completion-test-${suffix}`,
    status: "active",
    productType: "variant",
    basePrice: 100,
    baseMrp: 150,
    isActive: true,
    isFeatured: true,
    seoTitle: "Test SEO",
    description: "Persisted description",
    howToUse: "Apply gently",
    texture: "Cream",
    usageTime: "Evening",
    benefits: [{ benefit: "Benefit one" }, { benefit: "Benefit two" }],
    ingredients: [
      { name: "Ingredient one", description: "Description", isKey: true },
    ],
    attributes: available.map((attribute) => ({
      attributeId: attribute.id,
      isRequired: true,
      values: attribute.values
        .slice(0, 2)
        .map((value) => ({ valueId: value.id })),
    })),
  };
  const [[brand]] = await db.execute(
    "SELECT id FROM brands WHERE deleted_at IS NULL LIMIT 1",
  );
  const categories = [];
  for (const index of [1, 2]) {
    const [category] = await db.execute(
      "INSERT INTO categories (name,slug) VALUES (?,?)",
      [`QA category ${index}`, `qa-category-${suffix}-${index}`],
    );
    categories.push({ id: category.insertId });
  }
  input.brandId = brand?.id || null;
  input.categories = categories.map((category, index) => ({
    id: category.id,
    isPrimary: index === 0,
    sortOrder: index,
  }));
  const product = await products.save(db, input, null, admin.id, request);
  assert.equal(product.benefits.length, 2);
  assert.equal(product.ingredients[0].is_key, 1);
  assert.equal(product.attributes.length, 3);
  assert.equal(product.skus.length, 0);
  assert.equal(product.categories.length, 2);
  assert.equal(product.categories.filter((category) => category.is_primary).length, 1);
  assert.equal(product.seo_title, "Test SEO");
  pass(
    "Product, content, categories and attributes persist atomically without generating SKUs",
  );

  const assignments = (indices) =>
    available.map((attribute, index) => ({
      attributeId: attribute.id,
      valueId: attribute.values[indices[index]].id,
    }));
  const first = {
    sku: `GATE-${suffix}-A`,
    price: 100,
    mrp: 150,
    title: "First combination",
    weightGrams: 50,
    barcode: `GATE-${suffix}`,
    attributes: assignments([0, 0, 0]),
    isActive: true,
  };
  const second = {
    ...first,
    sku: `GATE-${suffix}-B`,
    barcode: null,
    attributes: assignments([0, 1, 1]),
  };
  const firstId = await products.sku(
    db,
    product.id,
    first,
    null,
    admin.id,
    request,
  );
  const secondId = await products.sku(
    db,
    product.id,
    second,
    null,
    admin.id,
    request,
  );
  await db.execute(
    "INSERT INTO inventory(sku_id,quantity_on_hand,reserved_quantity) VALUES(?,10,2),(?,0,0)",
    [firstId, secondId],
  );
  await rejects(
    () =>
      products.sku(
        db,
        product.id,
        { ...first, sku: `GATE-${suffix}-DUP`, barcode: null },
        null,
        admin.id,
        request,
      ),
    "SKU_COMBINATION_EXISTS",
  );
  await rejects(
    () =>
      products.sku(
        db,
        product.id,
        { ...first, attributes: assignments([1, 1, 0]) },
        null,
        admin.id,
        request,
      ),
    "SKU_CODE_EXISTS",
  );
  await rejects(
    () =>
      products.sku(
        db,
        product.id,
        { ...second, attributes: [] },
        null,
        admin.id,
        request,
      ),
    "INVALID_SKU_ATTRIBUTES",
  );
  await rejects(
    () =>
      products.sku(
        db,
        product.id,
        {
          ...second,
          attributes: [{ attributeId: available[0].id, valueId: 99999999 }],
        },
        null,
        admin.id,
        request,
      ),
    "INVALID_SKU_ATTRIBUTES",
  );
  pass(
    "Explicit creation, duplicate code/combination rejection and invalid assignment rejection",
  );

  const stockBefore = (
    await db.execute(
      "SELECT * FROM inventory WHERE sku_id IN (?,?) ORDER BY sku_id",
      [firstId, secondId],
    )
  )[0];
  await products.save(
    db,
    {
      ...input,
      name: `${input.name} edited`,
      benefits: [...input.benefits].reverse(),
    },
    product.id,
    admin.id,
    request,
  );
  await products.sku(
    db,
    product.id,
    { ...first, price: 110, mrp: 160 },
    firstId,
    admin.id,
    request,
  );
  assert.deepEqual(
    (
      await db.execute(
        "SELECT * FROM inventory WHERE sku_id IN (?,?) ORDER BY sku_id",
        [firstId, secondId],
      )
    )[0],
    stockBefore,
  );
  const reloaded = await products.detail(db, product.id);
  assert.equal(reloaded.skus.length, 2);
  assert.ok(
    reloaded.skus.some(
      (sku) => Number(sku.id) === Number(secondId) && sku.available === 0,
    ),
  );
  assert.equal(reloaded.benefits[0].benefit, "Benefit two");
  pass(
    "Stock invariance, existing out-of-stock SKU retention, benefit reorder and nonexistent combination absence",
  );
  await rejects(
    () =>
      products.save(
        db,
        { ...input, name: "Should roll back", attributes: [] },
        product.id,
        admin.id,
        request,
      ),
    "SKU_ATTRIBUTE_CONFLICT",
  );
  assert.equal(
    (await products.detail(db, product.id)).name,
    `${input.name} edited`,
  );
  pass("Invalid attribute changes roll back the entire product save");

  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jP1kAAAAASUVORK5CYII=",
    "base64",
  );
  const uploaded = [];
  for (let index = 0; index < 3; index++) {
    const image = await extras.mediaUpload(
      db,
      product.id,
      { buffer: png, mimetype: "image/png", originalname: `test-${index}.png` },
      admin.id,
      request,
    );
    files.push(image.file_path);
    uploaded.push(image);
  }
  await extras.mediaUpdate(
    db,
    product.id,
    { mediaId: uploaded[1].id, primary: true },
    admin.id,
    request,
  );
  await extras.mediaUpdate(
    db,
    product.id,
    { mediaId: uploaded[2].id, sortOrder: 0, altText: "Updated alt" },
    admin.id,
    request,
  );
  await products.sku(
    db,
    product.id,
    { ...first, mediaIds: [uploaded[1].id] },
    firstId,
    admin.id,
    request,
  );
  await rejects(
    () =>
      products.sku(
        db,
        product.id,
        { ...first, mediaIds: [99999999] },
        firstId,
        admin.id,
        request,
      ),
    "INVALID_MEDIA",
  );
  const [order] = await db.execute(
    `INSERT INTO orders (order_number,idempotency_key,request_fingerprint,customer_email,customer_phone,status,payment_method,items_subtotal,mrp_total,product_discount,coupon_discount,shipping_amount,gift_card_amount,grand_total,shipping_method_code,shipping_method_name)
     VALUES (?,?,?,'qa@example.invalid','0000000000','cancelled','cod',100,150,50,0,0,0,100,'qa','QA shipping')`,
    [`QA-${suffix}`, randomUUID(), "0".repeat(64)],
  );
  await db.execute(
    `INSERT INTO order_items (order_id,product_id,sku_id,sku_code,product_name,product_slug,variant_title,attributes_json,image_path,quantity,unit_price,unit_mrp,line_subtotal,line_mrp_total,line_product_discount)
     VALUES (?,?,?,?,?,?,?,'[]',?,1,100,150,100,150,50)`,
    [
      order.insertId,
      product.id,
      secondId,
      second.sku,
      input.name,
      input.slug,
      "Historical variant",
      uploaded[0].file_path,
    ],
  );
  const [historyBefore] = await db.execute(
    "SELECT * FROM order_items WHERE order_id=?",
    [order.insertId],
  );
  await extras.mediaRemove(db, product.id, uploaded[0].id, admin.id, request);
  let current = await products.detail(db, product.id);
  assert.equal(current.media.length, 2);
  assert.equal(current.media.filter((image) => image.is_primary).length, 1);
  assert.equal(Number(current.media[0].id), Number(uploaded[1].id));
  assert.deepEqual(
    current.skus.find((sku) => Number(sku.id) === Number(firstId)).mediaIds,
    [Number(uploaded[1].id)],
  );
  const publicProduct = await getProduct(db, input.slug);
  assert.equal(publicProduct.data.gallery.length, 2);
  assert.equal(publicProduct.data.gallery[0].src, uploaded[1].file_path);
  pass(
    "Multiple uploads, alt/order/primary persistence, SKU media, safe removal and public gallery payload",
  );

  await rejects(
    () => products.removeSku(db, product.id, firstId, admin.id, request),
    "SKU_HAS_RESERVED_STOCK",
  );
  await products.removeSku(db, product.id, secondId, admin.id, request);
  assert.equal((await getProduct(db, input.slug)).data.skus.length, 1);
  await products.restoreSku(db, product.id, secondId, admin.id, request);
  assert.equal((await getProduct(db, input.slug)).data.skus.length, 1);
  await products.sku(db, product.id, second, secondId, admin.id, request);
  assert.equal((await getProduct(db, input.slug)).data.skus.length, 2);
  pass(
    "Reserved-stock deletion guard, soft delete, inactive restore and explicit reactivation",
  );
  await extras.removeProduct(db, product.id, admin.id, request);
  await assert.rejects(() => getProduct(db, input.slug));
  assert.equal((await products.detail(db, product.id)).skus.length, 2);
  await extras.restoreProduct(db, product.id, admin.id, request);
  assert.equal((await products.detail(db, product.id)).status, "draft");
  assert.deepEqual(
    (
      await db.execute(
        "SELECT * FROM inventory WHERE sku_id IN (?,?) ORDER BY sku_id",
        [firstId, secondId],
      )
    )[0],
    stockBefore,
  );
  pass(
    "Product archive/restore preserves SKU and inventory records; drafts stay hidden publicly",
  );
  const [historyAfter] = await db.execute(
    "SELECT * FROM order_items WHERE order_id=?",
    [order.insertId],
  );
  assert.deepEqual(historyAfter, historyBefore);
  pass(
    "Historical order snapshot and SKU/product references survive media removal and SKU/product lifecycle changes",
  );
  console.log(
    `Verified ${checks} completion groups against local MariaDB. All fixtures will be rolled back.`,
  );
} finally {
  await connection.rollback();
  connection.release();
  for (const path of files) await removeManagedFile(path);
  await pool.end();
}

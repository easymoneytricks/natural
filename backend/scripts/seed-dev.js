import 'dotenv/config'
import mysql from 'mysql2/promise'
import { env } from '../src/config/env.js'
import { logger } from '../src/utils/logger.js'
import { validateSkuAttributes, normalizeCombination } from '../src/services/sku.service.js'
import { hashPassword } from '../src/utils/password.js'
import crypto from 'node:crypto'

const categories = ['Cleansers', 'Toners & Mists', 'Serums', 'Moisturizers', 'Sunscreens', 'Masks & Treatments', 'Eye Care', 'Lip Care']
const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Acne-Prone']
const concerns = ['Acne & Breakouts', 'Dark Spots', 'Pigmentation', 'Dryness', 'Dullness', 'Fine Lines', 'Uneven Texture', 'Redness', 'Oil Control', 'Dehydration', 'Sun Protection', 'Barrier Support']
const packSizes = ['30 ml', '50 ml', '100 ml', '200 ml']
const skuSeed = [
  ['NB-BRM-50-DRY-DRYNESS', '50 ml / Dry / Dryness', '50 ml', 'Dry', 'Dryness', 1249, 1049, 14],
  ['NB-BRM-50-DRY-DEHYDRATION', '50 ml / Dry / Dehydration', '50 ml', 'Dry', 'Dehydration', 1249, 1049, 8],
  ['NB-BRM-50-COMBINATION-BARRIER', '50 ml / Combination / Barrier Support', '50 ml', 'Combination', 'Barrier Support', 1249, 1049, 6],
  ['NB-BRM-50-SENSITIVE-BARRIER', '50 ml / Sensitive / Barrier Support', '50 ml', 'Sensitive', 'Barrier Support', 1249, 1049, 4],
  ['NB-BRM-50-OILY-ACNE', '50 ml / Oily / Acne & Breakouts', '50 ml', 'Oily', 'Acne & Breakouts', 1249, 1049, 0],
  ['NB-BRM-100-DRY-DRYNESS', '100 ml / Dry / Dryness', '100 ml', 'Dry', 'Dryness', 1899, 1649, 9],
  ['NB-BRM-100-DRY-DEHYDRATION', '100 ml / Dry / Dehydration', '100 ml', 'Dry', 'Dehydration', 1899, 1649, 5],
  ['NB-BRM-100-SENSITIVE-BARRIER', '100 ml / Sensitive / Barrier Support', '100 ml', 'Sensitive', 'Barrier Support', 1899, 1649, 7],
  ['NB-BRM-100-COMBINATION-BARRIER', '100 ml / Combination / Barrier Support', '100 ml', 'Combination', 'Barrier Support', 1899, 1649, 3],
  ['NB-BRM-100-OILY-ACNE', '100 ml / Oily / Acne & Breakouts', '100 ml', 'Oily', 'Acne & Breakouts', 1899, 1649, 2],
]

const slugify = (value) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function upsert(connection, sql, values) {
  const [result] = await connection.execute(sql, values)
  return result.insertId
}

async function seed() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    charset: 'utf8mb4',
  })
  try {
    if (process.env.DEV_CUSTOMER_PASSWORD) {
      const passwordHash = await hashPassword(process.env.DEV_CUSTOMER_PASSWORD)
      await connection.execute(`INSERT INTO customers (first_name, last_name, email, phone, password_hash, status)
        VALUES ('Aanya', 'Mehta', 'aanya@example.com', '9876543210', ?, 'active')
        ON DUPLICATE KEY UPDATE id = id`, [passwordHash])
      const [[seedCustomer]] = await connection.execute('SELECT id, phone FROM customers WHERE email = ?', ['aanya@example.com'])
      const [[existingAddress]] = await connection.execute('SELECT id FROM customer_addresses WHERE customer_id = ? AND label = ? AND deleted_at IS NULL LIMIT 1', [seedCustomer.id, 'Home'])
      if (!existingAddress) await connection.execute(`INSERT INTO customer_addresses (customer_id,label,first_name,last_name,phone,address_line_1,address_line_2,landmark,city,state,postal_code,country_code,address_type,is_default)
        VALUES (?, 'Home', 'Aanya', 'Mehta', ?, '42 Lotus Residency', NULL, NULL, 'Bengaluru', 'Karnataka', '560038', 'IN', 'home', 1)`, [seedCustomer.id, seedCustomer.phone])
    }
    const couponSeeds = [
      ['WELCOME10', 'Welcome 10', '10% off your ritual', 'percentage', 10, 799, 250, null],
      ['GLOW20', 'Glow 20', '20% off qualifying orders', 'percentage', 20, 1999, 500, null],
      ['FLAT200', 'Flat 200', '₹200 off qualifying orders', 'flat', 200, 1499, null, null],
      ['EXPIRED15', 'Expired 15', 'Expired development coupon', 'percentage', 15, 0, null, '2020-01-01 00:00:00'],
    ]
    for (const [code,name,description,type,value,min,max,expires] of couponSeeds) await connection.execute(`INSERT INTO coupons (code,name,description,discount_type,discount_value,minimum_cart_amount,maximum_discount_amount,expires_at) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description)`, [code,name,description,type,value,min,max,expires])
    const cards = [['NB-GIFT-500',500,null],['NB-GIFT-1000',1000,650],['NB-GIFT-2000',2000,2000],['NB-GIFT-USED',500,0],['NB-GIFT-EXPIRED',1000,750,'2020-01-01 00:00:00']]
    for (const card of cards) { const code=card[0], value=card[1], balance=card[2] ?? card[1], expires=card[3] || null; const digest=crypto.createHash('sha256').update(code).digest('hex'); await connection.execute(`INSERT INTO gift_cards (code_hash,code_last4,initial_value,current_balance,status,expires_at) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE code_last4=VALUES(code_last4),current_balance=VALUES(current_balance),status=VALUES(status),expires_at=VALUES(expires_at)`, [digest,code.replace(/[^A-Z0-9]/g,'').slice(-4),value,balance,balance>0?'active':'exhausted',expires]) }
    await connection.execute(`INSERT INTO shipping_methods (code,name,description,fee,free_shipping_threshold,estimated_days_min,estimated_days_max,sort_order) VALUES ('STANDARD','Standard Delivery','3–6 business days',79,999,3,6,1),('EXPRESS','Express Delivery','1–3 business days',149,NULL,1,3,2) ON DUPLICATE KEY UPDATE name=VALUES(name),fee=VALUES(fee),free_shipping_threshold=VALUES(free_shipping_threshold),is_active=1`)
    if (process.env.DEV_ADMIN_PASSWORD) { const permissions=['dashboard.view','catalog.view','catalog.manage','inventory.view','inventory.manage','orders.view','orders.manage','customers.view','customers.manage','promotions.view','promotions.manage','content.view','content.manage','settings.view','settings.manage','staff.view','staff.manage','audit.view']; for(const slug of permissions) await connection.execute('INSERT INTO admin_permissions (name,slug) VALUES (?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',[slug,slug]); await connection.execute('INSERT INTO admin_roles (name,slug,description,is_system) VALUES (?,?,?,1) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)', ['Super Admin','super-admin','Full administrative access']); const [[role]]=await connection.execute('SELECT id FROM admin_roles WHERE slug="super-admin"'); for(const slug of permissions){const [[permission]]=await connection.execute('SELECT id FROM admin_permissions WHERE slug=?',[slug]);await connection.execute('INSERT IGNORE INTO admin_role_permissions (role_id,permission_id) VALUES (?,?)',[role.id,permission.id])} const email=(process.env.DEV_ADMIN_EMAIL||'admin@naturalbeauty.local').trim().toLowerCase(); const hash=await hashPassword(process.env.DEV_ADMIN_PASSWORD); await connection.execute('INSERT INTO admin_users (first_name,last_name,email,password_hash,status) VALUES (?,?,?,?,"active") ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)', ['Natural','Beauty',email,hash]); const [[admin]]=await connection.execute('SELECT id FROM admin_users WHERE email=?',[email]); await connection.execute('INSERT IGNORE INTO admin_user_roles (admin_user_id,role_id) VALUES (?,?)',[admin.id,role.id]); }
    const brandId = await upsert(connection, `INSERT INTO brands (name, slug, description, is_active)
      VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), name = VALUES(name), description = VALUES(description), is_active = 1`,
    ['Natural Beauty', 'natural-beauty', 'Thoughtfully formulated skincare for everyday rituals.'])

    const categoryIds = {}
    for (const [index, name] of categories.entries()) {
      categoryIds[name] = await upsert(connection, `INSERT INTO categories (name, slug, is_active, sort_order)
        VALUES (?, ?, 1, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), name = VALUES(name), is_active = 1, sort_order = VALUES(sort_order)`, [name, slugify(name), index])
    }

    const attributeIds = {}
    for (const [index, [name, displayType]] of [['Pack Size', 'button'], ['Skin Type', 'button'], ['Concern', 'button']].entries()) {
      attributeIds[name] = await upsert(connection, `INSERT INTO attributes (name, slug, display_type, sort_order, is_active)
        VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), name = VALUES(name), display_type = VALUES(display_type), sort_order = VALUES(sort_order), is_active = 1`, [name, slugify(name), displayType, index])
    }

    const valueIds = {}
    for (const [attributeName, values] of [['Pack Size', packSizes], ['Skin Type', skinTypes], ['Concern', concerns]]) {
      valueIds[attributeName] = {}
      for (const [index, value] of values.entries()) {
        valueIds[attributeName][value] = await upsert(connection, `INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order, is_active)
          VALUES (?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), value = VALUES(value), display_value = VALUES(display_value), sort_order = VALUES(sort_order), is_active = 1`, [attributeIds[attributeName], value, slugify(value), value, index])
      }
    }

    const productId = await upsert(connection, `INSERT INTO products (brand_id, name, slug, short_description, description, status, product_type, base_price, base_mrp, featured, best_seller, is_active, how_to_use, texture, usage_time)
      VALUES (?, ?, ?, ?, ?, 'active', 'variant', ?, ?, 1, 1, 1, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), brand_id = VALUES(brand_id), name = VALUES(name), short_description = VALUES(short_description), description = VALUES(description), status = 'active', product_type = 'variant', base_price = VALUES(base_price), base_mrp = VALUES(base_mrp), featured = 1, best_seller = 1, is_active = 1, how_to_use = VALUES(how_to_use), texture = VALUES(texture), usage_time = VALUES(usage_time)`, [brandId, 'Barrier Restore Moisturizer', 'barrier-restore-moisturizer', 'A replenishing moisturizer for a calm, comfortable barrier.', 'A ceramide-rich daily moisturizer that cushions dry-feeling skin without heaviness.', 1649, 1899, 'Massage a pea-sized amount over clean skin after serum.', 'Lightweight cream', 'AM & PM'])

    await connection.execute(`INSERT INTO product_categories (product_id, category_id, is_primary, sort_order) VALUES (?, ?, 1, 0)
      ON DUPLICATE KEY UPDATE is_primary = 1, sort_order = 0`, [productId, categoryIds.Moisturizers])
    for (const [index, attributeName] of ['Pack Size', 'Skin Type', 'Concern'].entries()) {
      await connection.execute(`INSERT INTO product_attributes (product_id, attribute_id, sort_order, is_required) VALUES (?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order), is_required = 1`, [productId, attributeIds[attributeName], index])
    }
    for (const [attributeName, values] of [['Pack Size', ['50 ml', '100 ml']], ['Skin Type', ['Dry', 'Oily', 'Combination', 'Sensitive']], ['Concern', ['Dryness', 'Dehydration', 'Barrier Support', 'Acne & Breakouts']]]) {
      for (const [index, value] of values.entries()) {
        await connection.execute(`INSERT INTO product_attribute_values (product_id, attribute_id, attribute_value_id, sort_order) VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)`, [productId, attributeIds[attributeName], valueIds[attributeName][value], index])
      }
    }
    for (const [index, filePath] of ['/uploads/products/barrier-restore/front.webp', '/uploads/products/barrier-restore/back.webp'].entries()) {
      await connection.execute(`INSERT INTO product_media (product_id, media_type, file_path, alt_text, sort_order, is_primary)
        VALUES (?, 'image', ?, ?, ?, ?) ON DUPLICATE KEY UPDATE alt_text = VALUES(alt_text), sort_order = VALUES(sort_order), is_primary = VALUES(is_primary)`, [productId, filePath, `Barrier Restore Moisturizer ${index === 0 ? 'front' : 'detail'}`, index, index === 0 ? 1 : 0])
    }
    for (const [index, benefit] of ['Supports the skin barrier', 'Long-lasting hydration', 'Comforts dry-feeling skin'].entries()) {
      await connection.execute('INSERT INTO product_benefits (product_id, benefit, sort_order) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)', [productId, benefit, index])
    }
    for (const [index, [name, description]] of [['Ceramides', 'Helps support a resilient moisture barrier.'], ['Hyaluronic Acid', 'Helps attract and retain hydration.']].entries()) {
      await connection.execute('INSERT INTO product_ingredients (product_id, name, description, is_key, sort_order) VALUES (?, ?, ?, 1, ?) ON DUPLICATE KEY UPDATE description = VALUES(description), sort_order = VALUES(sort_order)', [productId, name, description, index])
    }

    for (const [sortOrder, [sku, title, size, skinType, concern, mrp, price, stock]] of skuSeed.entries()) {
      const assignments = [
        { attributeId: attributeIds['Pack Size'], attributeValueId: valueIds['Pack Size'][size] },
        { attributeId: attributeIds['Skin Type'], attributeValueId: valueIds['Skin Type'][skinType] },
        { attributeId: attributeIds.Concern, attributeValueId: valueIds.Concern[concern] },
      ]
      const combinationKey = await validateSkuAttributes(connection, productId, assignments)
      const skuId = await upsert(connection, `INSERT INTO product_skus (product_id, sku, title, combination_key, price, mrp, is_active, track_inventory, allow_backorder, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, 1, 1, 0, ?)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), title = VALUES(title), price = VALUES(price), mrp = VALUES(mrp), is_active = 1`, [productId, sku, title, combinationKey, price, mrp, sortOrder])
      for (const assignment of assignments) {
        await connection.execute(`INSERT INTO sku_attribute_values (sku_id, attribute_id, attribute_value_id) VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE attribute_value_id = VALUES(attribute_value_id)`, [skuId, assignment.attributeId, assignment.attributeValueId])
      }
      const [existingInventory] = await connection.execute('SELECT id FROM inventory WHERE sku_id = ?', [skuId])
      if (!existingInventory.length) {
        await connection.execute('INSERT INTO inventory (sku_id, quantity_on_hand, reserved_quantity, reorder_level) VALUES (?, ?, 0, 2)', [skuId, stock])
        if (stock > 0) await connection.execute(`INSERT INTO inventory_movements (sku_id, movement_type, quantity_change, quantity_before, quantity_after, note)
          VALUES (?, 'initial', ?, 0, ?, 'Development seed initial stock')`, [skuId, stock, stock])
      }
    }
    logger.info('Development catalog seed completed.')
  } finally {
    await connection.end()
  }
}

seed().catch((error) => {
  logger.error(`Development seed failed: ${error.message}`)
  process.exitCode = 1
})

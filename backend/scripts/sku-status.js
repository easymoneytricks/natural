import mysql from 'mysql2/promise'
import { env } from '../src/config/env.js'

const slug = process.argv[2]
const connection = await mysql.createConnection({ host: env.db.host, port: env.db.port, database: env.db.name, user: env.db.user, password: env.db.password, charset: 'utf8mb4' })
try {
  const [rows] = await connection.execute(`SELECT ps.sku, ps.title, ps.price, i.quantity_on_hand, i.reserved_quantity,
    i.quantity_on_hand - i.reserved_quantity AS available_quantity
    FROM product_skus ps JOIN products p ON p.id = ps.product_id JOIN inventory i ON i.sku_id = ps.id
    WHERE p.slug = ? ORDER BY ps.sort_order, ps.id`, [slug])
  for (const row of rows) console.log(`${row.sku}\n${row.title}\n₹${row.price}\nStock ${row.available_quantity}\n`)
} finally {
  await connection.end()
}

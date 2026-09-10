import mysql from 'mysql2/promise'
import { env } from '../src/config/env.js'

const connection = await mysql.createConnection({ host: env.db.host, port: env.db.port, database: env.db.name, user: env.db.user, password: env.db.password, charset: 'utf8mb4' })
try {
  const [rows] = await connection.execute(`SELECT ps.sku, i.quantity_on_hand, i.reserved_quantity,
    i.quantity_on_hand - i.reserved_quantity AS available_quantity
    FROM product_skus ps JOIN inventory i ON i.sku_id = ps.id ORDER BY ps.sku`)
  for (const row of rows) console.log(`${row.sku}\nOn hand: ${row.quantity_on_hand}\nReserved: ${row.reserved_quantity}\nAvailable: ${row.available_quantity}\n`)
} finally {
  await connection.end()
}

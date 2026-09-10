import mysql from 'mysql2/promise'
import { env } from '../src/config/env.js'
import { adjustStock } from '../src/services/inventory.service.js'

const [sku, rawChange, note = 'Manual development adjustment'] = process.argv.slice(2)
const quantityChange = Number(rawChange)

if (!sku || !Number.isInteger(quantityChange)) {
  console.error('Usage: npm run inventory:adjust -- SKU INTEGER "Note"')
  process.exitCode = 1
} else {
  const connection = await mysql.createConnection({ host: env.db.host, port: env.db.port, database: env.db.name, user: env.db.user, password: env.db.password, charset: 'utf8mb4' })
  try {
    const result = await adjustStock(connection, sku, quantityChange, note)
    console.log(`${result.sku}: ${result.quantityBefore} -> ${result.quantityAfter} (${result.quantityChange > 0 ? '+' : ''}${result.quantityChange})`)
  } catch (error) {
    console.error(`Adjustment rejected: ${error.message}`)
    process.exitCode = 1
  } finally {
    await connection.end()
  }
}

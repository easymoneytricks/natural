import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { env } from '../src/config/env.js'
import { logger } from '../src/utils/logger.js'

const root = path.dirname(fileURLToPath(import.meta.url))
const migrationsDirectory = path.join(root, '..', 'src', 'db', 'migrations')

async function createConnection() {
  return mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    charset: 'utf8mb4',
    multipleStatements: true,
  })
}

async function run() {
  const connection = await createConnection()
  try {
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      migration_name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_name (migration_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
    const [rows] = await connection.query('SELECT migration_name FROM schema_migrations ORDER BY id')
    const applied = new Set(rows.map((row) => row.migration_name))
    const files = (await fs.readdir(migrationsDirectory)).filter((file) => file.endsWith('.sql')).sort()
    const pending = files.filter((file) => !applied.has(file))
    if (process.argv.includes('--status')) {
      console.log('Applied:')
      for (const name of applied) console.log(`  ${name}`)
      console.log('Pending:')
      for (const name of pending) console.log(`  ${name}`)
      return
    }
    for (const file of pending) {
      const sql = await fs.readFile(path.join(migrationsDirectory, file), 'utf8')
      await connection.beginTransaction()
      try {
        await connection.query(sql)
        await connection.query('INSERT INTO schema_migrations (migration_name) VALUES (?)', [file])
        await connection.commit()
        logger.info(`Applied migration ${file}`)
      } catch (error) {
        await connection.rollback()
        throw error
      }
    }
    if (!pending.length) logger.info('No pending migrations.')
  } finally {
    await connection.end()
  }
}

run().catch((error) => {
  logger.error(`Migration failed: ${error.message}`)
  process.exitCode = 1
})

import { env } from '../config/env.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { createAccessToken, createRefreshToken, hashRefreshToken } from '../utils/tokens.js'

export class AuthError extends Error {
  constructor(statusCode, code, message) { super(message); this.statusCode = statusCode; this.code = code }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/
const phonePattern = /^\d{10}$/

export function normalizeRegistration(input = {}) {
  const firstName = String(input.firstName || '').trim()
  const lastName = String(input.lastName || '').trim()
  const email = String(input.email || '').trim().toLowerCase()
  const phone = String(input.phone || '').replace(/\D/g, '')
  const password = String(input.password || '')
  if (!firstName || !lastName || !email || !phone || !password || !emailPattern.test(email) || !phonePattern.test(phone) || !passwordPattern.test(password)) throw new AuthError(400, 'VALIDATION_ERROR', 'Please provide valid account details and a password with at least 8 characters, including uppercase, lowercase and a number.')
  return { firstName, lastName, email, phone, password }
}

export function publicCustomer(row) {
  return { id: row.id, firstName: row.first_name, lastName: row.last_name, email: row.email, phone: row.phone, emailVerified: Boolean(row.email_verified_at), phoneVerified: Boolean(row.phone_verified_at), createdAt: row.created_at }
}

async function pruneSessions(connection) {
  await connection.execute('DELETE FROM customer_sessions WHERE expires_at < NOW() OR (revoked_at IS NOT NULL AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY))')
}

export async function createSession(connection, customerId, req) {
  const rawToken = createRefreshToken()
  const tokenHash = hashRefreshToken(rawToken)
  const expiresAt = new Date(Date.now() + env.auth.refreshTtlDays * 86400000)
  const [result] = await connection.execute(`INSERT INTO customer_sessions (customer_id, token_hash, expires_at, user_agent, ip_address)
    VALUES (?, ?, ?, ?, ?)`, [customerId, tokenHash, expiresAt, String(req.get('user-agent') || '').slice(0, 500) || null, req.ip || null])
  return { id: result.insertId, rawToken, accessToken: createAccessToken(customerId, result.insertId) }
}

export async function registerCustomer(pool, input, req) {
  const data = normalizeRegistration(input)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await pruneSessions(connection)
    const passwordHash = await hashPassword(data.password)
    let result
    try {
      ;[result] = await connection.execute(`INSERT INTO customers (first_name, last_name, email, phone, password_hash, status)
        VALUES (?, ?, ?, ?, ?, 'active')`, [data.firstName, data.lastName, data.email, data.phone, passwordHash])
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new AuthError(409, error.sqlMessage?.includes('phone') ? 'PHONE_ALREADY_EXISTS' : 'EMAIL_ALREADY_EXISTS', error.sqlMessage?.includes('phone') ? 'An account with this phone already exists.' : 'An account with this email already exists.')
      throw error
    }
    const [rows] = await connection.execute('SELECT * FROM customers WHERE id = ?', [result.insertId])
    const session = await createSession(connection, result.insertId, req)
    await connection.commit()
    return { customer: publicCustomer(rows[0]), ...session }
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
}

export async function loginCustomer(pool, input, req) {
  const email = String(input?.email || '').trim().toLowerCase()
  const password = String(input?.password || '')
  const [rows] = await pool.execute('SELECT * FROM customers WHERE email = ? AND deleted_at IS NULL LIMIT 1', [email])
  if (!rows.length || !(await comparePassword(password, rows[0].password_hash))) throw new AuthError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.')
  if (rows[0].status !== 'active') throw new AuthError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await pruneSessions(connection)
    await connection.execute('UPDATE customers SET last_login_at = NOW() WHERE id = ?', [rows[0].id])
    const session = await createSession(connection, rows[0].id, req)
    await connection.commit()
    return { customer: publicCustomer(rows[0]), ...session }
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
}

export async function refreshCustomerSession(pool, rawToken) {
  if (!rawToken) throw new AuthError(401, 'SESSION_EXPIRED', 'Your session has expired. Please sign in again.')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute(`SELECT cs.id AS session_id, cs.customer_id, c.* FROM customer_sessions cs JOIN customers c ON c.id = cs.customer_id
      WHERE cs.token_hash = ? AND cs.revoked_at IS NULL AND cs.expires_at > NOW() AND c.status = 'active' AND c.deleted_at IS NULL FOR UPDATE`, [hashRefreshToken(rawToken)])
    if (!rows.length) throw new AuthError(401, 'SESSION_EXPIRED', 'Your session has expired. Please sign in again.')
    const nextRawToken = createRefreshToken()
    await connection.execute('UPDATE customer_sessions SET token_hash = ?, expires_at = ?, last_used_at = NOW() WHERE id = ?', [hashRefreshToken(nextRawToken), new Date(Date.now() + env.auth.refreshTtlDays * 86400000), rows[0].session_id])
    await connection.commit()
    return { customer: publicCustomer(rows[0]), rawToken: nextRawToken, accessToken: createAccessToken(rows[0].customer_id, rows[0].session_id) }
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
}

export async function revokeSession(pool, rawToken) {
  if (rawToken) await pool.execute('UPDATE customer_sessions SET revoked_at = COALESCE(revoked_at, NOW()) WHERE token_hash = ?', [hashRefreshToken(rawToken)])
}

export async function revokeAllSessions(pool, customerId) {
  await pool.execute('UPDATE customer_sessions SET revoked_at = COALESCE(revoked_at, NOW()) WHERE customer_id = ? AND revoked_at IS NULL', [customerId])
}

export async function getActiveCustomer(pool, customerId) {
  const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ? AND status = \'active\' AND deleted_at IS NULL', [customerId])
  return rows[0] || null
}

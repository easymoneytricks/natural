import { AuthError, publicCustomer } from './auth.service.js'

const phonePattern = /^\d{10}$/
const text = (value, max) => String(value ?? '').trim().slice(0, max)

export async function getProfile(pool, customerId) {
  const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL LIMIT 1', [customerId])
  return rows[0] ? publicCustomer(rows[0]) : null
}

export async function updateProfile(pool, customerId, input = {}) {
  const firstName = text(input.firstName, 100); const lastName = text(input.lastName, 100); const phone = String(input.phone ?? '').replace(/\D/g, '')
  if (!firstName || !lastName || !phonePattern.test(phone)) throw new AuthError(400, 'VALIDATION_ERROR', 'Please provide a valid name and 10-digit phone number.')
  try { await pool.execute('UPDATE customers SET first_name = ?, last_name = ?, phone = ? WHERE id = ? AND deleted_at IS NULL', [firstName, lastName, phone, customerId]) } catch (error) { if (error.code === 'ER_DUP_ENTRY') throw new AuthError(409, 'PHONE_ALREADY_EXISTS', 'An account with this phone already exists.'); throw error }
  return getProfile(pool, customerId)
}

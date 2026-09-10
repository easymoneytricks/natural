import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const createAccessToken = (customerId, sessionId) => jwt.sign({ sub: String(customerId), type: 'customer', sessionId: String(sessionId) }, env.auth.accessSecret, { expiresIn: env.auth.accessTtl })
export const verifyAccessToken = (token) => jwt.verify(token, env.auth.accessSecret)
export const createRefreshToken = () => crypto.randomBytes(48).toString('hex')
export const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
export const refreshCookieOptions = () => ({ httpOnly: true, secure: env.nodeEnv === 'production', sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax', path: '/api/v1/auth', maxAge: env.auth.refreshTtlDays * 24 * 60 * 60 * 1000 })

import 'dotenv/config'

const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER']

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`)
}

if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
  throw new Error('JWT_ACCESS_SECRET must be configured with at least 32 characters')
}
const razorpayEnabled = process.env.RAZORPAY_ENABLED === 'true'
if (razorpayEnabled && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.RAZORPAY_WEBHOOK_SECRET)) throw new Error('RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET are required when RAZORPAY_ENABLED=true')

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
  },
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7),
    refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'nb_refresh',
  },
  razorpay: { enabled: razorpayEnabled, keyId: process.env.RAZORPAY_KEY_ID || '', keySecret: process.env.RAZORPAY_KEY_SECRET || '', webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '', reservationMinutes: Number(process.env.ONLINE_PAYMENT_RESERVATION_MINUTES || 30) },
  admin: { accessSecret: process.env.ADMIN_JWT_ACCESS_SECRET || '', accessTtl: process.env.ADMIN_ACCESS_TOKEN_TTL || '15m', refreshTtlDays: Number(process.env.ADMIN_REFRESH_TOKEN_TTL_DAYS || 7), refreshCookieName: process.env.ADMIN_REFRESH_COOKIE_NAME || 'nb_admin_refresh' },
}

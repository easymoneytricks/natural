import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";
const isPlaceholder = (value = "") =>
  /replace|change-me|example|development|secret$|generate|store-in-secret-manager|your-domain|managed-mariadb|password123|^secret$/i.test(
    value,
  );
const csv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"];

for (const key of required) {
  if (!process.env[key])
    throw new Error(`Missing required environment variable: ${key}`);
}

if (
  !process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_ACCESS_SECRET.length < 32
) {
  throw new Error(
    "JWT_ACCESS_SECRET must be configured with at least 32 characters",
  );
}
if (isProduction) {
  const requiredProduction = [
    "DB_PASSWORD",
    "JWT_ACCESS_SECRET",
    "ADMIN_JWT_ACCESS_SECRET",
    "CORS_ORIGINS",
    "STOREFRONT_URL",
    "ADMIN_URL",
    "PUBLIC_API_URL",
    "MEDIA_STORAGE_ROOT",
    "MEDIA_PUBLIC_BASE_URL",
  ];
  for (const key of requiredProduction) {
    if (!process.env[key] || isPlaceholder(process.env[key]))
      throw new Error(`${key} must be configured with a production value.`);
  }
  if (
    process.env.JWT_ACCESS_SECRET.length < 64 ||
    process.env.ADMIN_JWT_ACCESS_SECRET.length < 64 ||
    process.env.JWT_ACCESS_SECRET === process.env.ADMIN_JWT_ACCESS_SECRET
  )
    throw new Error(
      "Customer and admin JWT secrets must be separate random values of at least 64 characters.",
    );
  const origins = csv(process.env.CORS_ORIGINS);
  if (
    !origins.length ||
    origins.some((origin) => !origin.startsWith("https://"))
  )
    throw new Error("Production CORS_ORIGINS must contain only HTTPS origins.");
  for (const key of [
    "STOREFRONT_URL",
    "ADMIN_URL",
    "PUBLIC_API_URL",
    "MEDIA_PUBLIC_BASE_URL",
  ])
    if (!process.env[key].startsWith("https://"))
      throw new Error(`${key} must use HTTPS in production.`);
  if (process.env.DEV_ADMIN_PASSWORD || process.env.DEV_CUSTOMER_PASSWORD)
    throw new Error(
      "Development seed credentials must not be set in production.",
    );
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  )
    throw new Error(
      "SMTP_HOST, SMTP_USER and SMTP_PASSWORD are required in production.",
    );
}
const razorpayEnabled = process.env.RAZORPAY_ENABLED === "true";
const cashfreeEnabled = process.env.CASHFREE_ENABLED === "true";
if (
  razorpayEnabled &&
  (!process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET ||
    !process.env.RAZORPAY_WEBHOOK_SECRET)
)
  throw new Error(
    "RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET are required when RAZORPAY_ENABLED=true",
  );
if (
  cashfreeEnabled &&
  (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET)
)
  throw new Error(
    "CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET are required when CASHFREE_ENABLED=true",
  );

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
  },
  corsOrigins: csv(process.env.CORS_ORIGINS || "http://localhost:5173"),
  trustProxy: (() => {
    const value = String(process.env.TRUST_PROXY || (isProduction ? "1" : "0"))
      .trim()
      .toLowerCase();
    if (value === "false" || value === "0") return false;
    if (/^\d+$/.test(value)) return Number(value);
    if (["loopback", "linklocal", "uniquelocal"].includes(value)) return value;
    throw new Error(
      "TRUST_PROXY must be a trusted proxy hop count, false, or an Express trust-proxy subnet name.",
    );
  })(),
  requireHttps: isProduction && process.env.REQUIRE_HTTPS !== "false",
  media: {
    root: process.env.MEDIA_STORAGE_ROOT || "",
    publicBaseUrl: process.env.MEDIA_PUBLIC_BASE_URL || "",
  },
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  dbSsl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : undefined,
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessTtl: process.env.ACCESS_TOKEN_TTL || "15m",
    refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7),
    refreshCookieName: process.env.REFRESH_COOKIE_NAME || "nb_refresh",
  },
  razorpay: {
    enabled: razorpayEnabled,
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
    reservationMinutes: Number(
      process.env.ONLINE_PAYMENT_RESERVATION_MINUTES || 30,
    ),
  },
  cashfree: {
    enabled: cashfreeEnabled,
    clientId: process.env.CASHFREE_CLIENT_ID || "",
    clientSecret: process.env.CASHFREE_CLIENT_SECRET || "",
    environment:
      process.env.CASHFREE_ENVIRONMENT === "production"
        ? "production"
        : "sandbox",
    apiVersion: process.env.CASHFREE_API_VERSION || "2025-01-01",
    webhookSecret:
      process.env.CASHFREE_WEBHOOK_SECRET ||
      process.env.CASHFREE_CLIENT_SECRET ||
      "",
    reservationMinutes: Number(
      process.env.ONLINE_PAYMENT_RESERVATION_MINUTES || 30,
    ),
  },
  admin: {
    accessSecret: process.env.ADMIN_JWT_ACCESS_SECRET || "",
    accessTtl: process.env.ADMIN_ACCESS_TOKEN_TTL || "15m",
    refreshTtlDays: Number(process.env.ADMIN_REFRESH_TOKEN_TTL_DAYS || 7),
    refreshCookieName:
      process.env.ADMIN_REFRESH_COOKIE_NAME || "nb_admin_refresh",
  },
};

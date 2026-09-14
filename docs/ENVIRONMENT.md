# Environment variable reference

Last audited: 2026-09-15. Use the example files as templates only; filled `.env` files and provider secrets must stay outside Git.

Vite variables are compiled into public browser JavaScript at build time. Configure them before building and rebuild after changing them. Never put a secret in any `VITE_*` value.

## Storefront

| Variable | Required in production | Secret | Example format | Purpose and failure behaviour |
|---|---:|---:|---|---|
| `VITE_API_BASE_URL` | Yes | No | `https://api.example.com/api/v1` | Public API base URL. A missing, local or non-HTTPS value blocks the production build. |
| `VITE_SITE_URL` | Yes | No | `https://www.example.com` | Canonical storefront URL for client-side metadata. A missing, local or non-HTTPS value blocks the production build. |

Template: `storefront/.env.production.example`.

## Admin

| Variable | Required in production | Secret | Example format | Purpose and failure behaviour |
|---|---:|---:|---|---|
| `VITE_API_BASE_URL` | Yes | No | `https://api.example.com/api/v1` | Public API base URL. A missing, local or non-HTTPS value blocks the production build. |
| `VITE_STOREFRONT_URL` | Yes | No | `https://www.example.com` | Storefront URL used by Admin links/previews. A missing, local or non-HTTPS value blocks the production build. |

Template: `admin/.env.production.example`.

## Backend runtime and URLs

| Variable | Required in production | Secret | Example format | Purpose and failure behaviour |
|---|---:|---:|---|---|
| `NODE_ENV` | Yes | No | `production` | Enables production validation, cookies and HTTPS behaviour. |
| `PORT` | Yes | No | `4000` | API listener port supplied to the hosting runtime. |
| `STOREFRONT_URL` | Yes | No | `https://www.example.com` | Customer links in mail and public URL generation. Must use HTTPS. |
| `ADMIN_URL` | Yes | No | `https://admin.example.com` | Admin links in notifications. Must use HTTPS. |
| `PUBLIC_API_URL` | Yes | No | `https://api.example.com` | Public API/callback base; Cashfree webhook URL is derived from it. Must use HTTPS. |
| `CORS_ORIGINS` | Yes | No | `https://www.example.com,https://admin.example.com` | Comma-separated browser-origin allowlist. Production accepts HTTPS origins only. |
| `TRUST_PROXY` | Yes | No | `1` | Trusted reverse-proxy hop count, `false`, or approved Express subnet name. Do not use an unrestricted value. |
| `REQUIRE_HTTPS` | Yes | No | `true` | Rejects non-HTTPS API requests except health/webhook routes behind the proxy. |
| `COOKIE_DOMAIN` | Conditional | No | `.example.com` | Leave blank for host-only cookies; use parent domain only when the intended cookie topology requires it. |

## Backend database and media

| Variable | Required in production | Secret | Example format | Purpose and failure behaviour |
|---|---:|---:|---|---|
| `DB_HOST` | Yes | No | `db.provider.example` | MariaDB host. Missing fails startup. |
| `DB_PORT` | Yes | No | `3306` | MariaDB port. Missing fails validation. |
| `DB_NAME` | Yes | No | `naturalbeauty_production` | Application database name. |
| `DB_USER` | Yes | No | `naturalbeauty_app` | Least-privilege application user. |
| `DB_PASSWORD` | Yes | Yes | provider-managed secret | Database password. Missing/placeholder fails production validation. |
| `DB_SSL` | Provider dependent | No | `true` | Enables MariaDB TLS. |
| `DB_SSL_REJECT_UNAUTHORIZED` | Provider dependent | No | `true` | Keep true unless the provider has documented certificate handling. |
| `MEDIA_STORAGE_ROOT` | Yes | No | `/home/account/naturalbeauty-media/uploads` | Persistent upload directory. Missing/placeholder fails production validation. |
| `MEDIA_PUBLIC_BASE_URL` | Yes | No | `https://api.example.com/uploads` | HTTPS public base for uploaded media. Missing/placeholder fails production validation. |
| `MEDIA_SCAN_COMMAND` | No | No | provider-specific executable path | Optional scanner command run before accepting an upload. |

## Backend customer and Admin authentication

| Variable | Required in production | Secret | Example format | Purpose and failure behaviour |
|---|---:|---:|---|---|
| `JWT_ACCESS_SECRET` | Yes | Yes | 64+ random characters | Customer access-token signing secret. Must differ from Admin secret; bad/missing value fails validation. |
| `ACCESS_TOKEN_TTL` | No | No | `15m` | Customer access-token lifetime. |
| `REFRESH_TOKEN_TTL_DAYS` | No | No | `7` | Customer refresh-token lifetime. |
| `REFRESH_COOKIE_NAME` | No | No | `nb_refresh` | Customer refresh cookie name. |
| `ADMIN_JWT_ACCESS_SECRET` | Yes | Yes | different 64+ random characters | Admin access-token signing secret. Must differ from customer secret; bad/missing value fails validation. |
| `ADMIN_ACCESS_TOKEN_TTL` | No | No | `15m` | Admin access-token lifetime. |
| `ADMIN_REFRESH_TOKEN_TTL_DAYS` | No | No | `7` | Admin refresh-token lifetime. |
| `ADMIN_REFRESH_COOKIE_NAME` | No | No | `nb_admin_refresh` | Admin refresh cookie name. |

Generate each production/staging secret independently:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Never reuse customer/Admin secrets, and never reuse staging/production secrets. `DEV_CUSTOMER_PASSWORD`, `DEV_ADMIN_EMAIL` and `DEV_ADMIN_PASSWORD` are development seed variables; do not configure them in production.

## Backend email and payments

| Variable | Required in production | Secret | Example format | Purpose and failure behaviour |
|---|---:|---:|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Yes | Password only | provider values | Environment SMTP fallback. Missing host/user/password fails production validation. Admin Settings SMTP values take precedence when saved. |
| `SMTP_FROM_EMAIL` | Recommended | No | `orders@example.com` | Sender address; falls back to SMTP username. |
| `ADMIN_NOTIFICATION_EMAIL` | Recommended | No | `ops@example.com` | Recipient for order/contact notifications. |
| `CASHFREE_ENABLED` | No | No | `false` | Enables Cashfree only when credentials exist. Keep false initially. |
| `CASHFREE_ENVIRONMENT` | When enabled | No | `sandbox` | `sandbox` or `production`; initial deployment uses sandbox. |
| `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CASHFREE_WEBHOOK_SECRET` | When enabled | Yes | provider secrets | Backend-only Cashfree credentials. |
| `CASHFREE_API_VERSION` | No | No | `2025-01-01` | Cashfree API version header. |
| `RAZORPAY_ENABLED` | No | No | `false` | Enables Razorpay only when credentials exist. Keep false initially. |
| `RAZORPAY_KEY_ID` | When enabled | Browser-safe ID | provider value | Sent to browser only for the selected Razorpay checkout. |
| `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | When enabled | Yes | provider secrets | Backend-only Razorpay signing/webhook secrets. |
| `ONLINE_PAYMENT_RESERVATION_MINUTES` | No | No | `30` | Reservation period for initiated online payment. |

## Operational scripts

| Variable | Required in production | Secret | Example format | Purpose |
|---|---:|---:|---|---|
| `BACKUP_DIR` | Required for backups | No | `/secure/backups/naturalbeauty` | Backup destination, outside the web root and active release directory. |
| `BACKUP_RETENTION_DAYS` | Recommended | No | `30` | Retention used by `backup:prune`. |
| `CONFIRM_RESTORE` | Only for restore | No | `YES` | Explicit destructive restore acknowledgement. Do not set persistently. |

Template: `backend/.env.production.example`. Run `NODE_ENV=production npm run --workspace natural-beauty-api validate:production` before deployment.

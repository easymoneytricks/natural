# First hosted deployment runbook

This is a controlled staging/inspection deployment, not the public commerce launch. Keep **Admin → Settings → Store availability** set to **Closed** or **Coming soon**. Catalog browsing remains available while backend order creation is blocked. Keep Cashfree/Razorpay in sandbox/test mode and never enable public paid ordering in this pass.

## 1. Recommended architecture

Use three HTTPS hostnames (placeholders only):

| Service | Example | Deployment |
|---|---|---|
| Storefront | `https://www.example.com` | `storefront/dist` static files |
| Admin | `https://admin.example.com` | `admin/dist` static files |
| API and media | `https://api.example.com` | Node.js backend and persistent `/uploads` |

Subdomains fit the current separate Vite apps and Express API cleanly. Do not recommend a path-hosted Admin unless the hosting configuration and SPA base path are separately verified.

Once the owner has real domains, set these exact values consistently: storefront `VITE_SITE_URL`, Admin `VITE_STOREFRONT_URL`, backend `STOREFRONT_URL`, `ADMIN_URL`, `PUBLIC_API_URL`, `MEDIA_PUBLIC_BASE_URL` and `CORS_ORIGINS`.

## 2. Hosting prerequisites

- Node.js version compatible with the repository dependencies (use the version approved by the hosting provider; current package files do not pin `engines`).
- MariaDB/MySQL with `utf8mb4`, a dedicated non-root application user, and TLS if the provider supports it.
- Three HTTPS domains/subdomains, or an equivalent provider-approved routing arrangement.
- A persistent directory outside the release/application directory for uploads and backups.
- `mysqldump` and `mysql` available to the Node.js process for the supplied backup/restore scripts.

For cPanel, create the Node.js application with `backend` as the application root and `src/server.js` as the startup file. Exact UI labels and restart/log locations are hosting-provider-specific. Serve `storefront/dist` and `admin/dist` through their mapped document roots; do not use `vite preview` in production.

## 3. Repository and environment preparation

Install only production-approved dependencies and build from the reviewed revision:

```bash
npm ci
npm run format:check
npm run build
```

Copy templates into the hosting provider's private environment configuration, never into Git:

```text
storefront/.env.production.example
admin/.env.production.example
backend/.env.production.example
```

Vite variables are embedded when `npm run build` runs. Change a frontend URL only before rebuilding its corresponding static app.

Generate separate customer/Admin values for `JWT_ACCESS_SECRET` and `ADMIN_JWT_ACCESS_SECRET`, both at least 64 characters. Use separate staging and production secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Validate backend configuration before starting it:

```bash
NODE_ENV=production npm run --workspace natural-beauty-api validate:production
```

The validation reuses backend boot validation. It rejects missing production DB/media/URL/CORS configuration, insecure placeholder values, equal or short customer/Admin JWT secrets, non-HTTPS public URLs/CORS origins, and development seed credentials. It requires payment credentials only when the matching provider is enabled.

## 4. Database and migration procedure

Create a database and least-privilege user with a UTF-8 collation suitable for `utf8mb4`; do not use the database root account. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`, and `DB_SSL_REJECT_UNAUTHORIZED` in the private backend environment.

Production startup does not run migrations, seed data, reset data, or demo fixtures. `seed:dev` explicitly refuses `NODE_ENV=production`.

For each release:

```bash
BACKUP_DIR=/secure/backups/naturalbeauty npm run --workspace natural-beauty-api backup:production
npm run migrate
npm run --workspace natural-beauty-api migrate:status
```

Run the backup first. Review migration status, then start/restart the backend. Do not run `seed:dev`, `remove:demo-data`, or reset tooling against production.

## 5. Persistent media

`MEDIA_STORAGE_ROOT` must be a persistent writable directory, for example `/home/account/naturalbeauty-media/uploads`, not `backend/storage/uploads` inside a disposable release. Configure `MEDIA_PUBLIC_BASE_URL=https://api.example.com/uploads` and ensure the API host serves `/uploads` from this same persistent directory.

On cPanel, keep the application/release directory and upload directory separate so redeployment cannot remove product, brand, category, gallery or media-library uploads. Back up the persistent upload directory with the database. Confirm a deployed image resolves from the API media URL with no localhost host name.

## 6. HTTPS, reverse proxy, CORS and cookies

Terminate TLS at the approved reverse proxy/load balancer and forward `X-Forwarded-Proto: https`. Set `TRUST_PROXY` to the verified number of proxy hops (normally `1` for one trusted proxy); never use an unrestricted proxy trust setting. Set `REQUIRE_HTTPS=true`.

Set an explicit comma-separated `CORS_ORIGINS` list, for example:

```text
https://www.example.com,https://admin.example.com
```

Do not use `*` for authenticated APIs. Browser unsafe requests from an unexpected origin are rejected. Customer and Admin access secrets are independent; refresh cookies are `HttpOnly`, `Secure`, `SameSite=Strict` in production. Leave `COOKIE_DOMAIN` blank for host-only cookies; use a parent domain only when cross-subdomain cookie behaviour has been deliberately tested.

## 7. Build and start

Build output is `storefront/dist` and `admin/dist`; the backend runtime uses the non-development command. Both dist folders include an `.htaccess` SPA fallback so direct visits and refreshes of client routes such as `/shop` and `/journal` resolve to `index.html` on Apache:

```bash
npm run build:storefront
npm run build:admin
npm run --workspace natural-beauty-api start
```

When deploying to Apache/cPanel, copy hidden files from each `dist` folder and ensure `mod_rewrite` and `AllowOverride FileInfo` (or `All`) are enabled for the document root. If `.htaccess` is blocked by the host, add the equivalent rewrite rule in the virtual-host configuration.

The backend listens on `PORT` (default `4000`) and binds all interfaces. Health check:

```text
https://api.example.com/api/health
```

The health response reports service/database status only and does not return secrets. Inspect host logs for `X-Request-ID`, method, path, status and duration. Do not log passwords, tokens, OTP values, card data, payment secrets or SMTP credentials.

## 8. Admin first configuration

1. Sign in through the deployed Admin URL.
2. Set **Settings → Store availability** to **Closed** or **Coming soon** before any checkout testing.
3. Confirm branding, footer contact details, SEO canonical URL and support details.
4. Configure SMTP in **Settings** if using persisted values. Persisted SMTP settings take precedence over environment fallback. Use the existing SMTP test-send control, then verify a real inbox.
5. Configure reCAPTCHA v2 in **Settings** after registering the real storefront domain with Google. Keep the secret server-side; it never belongs in Vite variables.
6. Configure GA4 in **Settings** if desired. Respect the existing optional-consent behaviour; do not load analytics before consent.

SMTP smoke tests: signup OTP, password reset, order confirmation, Admin new-order notification, order-status update and contact acknowledgement. Do not claim production email verification until these reach real inboxes.

## 9. Payment sandbox and webhooks

Keep the selected payment provider disabled unless sandbox credentials are configured and the store remains closed/coming soon. Provider secrets are backend-only.

Cashfree webhook URL:

```text
https://api.example.com/api/v1/webhooks/cashfree
```

Razorpay webhook URL:

```text
https://api.example.com/api/v1/webhooks/razorpay
```

In the provider dashboard, configure the matching sandbox/test webhook secret, then test signature verification, duplicate callback idempotency, delayed payment and failed-payment reservation release. Do not enable live payment mode or public paid ordering in this deployment.

## 10. SEO and manual hosted smoke test

Verify no response, page metadata, sitemap, robots rule, Open Graph URL, JSON-LD record or uploaded image URL contains `localhost`, `127.0.0.1`, or a development port. Check canonical URLs, product/collection/breadcrumb/FAQ JSON-LD and product slug redirects.

Perform hosted desktop and mobile checks:

- Storefront: Home, Shop, Search, filters, category, brand, product/gallery/SKU, wishlist, compare, cart, login/register/OTP/reset, account/orders/addresses, Contact, FAQ, About, legal pages, footer and mobile menu.
- Admin: login, dashboard, products/create/edit/gallery/SKU, inventory, orders, customers, coupons, gift cards, reviews, media, pages, settings, users/RBAC, audit and system views.
- Infrastructure: health, console/network errors, media 404s, CORS, HTTPS, cookie/session behaviour, SMTP, payment sandbox/webhooks, logs and backup creation.

Observe document/JS load, API TTFB, catalog/product timing, image sizes/waterfalls, 404s, duplicate requests, layout shifts and mobile responsiveness. Optimise only from observed staging evidence.

## 11. Backup, restore and rollback

Create backups outside web roots and active release directories:

```bash
BACKUP_DIR=/secure/backups/naturalbeauty npm run --workspace natural-beauty-api backup:production
BACKUP_RETENTION_DAYS=30 BACKUP_DIR=/secure/backups/naturalbeauty npm run --workspace natural-beauty-api backup:prune
```

The backup contains a MariaDB dump, persistent uploads and a manifest. Encrypt/store copies outside the active host. Restore is destructive and confirmation-gated:

```bash
CONFIRM_RESTORE=YES npm run --workspace natural-beauty-api restore:production -- /secure/backups/naturalbeauty/<timestamp>
```

Before restore: stop writes or keep the store closed, back up current state, obtain approval, restore database/media, verify migration state, then run health/catalog/login/order-read smoke tests.

Application rollback means redeploying the previous reviewed static/backend artifact. Database rollback is not a blind migration reversal: use the approved backup/recovery plan for commerce data.

## 12. Optional Cloudflare

Cloudflare is optional. If used: configure DNS, use SSL **Full (Strict)** (never Flexible), do not cache authenticated API responses, and confirm `/api/v1`/webhooks pass through without alteration. Static uploads may be cached only according to the API's existing cache headers.

## 13. Launch boundary

This pass proves hosted UI, mobile, API, media, authentication, SMTP staging and sandbox payment behaviour. It does not prove live settlement/refunds, inbox delivery at production scale, concurrency safety, restore success, legal compliance or real-world load. Use [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) before progressing toward a public paid launch.

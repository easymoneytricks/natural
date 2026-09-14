# First deployment checklist

Use this for the first hosted staging/inspection deployment. It is not a public paid-launch approval.

## Pre-deploy

- [ ] Real production/staging domains are selected for storefront, Admin and API.
- [ ] `storefront/.env.production` was created privately from its example before building.
- [ ] `admin/.env.production` was created privately from its example before building.
- [ ] Backend hosting environment was configured privately from `backend/.env.production.example`.
- [ ] No password, token, payment secret, SMTP password, private reCAPTCHA key or DB credential was put in a Vite variable.
- [ ] Customer/Admin JWT secrets are independent 64+ character random values.
- [ ] Staging and production secret sets differ.
- [ ] No localhost, development port, placeholder or HTTP public URL remains in production variables.
- [ ] `NODE_ENV=production npm run --workspace natural-beauty-api validate:production` succeeds.
- [ ] `npm run format:check` succeeds.
- [ ] `npm run build` succeeds.

## Deployment and database

- [ ] Node.js application is configured with `backend/src/server.js` startup file (hosting-provider-specific setup).
- [ ] Backend starts through `npm run --workspace natural-beauty-api start`, not `dev`.
- [ ] Dedicated non-root MariaDB/MySQL runtime user exists with least privilege.
- [ ] Database uses `utf8mb4`; TLS configuration was reviewed where supported.
- [ ] Backup completed before migration.
- [ ] `npm run migrate` completed and `migrate:status` was reviewed.
- [ ] No seed/reset/demo-data command was run in production.
- [ ] `https://api.example.com/api/health` returns healthy database status.

## Media

- [ ] `MEDIA_STORAGE_ROOT` is a persistent path outside the release/application directory.
- [ ] `MEDIA_PUBLIC_BASE_URL` uses the production API/media hostname.
- [ ] Product gallery, brand, category and media-library images load with no 404.
- [ ] Uploads still exist after a test application redeploy.
- [ ] Database and persistent media are included in a backup.

## Security and network

- [ ] HTTPS works on storefront, Admin and API.
- [ ] Reverse proxy forwards `X-Forwarded-Proto: https`.
- [ ] `TRUST_PROXY` matches the actual trusted proxy hop count.
- [ ] `REQUIRE_HTTPS=true` is enabled.
- [ ] CORS accepts the storefront origin.
- [ ] CORS accepts the Admin origin.
- [ ] An unexpected browser origin is rejected for unsafe requests.
- [ ] Cookie domain/session refresh behaviour is tested for the chosen domain topology.
- [ ] Customer/Admin authentication remains separate.
- [ ] Rate limits remain active for login, signup, OTP, reset, contact and payment mutations.

## Storefront and Admin

- [ ] Store availability is **Closed** or **Coming soon** before public inspection.
- [ ] Catalog and product pages remain browsable.
- [ ] Order creation is blocked while store availability is closed/coming soon.
- [ ] Storefront build is deployed from `storefront/dist`.
- [ ] Admin build is deployed from `admin/dist`.
- [ ] Storefront desktop/mobile smoke test completed: home, shop, search, filters, category, brand, product/gallery/SKU, wishlist, compare, cart, login/register/OTP/reset, account/orders/addresses, contact, FAQ, About, legal pages, footer, mobile menu.
- [ ] Admin smoke test completed: login, dashboard, products/create/edit/gallery/SKU, inventory, orders, customers, coupons, gift cards, reviews, media, pages, settings, users/RBAC, audit, system.
- [ ] Browser console and network logs have no unexpected failed requests.

## Email, reCAPTCHA and analytics

- [ ] SMTP host/port/TLS/user/password/sender/admin-recipient values are configured.
- [ ] Admin SMTP test send reached a real inbox.
- [ ] Signup OTP email reached a real inbox.
- [ ] Password reset email reached a real inbox.
- [ ] Order confirmation, Admin order notification and status update are tested when safe.
- [ ] Contact acknowledgement is tested.
- [ ] reCAPTCHA v2 domain is registered; site/secret keys were configured in Admin Settings.
- [ ] Signup and contact reCAPTCHA checks pass.
- [ ] GA4 remains disabled until optional analytics consent when enabled.

## Payments and orders

- [ ] Cashfree/Razorpay remain disabled or use sandbox/test credentials only.
- [ ] Selected provider webhook URL is configured exactly.
- [ ] Webhook signature verification was tested.
- [ ] Duplicate callback does not duplicate an order/payment.
- [ ] Failed/delayed payment releases or preserves reservation correctly.
- [ ] Cancellation releases reservation.
- [ ] Coupon/gift-card balances behave correctly for the test lifecycle.
- [ ] Invoice download works.

## SEO, performance and backup

- [ ] Canonical site URLs, Open Graph URLs, sitemap and robots use the production domain.
- [ ] Product/collection/breadcrumb/FAQ JSON-LD is checked on hosted pages.
- [ ] No generated URL contains localhost, `127.0.0.1` or a development port.
- [ ] Initial load, JS bundle loading, API TTFB, catalog/product timing, image sizes/waterfalls, layout shifts and mobile responsiveness were observed.
- [ ] Backup directory is outside public web root and active release directory.
- [ ] A backup and manifest were created successfully.
- [ ] Restore procedure is understood and scheduled for a non-production rehearsal.
- [ ] Logs can be inspected with `X-Request-ID`; alerts/uptime monitor are configured for health failures and server errors.

## Go-live and post-launch

- [ ] Do not open the store or enable live payments until P0 items in [gaps.md](gaps.md) are evidenced.
- [ ] Live payment settlement/refund, SMTP delivery, concurrency and restore drills are separately approved.
- [ ] Tax/legal/consent wording is approved by the owner/adviser.
- [ ] Post-launch monitoring includes health, 5xx/429 rates, payment callback failures, order lag, media errors and backup success.

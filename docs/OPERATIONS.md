# Operations and release hardening

## Observability

Every API response includes an `X-Request-ID`. The API emits JSON logs with timestamp, method, path, status and duration; error responses include the same request ID for support correlation. Forward these logs to the host's central log service and alert on 5xx rate, 429 rate, health failures, payment callback failures and order status lag.

The existing Admin Reports/System surfaces are the operational dashboard for orders, paid revenue, stock and payment states. A production deployment should add uptime monitoring for `/api/health` and alert destinations through the hosting provider; no credentials belong in this repository.

## Backups and rollback

Run `npm run --workspace natural-beauty-api backup:production` to create a transaction-consistent MariaDB dump, uploads copy and manifest. Store `BACKUP_DIR` outside the application host, encrypt it, and retain at least 30 days (or the period approved by the data owner). Prune only the configured backup directory with `BACKUP_RETENTION_DAYS=30 npm run --workspace natural-beauty-api backup:prune`.

Before every migration: create a backup, record the migration name and deploy artifact, and verify `/api/health`. For rollback, freeze writes, obtain incident approval, restore to a new database or the last verified backup, deploy the previous artifact, and run health/catalog/login/order-read checks. Never test restore against production data without an approved change window.

## Performance and accessibility budgets

- Initial storefront JavaScript: 450 kB gzip maximum; route chunks should be measured in CI.
- Largest Contentful Paint: under 2.5 seconds on a mid-tier mobile profile; cumulative layout shift under 0.1.
- Images: use the existing managed media paths and immutable cache headers; add generated width derivatives/srcset before uploading large editorial assets.
- Keyboard-only navigation must reach every control, keep a visible focus ring and trap modal focus. Every form control needs a label or accessible name; status/error messages use live regions.
- Verify WCAG AA contrast and `prefers-reduced-motion`; the storefront already disables transitions and smooth scrolling for reduced-motion users.

Run Lighthouse/axe and a responsive screenshot suite on `/`, `/shop`, product detail, cart, checkout, login, account, contact and each CMS page before release. Add a load test against staging for catalog reads, quote, login, COD and payment callbacks; do not load-test production.

## Abuse and consent controls

Auth, contact, quote, order and payment mutations have route-level rate limits plus the API-wide limiter. Keep payment webhooks signature-verified and excluded from origin enforcement. Browser unsafe requests with an untrusted `Origin` are rejected; bearer-authenticated APIs do not rely on ambient cookies.

The storefront consent banner records necessary-only versus optional-analytics consent locally. No optional analytics is loaded without an explicit opt-in. Marketing email must always include an authenticated unsubscribe path and suppression list before campaigns are enabled.

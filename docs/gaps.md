# Natural Beauty — Production Ecommerce Gap Report

Last audited: 2026-09-14  
Audit basis: repository source, database migrations, registered routes, frontend integrations, local builds and the authenticated admin browser session.  
Scope: storefront, customer commerce, admin operations, infrastructure, security and launch readiness.

## Executive verdict

Natural Beauty is a strong local full-stack foundation, but it is not production-ready yet. The catalog database, customer authentication foundation, server-side pricing, cart/order primitives, RBAC, admin settings and CMS Pages foundation are present. The remaining risk is not the number of screens; it is the number of production guarantees that still need to be proven: real payment finalization, real email delivery, complete fixture removal, transactional edge cases, observability, deployment secrets and automated regression coverage.

Estimated current readiness: **about 65% for a controlled staging launch; not ready for public production checkout**.

## What a production ecommerce site must contain

1. **Storefront discovery:** responsive navigation, search, category/concern browsing, filters, sorting, pagination, product detail, related products, SEO metadata, 404 and useful empty/error states.
2. **Catalog integrity:** brands, categories, product content, explicit SKUs, variant attributes, prices/MRP, tax classification, media, stock status, publish/archive lifecycle and immutable historical snapshots.
3. **Customer identity:** registration, login, logout, session refresh, password reset email, profile, addresses, consent and account security controls.
4. **Commerce:** guest and customer cart, wishlist, compare (optional), authoritative server quote, coupons, gift cards, shipping, taxes, inventory reservation and idempotent order creation.
5. **Payments:** provider order creation, client checkout, signature verification, webhook verification, payment/order state reconciliation, retries, refunds and failure recovery.
6. **Fulfilment:** order list/detail, status transitions, packing/shipping tracking, cancellation, return/refund workflow, stock release and customer notifications.
7. **Communication:** SMTP/provider configuration, order confirmation, payment failure, shipment and cancellation email templates, admin alerts, retry/logging and unsubscribe/compliance handling.
8. **Admin control plane:** dashboard, catalog CRUD, media library, inventory, orders, customers, promotions, staff/RBAC, audit log, reports, settings, Pages/CMS and safe destructive actions.
9. **Content/SEO:** legal pages, policies, about/contact, canonical URLs, metadata, sitemap, robots, Open Graph, structured data and redirect/slug lifecycle.
10. **Trust and compliance:** privacy/terms/returns, consent, GST/tax presentation, PCI boundary, data retention/deletion, rate limits, secure cookies, CSRF/CORS policy, upload security and auditability.
11. **Operations:** environment separation, migrations, backups, monitoring, logs, alerting, health checks, deployment rollback, image storage/CDN, email/payment secrets and incident runbooks.
12. **Quality:** unit, integration, API contract, browser E2E, accessibility, responsive, performance and security tests with a repeatable staging dataset.

## Present in this repository

| Capability                        | Current evidence                                                                              | Assessment                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Workspace and development         | Root workspaces, dev/build/migrate/format scripts                                             | Present; production process still needs deployment proof                   |
| Backend foundation                | Express app, MariaDB pool, migrations 001–017, health/error middleware                        | Present                                                                    |
| Catalog data model                | Brands, categories, products, content, attributes, media and SKUs                             | Present; browser completion gates remain for some editor flows             |
| Public catalog API                | Product/category/brand routes, filters and SKU payloads                                       | Present; live seeded runtime regression is still needed                    |
| Storefront catalog                | Shop and PDP consume catalog services without fixture fallback                                | API-backed; browser/API outage states still need release regression        |
| Customer auth                     | Login/register/session/token services and AuthContext                                         | Foundation present; password reset token/email flow remains                |
| Profile and addresses             | Backend routes and account forms                                                              | API-backed; browser persistence regression remains                         |
| Cart and wishlist                 | Guest/local state plus server customer cart/wishlist and merge flow                           | Present foundation; server quote and browser regression remain             |
| Pricing and checkout quote        | Integer paise quote engine, shipping/coupon/gift-card inputs                                  | Present; rewards and payment finalization are incomplete                   |
| Coupons and gift cards            | Database, validation, limits, holds/transactions and Admin UI                                 | Present foundation; reversal and browser persistence gates remain          |
| Shipping and tax                  | Configurable settings and quote/order snapshot fields                                         | Present foundation; provider/zone/rule sophistication is limited           |
| COD orders                        | Reservation-aware order path and Admin lifecycle services                                     | Present foundation; full E2E reconciliation is still required              |
| Razorpay                          | SDK dependency, create/verify routes and webhook foundation                                   | Not production-complete; provider finalization is intentionally incomplete |
| Customer orders                   | Backend order routes, account order/detail pages                                              | API-backed; fulfilment/refund and invoice release controls remain          |
| Admin shell and RBAC              | Protected routes, staff/users, roles, permissions, audit log                                  | Present and browser-verified at route level                                |
| Admin catalog                     | Brands, categories, products, explicit SKU/media editor                                       | Meaningful implementation; product browser gate still open                 |
| Admin inventory                   | Inventory list, adjustment and movement detail surfaces                                       | Partially complete; idempotency and full workflow QA remain                |
| Admin orders/customers/promotions | Orders, customer, coupon and gift-card pages plus APIs                                        | Present foundation; production browser regression remains                  |
| Admin media                       | Upload/library and product/brand/category usage                                               | Present; deep file validation and lifecycle polish remain                  |
| Admin settings                    | Branding, SEO, shipping, tax, SMTP fields, homepage visibility, nav/footer and store settings | Present foundation; SMTP transport/test-send not wired                     |
| Admin Pages CMS                   | Create/edit, slug, sections, draft/published/archived, SEO, public `/pages/:slug`             | Present; legacy legal routes are still source-driven                       |
| Contact                           | Public submission form, admin inbox, status/note workflow                                     | Present and browser-verified                                               |
| Storefront UI                     | Header/footer, homepage, shop, PDP, cart, auth, account, contact and legal styling            | Present visually; data/runtime and accessibility regression still needed   |

## Gap register

### P0 — Must close before accepting real customer payments

1. **Razorpay production lifecycle** — create provider order, verify signature, process verified webhooks idempotently, reconcile delayed/failed payments, and prevent order fulfilment before payment/COD authorization. Add refund handling and signature/webhook replay tests.
2. **Real transactional email** — SMTP transport, order/customer/admin templates, retry attempts, delivery logs and an admin test-send action are now implemented. The remaining release gate is configuring a real provider and proving delivery from the public staging environment.
3. **Complete account recovery and commerce release gates** — legacy storefront fixtures have been removed. Production mode must continue to fail clearly when APIs are unavailable instead of showing fake orders, prices or balances.
4. **Inventory/order transaction audit** — reservation/release, cancellation atomicity, payment-failure release, duplicate requests and coupon-limit rechecks are now protected by row locks and shared transactions. Remaining release gate: run these cases in a clean staging environment with concurrent integration/E2E runners.
5. **Production secrets and deployment** — production validation, secure cookies, CORS/HTTPS enforcement, TLS DB configuration, persistent media path, backup/restore scripts and rollback runbook are implemented. Remaining release gate: configure provider-managed secrets, durable storage, scheduled encrypted backups and a successful restore drill.
6. **Automated critical-path tests** — add API integration and browser E2E coverage for login, catalog, cart, quote, COD, online payment callback, order confirmation, admin status update and stock release.

### P1 — Must close before a serious public launch

1. **Admin product completion gate** — browser-verify create/edit/reload, allowed values, explicit SKU duplication rejection, gallery upload/order/primary/remove, archive/restore and storefront preview.
2. **Inventory UX completion** — idempotency key/reason capture, adjustment confirmation, movement filters, low-stock views, CSV export and clear reserved/available quantities.
3. **Admin order operations** — shipment/tracking fields, cancellation reasons, return/refund states, invoice download, customer email trigger and immutable order snapshot display.
4. **Customer account integrity** — replace dashboard demo data with authenticated APIs, real password reset email/token expiry, address validation, session revocation and account deletion/export policy.
5. **Promotion and gift-card reversals** — restore coupon usage and gift-card holds/balances on cancellation/refund, and add expiry/time-zone tests.
6. **Rewards lifecycle** — configure earn/redeem rules, apply points in quote, reserve/reverse ledger entries, handle cancellation/refund and add Admin configuration/audit UI.
7. **Pages/legal migration** — migrate approved privacy, terms, shipping, returns, refund and cancellation content into Pages records; route legacy URLs through CMS while preserving redirects and version/audit history.
8. **SEO completion** — canonical metadata per route, sitemap generation, robots policy, Open Graph/Twitter image handling, product/category schema and slug redirect handling.
9. **Search and discovery** — server-backed product search, debounced request cancellation, no-result suggestions, filter URL state and pagination/performance checks.
10. **Media security** — inspect file signatures, image dimensions/limits, sanitize names, virus-scan or provider scan, private/original derivative policy and orphan cleanup.

### P2 — Quality, scale and operational hardening

1. Add reusable admin design-system components and consistent loading/error/empty/confirmation states across every route.
2. Add accessibility audit: keyboard navigation, focus traps, labels, contrast, reduced motion and screen-reader announcements.
3. Add performance budgets, responsive visual regression, image optimization/srcset, lazy loading and CDN/cache headers.
4. Add structured logs, request IDs, payment/order audit dashboards, uptime monitoring and alerting.
5. Add database backup/restore drill, migration rollback notes, data retention and anonymized staging seed process.
6. Add rate limits and abuse controls for login, reset, contact, coupons, gift cards and payment endpoints; review CSRF strategy for cookie-authenticated flows.
7. Add analytics/consent management, transactional email unsubscribe rules where applicable, cookie/privacy documentation and GST invoice/legal review.
8. Add operational reports: net sales, tax, discounts, refunds, inventory valuation, low stock, customer cohorts and export permissions.

## Step-by-step gap closure plan

### Phase 1 — Stabilize the production boundary

1. Freeze schema/API contracts and create a staging environment.
2. Remove or feature-flag all demo fixtures; seed only clearly marked staging data.
3. Configure secrets and HTTPS/CORS/cookies for staging.
4. Implement SMTP transport, test-send, templates and delivery logging.
5. Add payment provider order/verify/webhook/refund implementation with idempotency.
6. Run payment sandbox tests and verify that no unverified payment can become fulfilable.

### Phase 2 — Prove money and stock correctness

1. Write integration tests for quote totals, tax, shipping, coupon, gift-card and reward arithmetic.
2. Test concurrent stock reservations, expiry, cancellation, payment failure and duplicate order requests.
3. Add order invoice generation/download and customer/admin notification events.
4. Verify COD and online orders in a clean staging database with real API requests.

### Phase 3 — Finish Admin operations

1. Close the Product/SKU browser completion gate.
2. Finish inventory adjustment/history/export and low-stock workflows.
3. Finish order fulfilment, cancellation, return/refund and invoice actions.
4. Replace list-only customer screens with customer detail, status, sessions and activity.
5. Complete promotion/gift-card reversal controls and reports.

### Phase 4 — Make the storefront genuinely data-driven

1. Remove account, product, promotion and comparison fixture fallbacks from production builds.
2. Connect all legal/static URLs to approved Pages CMS records.
3. Add server-backed search, canonical SEO, sitemap and structured data.
4. Verify every route has header/footer, loading, empty, error and mobile states.

### Phase 5 — Release engineering and launch gate

1. Run unit, integration, E2E, accessibility, security and responsive regression suites.
2. Run backup/restore and migration rehearsal.
3. Load-test catalog/search and checkout endpoints.
4. Review tax, invoice, privacy, refund and payment-provider compliance with the business owner.
5. Promote staging to production only after all P0 items are green and signed off.

## Evidence and limitations

- Local `npm run build` and `npm run format:check` pass for the current source.
- Migration 017 is applied locally and Pages admin route was browser-verified.
- Contact, settings and several Admin route surfaces were browser-verified in the local authenticated session.
- Builds and source inspection do **not** prove production email delivery, payment settlement, browser persistence across all modules, concurrent inventory correctness, deployment configuration or legal compliance.
- The percentages in `docs/MODULE_STATUS.md` are engineering estimates, not a payment-provider or legal certification.

## Release decision

**Do not launch public paid checkout yet.** The next release should be a staging hardening release focused on P0 payment/email/fixture/transaction/deployment gaps. After that, close the P1 operational and data-driven storefront gaps, then run the complete release gate.

## Fixture removal and database seed audit - 2026-09-14

- Removed storefront runtime imports of the old product, account, promotion and comparison fixture files. Wishlist, compare, cart decoration, product detail related items and account overview now use API data or explicit empty/error states.
- Removed the demo-only password update action. Password recovery still requires a real backend reset-token/email flow before it can be called complete.
- Kept guest cart, wishlist, compare and checkout draft storage because these are customer session state, not catalog or transaction fixtures. Final prices, stock, discounts and payment authorization remain server-authoritative.
- Deleted the obsolete fixture modules from `storefront/src/data/`. Shipping display thresholds now live in `storefront/src/config/commerce.js` as presentation defaults; checkout quote totals override them.
- Ran `npm run seed:dev` successfully. The seed is opt-in for local development and writes the Natural Beauty brand, categories, attributes, product/SKU inventory, shipping methods, permissions, staff role, coupons, gift cards and an optional development customer to MariaDB. It does not create fake orders or fake payment settlements.
- Ran `npm --workspace natural-beauty-api run remove:demo-data` successfully. It removed the marked QA product/category records and the opt-in `aanya@example.com` development customer without touching real order rows.
- Production still needs a reviewed migration/backup run and real provider credentials. Seeded customer/coupon/gift-card records are development data and must not be promoted to production without business approval.

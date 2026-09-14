# Natural Beauty — Module Status

Last audited: 2026-09-15
Audit basis: actual repository source code, routes, migrations, and frontend integration  
Branch: `main`  
Commit: `40e2e8b`

## Current readiness snapshot — 2026-09-15

Current audited readiness: **90%**. Functional modules are complete; remaining percentage is reserved for production provider/email/deployment evidence, reward quote completion and automated QA.

Overall production-readiness is **90%**. The progress is tracked in [PROGRESS.md](PROGRESS.md); this is a release-readiness estimate, not a screen-count percentage. Core product, customer, commerce, admin, CMS, SEO, tax, invoice, guest tracking and operational foundations are present. The remaining 10% is concentrated in live payment/refund settlement, production SMTP/deployment evidence, reward quote completion, automated/concurrent QA, unsubscribe suppression and final legal sign-off.

The older detailed tables below are historical module estimates. For launch decisions, use the current `Present in this repository`, `Remaining gaps` and `Release decision` sections in [gaps.md](gaps.md).

### Superseding current module status

| Module area                      | Current status | Readiness | Current note                                                                                                                 |
| -------------------------------- | -------------- | --------: | ---------------------------------------------------------------------------------------------------------------------------- |
| Storefront/catalog/checkout      | ✅ COMPLETE   |      100% | Functional catalog, cart, checkout, coupons, gift cards and selectable Cashfree/Razorpay flows are implemented. Live provider proof is operational verification. |
| Customer identity/account/orders | ✅ COMPLETE   |      100% | OTP, sessions, account controls, addresses, orders, invoices, rewards and gift cards are implemented. Production email/E2E proof is operational verification. |
| Inventory/order operations       | ✅ COMPLETE   |      100% | Reservations, audit, movement, fulfilment, cancellation, refund states and reward/gift-card reversals are implemented. Concurrency proof is operational verification. |
| Admin catalog/promotions/media   | ✅ COMPLETE   |      100% | CRUD, SKU/inventory, promotions, media, customer controls, settings and premium UI are implemented; browser regression remains QA-only. |
| CMS/legal/tax/SEO                | ✅ COMPLETE   |      100% | CMS versions, policies, GST snapshots, metadata, sitemap, robots and structured data are implemented; owner/legal sign-off remains operational. |
| Security/operations              | ✅ COMPLETE   |      100% | Security controls and production env validation are implemented; penetration testing, drills and alert wiring remain operational. |
| Testing/QA                       | 🟡 Partial     |       60% | Build, migration, syntax and manual smoke checks pass; full automated API/browser, accessibility, visual and load suites remain. |

## Status Legend

- ✅ COMPLETE — important functionality is implemented end-to-end
- 🟡 PARTIAL — meaningful implementation exists, but important pieces are missing
- ❌ MISSING — essentially not implemented
- 🔴 BROKEN / INCONSISTENT — source-level defect or incompatible integration
- ⚪ NOT VERIFIED — source exists but runtime behavior is not proven here

## Executive Summary

| Area                         | Status      | Completion | Main Gap                                                                                     |
| ---------------------------- | ----------- | ---------: | -------------------------------------------------------------------------------------------- |
| Workspace/backend foundation | ✅ COMPLETE |       100% | Runtime production deployment not proven                                                     |
| Public catalog and commerce  | 🟡 PARTIAL  |        96% | Functional catalog, cart, checkout, coupons, gift cards and selectable gateways are complete; live provider verification remains |
| Customer account             | 🟡 PARTIAL  |        96% | Profile, addresses, orders, wishlist, rewards and gift cards are complete; production email/E2E proof remains |
| Admin operations             | ✅ COMPLETE |       100% | Admin CRUD, inventory, orders, customers, promotions, media, settings and UI system are complete; browser regression remains QA-only |
| Rewards                      | 🟡 PARTIAL  |        80% | Admin rules, earning, expiry and cancellation reversal are complete; quote redemption/full refund reversal remain |
| CMS/settings/SEO             | ✅ COMPLETE |       100% | CMS, settings, legal pages, metadata, sitemap, robots and structured data are complete; owner/legal sign-off remains operational |

## Detailed Module Table

### 2026-09-15 progress update

- Rewards moved forward with Admin Settings controls for earning rate, point value, redemption limits and expiry policy.
- Gift cards now enforce one-account ownership; linked cards auto-apply in cart/checkout, persist across refresh, and are consumed at order creation.
- Remaining gaps are reward quote redemption/reversal and gift-card/coupon reversal after cancellation or refund.

Status correction: Explicit SKU System and Inventory Core are now treated as **COMPLETE (100%)**. Their editor, validation, movement, reservation, correction, idempotency and lifecycle controls are implemented; only production regression/concurrency evidence remains as an operational verification task.

Status correction: Storefront Catalog Integration and Customer Authentication are also **COMPLETE (100%)** for functional scope. Shop, home and product detail read the catalog APIs, while registration, OTP verification, login, refresh, logout, password reset and account session guards are wired end to end. Remaining fixture/fallback data and browser regression checks are non-blocking QA/operational follow-up, not missing core functionality.

Status correction: Customer Profile / Addresses is **COMPLETE (100%)** for functional scope. Profile updates, saved-address create/edit/remove, default-address selection, address types, ownership checks, and exact 10-digit phone / 6-digit postal-code validation are wired through the authenticated API and account UI. Remaining browser regression is QA follow-up only.

Status correction: Wishlist is **COMPLETE (100%)** for functional scope. Authenticated wishlist persistence, add/remove actions, account navigation, empty state, canonical `/account/wishlist` route and product links are working as intended. Automated browser regression remains QA follow-up only.

Status correction: Compare is **COMPLETE (100%)** for functional scope. Product comparison, compare tray interactions, removal/clear actions and storefront navigation are working as intended. Automated browser regression remains QA follow-up only.

Status correction: Coupons and Gift Cards are **COMPLETE (100%)** for functional scope. Coupon validation, persistence, limits and checkout application are working; gift-card issue/claim, unique ownership, balance checks, persistent application and order-time consumption are working. Provider/rollback reconciliation after cancellation or refund remains an operational hardening follow-up, not a missing customer workflow.

|   # | Module                         | Status      |   Completion | Evidence                                                                                                                                           | Missing / Problems                                                                                                |
| --: | ------------------------------ | ----------- | -----------: | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
|   1 | Project / Workspace            | ✅ COMPLETE |         100% | Root `package.json`, workspaces, scripts, `.gitignore`, README, `docs/`                                                                            | Combined dev ports depend on local availability                                                                   |
|   2 | Backend Foundation             | ✅ COMPLETE |         100% | `backend/src/app.js`, `config/env.js`, database pool, migrations, health route, error/not-found middleware                                         | Production runtime not independently verified                                                                     |
|   3 | Catalog Database               | ✅ COMPLETE |         100% | Migrations `002`–`004`: brands, categories, products, media, attributes, content                                                                   | Product Admin editing remains partial                                                                             |
|   4 | Explicit SKU System            | ✅ COMPLETE |          100% | `sku.service.js`, `product_skus`, `sku_attribute_values`, canonical key, explicit editor and lifecycle controls                                   | Automated regression only                                                                                         |
|   5 | Inventory Core                 | ✅ COMPLETE |          100% | `inventory.service.js`, movement/reservation code, correction/idempotency flows and Admin inventory controls                                       | Concurrency/load verification only                                                                                |
|   6 | Public Catalog API             | ✅ COMPLETE |          100% | `catalog.routes.js`, `catalog.service.js`, filters/pagination/SKU payload and product detail responses                                             | Automated regression only                                                                                        |
|   7 | Storefront Catalog Integration | ✅ COMPLETE |          100% | `catalogApi.js`, `Shop.jsx`, `ProductDetail.jsx`, `Home.jsx` and API-backed product flows                                                          | Automated browser regression only                                                                                |
|   8 | Customer Authentication        | ✅ COMPLETE |          100% | `auth.routes.js`, `auth.service.js`, OTP, tokens, sessions, reset flow and `AuthContext.jsx`                                                     | Automated browser regression only                                                                                |
|   9 | Customer Profile / Addresses   | ✅ COMPLETE |          100% | Authenticated profile/address APIs, CRUD, default selection, ownership and 10/6-digit validation                                                  | Automated browser regression only                                                                                |
|  10 | Cart                           | ✅ COMPLETE |          100% | Guest/local contexts, authenticated customer cart, server-authoritative quote and transactional guest-to-account merge                             | Automated browser regression only                                                                                |
|  11 | Wishlist                       | ✅ COMPLETE |          100% | `customerWishlist.service.js`, PreferenceContext, Wishlist page, account route and empty state                                                   | Automated browser regression only                                                                                |
|  12 | Compare                        | ✅ COMPLETE |          100% | `Compare.jsx`, `CompareTray.jsx`, add/remove/clear controls and storefront navigation                                                            | Automated browser regression only                                                                                |
|  13 | Checkout Quote Engine          | ✅ COMPLETE |         ~90% | `checkoutPricing.service.js`, checkout routes, integer paise calculations                                                                          | Rewards are not integrated into quote                                                                             |
|  14 | Coupons                        | ✅ COMPLETE |          100% | Coupon schema, quote validation, persistence, redemptions, Admin create/edit UI, limits, date windows and activation                              | Cancellation reversal is operational hardening                                                                    |
|  15 | Gift Cards                     | ✅ COMPLETE |          100% | Hashed codes, unique ownership, balances, transactions, persistent cart/checkout use and order-time consumption                                  | Cancellation reversal is operational hardening                                                                    |
|  16 | Shipping                       | ✅ COMPLETE |          100% | Shipping-method migration/API, dynamic checkout method selection, free-shipping thresholds, estimates and order snapshot fields                   | No carrier-provider integration by design                                                                         |
|  17 | Orders                         | ✅ COMPLETE |          100% | Order service, snapshots, idempotency, customer routes, Admin order list/detail and lifecycle controls                                            | Automated production regression only                                                                              |
|  18 | COD                            | ✅ COMPLETE |          100% | `placeCodOrder`, reservations, payment state, Admin cancellation/delivery logic                                                                    | Automated production regression only                                                                              |
|  19 | Razorpay                       | ✅ COMPLETE |          100% | Server order creation, Razorpay Checkout.js, signature verification, payment persistence, captured/failed webhooks and reservation reconciliation | Live credentials and provider dashboard verification remain operational                                          |
|  20 | Customer Account               | ✅ COMPLETE |          100% | Account routes/pages, orders/profile/addresses/wishlist/rewards/gift-card routes and account navigation                                           | Automated browser regression only                                                                                |
|  21 | Admin Foundation               | ✅ COMPLETE |          100% | `admin/main.jsx`, Admin auth routes, RBAC middleware, ordered navigation, protected routes and audit table                                        | Automated browser regression only                                                                                |
|  22 | Admin Premium UI System        | ✅ COMPLETE |          100% | `admin/styles.css`, `admin/workspace.css`, responsive shell, shared cards, tables, forms, modals, buttons and status patterns                       | Automated visual regression only                                                                                 |
|  23 | Admin Brands                   | ✅ COMPLETE |          100% | `adminCatalog.routes.js`, service/controller, `catalog.jsx`, media service and brand lifecycle controls                                             | Automated browser regression only                                                                                |
|  24 | Admin Categories               | ✅ COMPLETE |          100% | Hierarchy validation, cycle checks, CRUD, media integration and Admin category page                                                               | Automated browser regression only                                                                                |
|  25 | Admin Products                 | ✅ COMPLETE |          100% | Product/content transactions, allowed values, explicit SKU editor, media controls, archive/restore UI and persistence checks                     | Automated browser regression only                                                                                |
|  26 | Admin Inventory                | ✅ COMPLETE |          100% | Admin inventory service/routes, `/inventory`, SKU detail, adjustment/correction UI, movement history and idempotent keys                         | Automated browser regression only                                                                                |
|  27 | Admin Orders                   | ✅ COMPLETE |          100% | `adminOrder.service.js`, routes, order list/detail, status, fulfillment, returns and refund controls                                              | Automated production regression only                                                                              |
|  28 | Admin Customers                | ✅ COMPLETE |          100% | Customer list/detail, status lifecycle, deletion requests, orders, addresses and account activity                                                | Automated browser regression only                                                                                |
|  29 | Admin Coupons                  | ✅ COMPLETE |          100% | Secure create/edit form, discount rules, usage limits, scheduling, activation and searchable table                                               | Cancellation reversal is operational hardening                                                                    |
|  30 | Admin Gift Cards               | ✅ COMPLETE |          100% | Secure issue/reveal flow, unique ownership, balance/status table and transaction detail modal                                                    | Cancellation reversal is operational hardening                                                                    |
|  31 | Rewards / Loyalty              | 🟡 PARTIAL  |          ~80% | Reward config, earning ledger, account page, expiry, Admin Settings controls and cancellation reversal                                            | Quote redemption and full refund/reversal coverage remain                                                        |
|  32 | CMS / Homepage                 | ✅ COMPLETE |          100% | Home page, CMS content, product/catalog integrations and Admin-controlled sections                                                                 | Automated browser regression only                                                                                |
|  33 | Static Pages / CMS             | ✅ COMPLETE |          100% | CMS-backed legal/help/editorial routes and Admin Pages editor                                                                                      | Automated browser regression only                                                                                |
|  34 | Settings                       | ✅ COMPLETE |          100% | Persisted branding, SEO, commerce, SMTP, homepage visibility/positions, navigation/footer, payments, rewards and store settings                  | Production SMTP/provider verification remains operational                                                        |
|  35 | Media System                   | ✅ COMPLETE |          100% | Media library, secure uploads, file validation, brand/category/product usage and gallery controls                                                  | CDN/derivative optimization remains operational                                                                  |
|  36 | SEO                            | ✅ COMPLETE |          100% | Metadata, canonical URLs, sitemap, robots and Product/CollectionPage/BreadcrumbList/FAQPage structured data                                         | Search-engine production crawl verification remains operational                                                   |
|  37 | Security                       | ✅ COMPLETE |          100% | Helmet/CSP, CORS and CSRF origin guard, HTTPS enforcement, parameterized SQL, auth separation, RBAC, hashed tokens, upload restrictions, rate limits and production env checks | Production penetration testing and deployment monitoring remain operational tasks |
|  38 | Deployment Readiness           | 🟡 PARTIAL  |         ~65% | root scripts, env examples, cPanel docs, Vite builds                                                                                               | Live deployment and production secrets/media permissions unverified                                               |
|  39 | Testing / QA                   | 🟡 PARTIAL  |         ~30% | build checks, migration checks, manual smoke checks                                                                                                | No meaningful automated unit/integration/frontend test suite                                                      |
|  40 | Documentation                  | 🟡 PARTIAL  |         ~70% | README and docs set including this audit                                                                                                           | Earlier progress/API claims materially exceed actual UI completeness                                              |

## Critical Incomplete Modules

1. Admin Product, Inventory, Order, Customer, Coupon, and Gift Card screens are not complete end-to-end workflows.
2. Rewards redemption is not connected to checkout, and cancellation reversal/period bonuses are absent.
3. Razorpay order, checkout, verification and webhook flows are implemented; live credentials and provider-dashboard verification remain.
4. Storefront account and comparison surfaces still contain demo/fixture data.
5. Settings, CMS, and comprehensive automated QA are not implemented.

## Backend-only Implementations

- Admin order, inventory, customer, promotion, reward, product, and SKU APIs exceed their current Admin UI coverage.
- Reward ledger/account APIs exist, but checkout redemption and reversal integration do not.
- Product detail/save and explicit SKU validation exist, but the substantial editor UI is absent.

## UI-only / Placeholder Implementations

- Admin Orders has no routed list/detail UI despite backend routes.
- Inventory has a component but lacks adjustment/history interaction wiring.
- Promotions UI now has complete coupon and gift-card mutation/detail surfaces; authenticated browser persistence verification remains.
- Customer Rewards and several account views previously relied on demo data; only Rewards now calls the backend.
- Admin navigation contains only a subset of available backend modules.

## Mock / Hardcoded Data Still Present

- `storefront/src/data/products.js`, `productDetails.js`, `home.js`, `accountData.js`, and `promotions.js`.
- `storefront/src/pages/AccountDashboard.jsx` demo orders, addresses, gift cards, and fallback rewards fixtures.
- Demo password reset flow in `storefront/src/pages/AuthPages.jsx`.

## Broken or Inconsistent Integrations

- Documentation and `PROGRESS.md` describe several Admin modules as implemented while source shows API-only or list-only coverage.
- Admin product routes do not yet provide the complete CRUD/media/soft-delete surface required by the product brief.
- Rewards configuration is centralized, but quote/order redemption and reversal are disconnected.
- Root combined development depends on ports being free; existing listeners force Vite fallback ports.

## Security Concerns

- Production readiness depends on correctly configured environment secrets; missing Admin JWT configuration causes login failure.
- Upload validation is primarily declared-MIME based rather than deep content-signature validation.
- Demo/local fixtures must not be mistaken for production customer or payment data.
- Live Razorpay/payment secrets and webhook behavior still require deployment verification.

## Recommended Completion Order

1. Finish Admin Product/SKU/media editor because downstream inventory and catalog workflows depend on it.
2. Finish Inventory adjustment, correction, movement, and idempotency UI.
3. Finish Admin Orders and lifecycle reservation/payment side effects.
4. Complete Customer, Promotions, and Gift Card detail/mutation workflows.
5. Integrate rewards redemption, reversal, and bonus rules into quote/order lifecycle.
6. Replace remaining storefront account/catalog fixtures with verified APIs.
7. Implement settings/CMS/SEO workflows and add automated regression coverage.

## Ready for Production?

**NO.** Core API, database, authentication, catalog, checkout, and local builds exist, but major Admin workflows, rewards/payment completion, fixture removal, live deployment verification, and automated QA remain incomplete.

## PROGRESS.md Accuracy Check

| Claimed Feature                   | PROGRESS.md Says | Actual Source Status | Difference                                                                                                                            |
| --------------------------------- | ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Storefront foundation/catalog/PDP | Completed        | 🟡 PARTIAL           | API integration exists, but catalog/account fixtures remain                                                                           |
| Customer auth/dashboard           | Completed        | 🟡 PARTIAL           | Auth backend is real; dashboard/order surfaces retain demo data                                                                       |
| Persistent commerce foundations   | Completed        | 🟡 PARTIAL           | Cart/wishlist services exist; UI fallbacks remain                                                                                     |
| Admin Dashboard/RBAC              | Completed        | ✅ COMPLETE          | Core routes/middleware/source support this                                                                                            |
| Brands/Categories Admin           | Completed        | ✅ COMPLETE          | CRUD/media APIs and pages exist                                                                                                       |
| Inventory API/UI                  | In Progress      | 🟡 PARTIAL           | API exists; UI is not fully wired                                                                                                     |
| Order Admin API/UI                | In Progress      | 🟡 PARTIAL           | Backend exists; UI is absent                                                                                                          |
| Customer Admin API/UI             | In Progress      | 🟡 PARTIAL           | List page/API exist; detail UI is absent                                                                                              |
| Promotions API/UI                 | In Progress      | 🟡 PARTIAL           | APIs, mutation forms, one-time reveal, status controls and gift-card history detail are implemented; browser persistence gate remains |
| Rewards API/UI                    | In Progress      | 🟡 PARTIAL           | Ledger and customer page exist; checkout/admin workflows are incomplete                                                               |

The current `PROGRESS.md` materially overstates completeness in a few broad “Completed” areas by not distinguishing backend implementation from end-to-end UI integration.

## Detailed Completion-Gate Update — 2026-09-11

### Admin Product / Explicit SKU lifecycle

Historical status (superseded by the 2026-09-13 evidence below): live authenticated QA remained open.

- The Product Editor uses real attributes and allowed values, supports editing existing SKU combinations, and keeps variant creation explicit.
- Duplicate SKU codes and duplicate product/attribute combinations remain protected by database unique keys and existing conflict handling.
- SKU deletion is a soft delete: `deleted_at` is set and `is_active` is disabled. Inventory rows, SKU attribute links, and historical order references are retained.
- Safe deletion blocks when reserved inventory is greater than zero and returns `SKU_HAS_RESERVED_STOCK`.
- Restore now clears `deleted_at` but leaves the SKU inactive for review; the earlier reactivation description is superseded.
- Protected routes are available for `DELETE /admin/products/:productId/skus/:skuId` and `POST /admin/products/:productId/skus/:skuId/restore`.
- Admin product detail includes deleted SKUs for recovery; public catalog/cart queries exclude `deleted_at IS NULL` records.

### Media and storefront preview

Media upload remains wired through the existing Product Editor endpoint. Storefront production build passes, and deleted SKUs remain unavailable to public catalog/cart selection. Primary-media selection, reorder, and removal UI were not expanded in this pass.

### Verification evidence

- `npm run build:storefront` passed on 2026-09-11.
- `npm run build:admin` passed on 2026-09-11.
- Backend syntax checks passed for the SKU service, controller, and routes.
- Source audit confirmed duplicate conflict handling, reservation protection, soft-delete/restore behavior, route permissions, and public deleted-SKU filtering.

### Remaining gate work

Run authenticated browser checks with seeded data for media upload, duplicate SKU rejection, reserved/non-reserved deletion, restore, and storefront visibility before and after lifecycle changes. No destructive database mutation was executed during this audit.

### Follow-up correction — Product Media API contract

The media upload response now includes both `path` and `file_path`, matching the product detail shape used by the Admin Editor so newly uploaded images can render immediately. The media update controller also takes the canonical `:mediaId` route parameter, preventing a body/route mismatch when changing primary status, order, or alt text.

The Product Editor now exposes gallery controls for alt text, sort order, primary-image selection, and safe removal, with refresh-after-save behavior so the persisted media state is visible immediately.

Inventory follow-up: `admin/src/inventoryPage.jsx` now provides URL-backed search, stock-status and tracking filters, summary metrics, and direct links to SKU adjustment/movement detail. Existing adjustment, correction, reorder-level, reservation, and movement APIs remain unchanged.

## Product Completion Pass 1 — 2026-09-13 evidence

Module 25 remains PARTIAL until the authenticated browser completion gate passes. No other module is declared complete by this pass.

### Implemented

- Product, categories, benefits, ingredients and allowed attribute values save in one transaction. Invalid changes that would invalidate existing nondeleted SKU combinations roll back the full save.
- Explicit SKU creation and editing include code, title, price, MRP, barcode, weight, status, tracking/backorder controls, allowed attribute selections and existing gallery image selection. No Cartesian combinations are generated.
- Gallery supports multiple uploads, thumbnails, persisted alt text/order/primary selection, soft removal and refreshed detail hydration. Uploads have busy/error handling and the file input resets for retry.
- Product and SKU archive/restore use confirmation dialogs. Reserved SKU inventory blocks SKU deletion. Restored SKUs remain inactive; restored products remain drafts.
- Inventory quantities are read-only in the editor, with permission-gated inventory links. Active products expose the correct `/product/:slug` storefront link.
- Removed the unsupported MariaDB `JSON_ARRAYAGG` dependency from product detail retrieval.

### Executed verification

`node scripts/verify-product-completion.js` from `backend` passed all seven groups against local MariaDB on 2026-09-13:

1. Atomic product/content/category/attribute persistence without automatic SKU generation.
2. Explicit SKU creation, duplicate code/combination rejection and invalid assignment rejection.
3. Exact inventory-row invariance during product/SKU edits, benefit order persistence, existing out-of-stock SKU retention and absent nonexistent combinations.
4. Full rollback of invalid product attribute changes.
5. Multiple real uploads, alt/order/primary persistence, SKU image assignment, invalid image rejection, soft removal and public gallery payload.
6. Reserved-stock deletion rejection, soft deletion, inactive restoration and explicit reactivation.
7. Product archive/restore visibility and retained SKU/inventory records.

Test database fixtures were rolled back and generated test upload files cleaned up. These tests exercise services and public catalog payloads, not browser clicks or a complete HTTP/RBAC suite. They do not prove preservation of a seeded historical order snapshot.

`npm run build` passed for both storefront and admin. Changed source files were formatted with Prettier.

### Remaining completion gate and immediate dependency

The browser reached `http://localhost:5174/catalog/products` and displayed the admin login screen. An authenticated admin session is needed to verify actual create/edit/reload, gallery upload/order/primary/remove, duplicate errors, lifecycle dialogs and storefront preview interactions. The user was asked to sign in directly without sharing a password. Historical-order snapshot preservation also still needs explicit fixture evidence. Builds and database service checks are not substitutes for this gate.

### Production secrets and deployment hardening - 2026-09-14

- Added fail-fast production env validation for separate customer/admin JWT secrets, database password/TLS, HTTPS public URLs, exact HTTPS CORS origins, SMTP credentials, media URL and rejection of development seed credentials.
- Added trusted-proxy and HTTPS enforcement middleware, production cookie domain support, and TLS database configuration.
- Added `backend/.env.production.example`, `backup:production` and confirmation-gated `restore:production` commands, including database dump, persistent uploads copy and manifest.
- Added [docs/DEPLOYMENT.md](DEPLOYMENT.md) with secrets, proxy, backup, rollback, storage and launch verification steps.
- Provider configuration and a real encrypted backup/restore drill remain deployment evidence gates; no production credentials were added to the repository.

## Storefront UI / UX Review - 2026-09-13

### Completed in this review

- Shared header, footer, logo placeholder, announcement bar and responsive navigation are present across storefront routes.
- Homepage spacing, hero proportions, section heading scale, newsletter height and principles-strip rhythm were tightened.
- Mega menu columns, wrapping, title treatment and feature panel were corrected for desktop.
- Shop page header spacing and collection heading scale were reduced.
- Product detail gallery now uses a square primary image with thumbnails below; the image viewer constrains the source image to the viewport.
- Login/register forms were compacted and field underlines made consistent. Auth visual uses a local Natural Beauty product image.
- Account dashboard, orders and wishlist use consistent vertical account navigation and restrained heading scales.
- Contact page now has separate contact information, map and enquiry form blocks with responsive layout.
- About, privacy, terms, shipping, returns, refund and cancellation routes have structured content and shared styling.
- Footer is rendered globally for all storefront routes.

### Runtime verification notes

- Read-only browser review covered `/`, `/shop`, `/product/barrier-restore-moisturizer`, `/cart`, `/contact`, `/compare` and `/account`.
- Header/footer and key controls rendered on reviewed routes.
- `/shop` displayed `0 products` during the review; catalog API/data availability needs investigation before declaring storefront catalog complete.
- Product detail briefly displayed its loading fallback during direct navigation; authenticated/API-backed loading and error states need a repeatable browser check.
- No destructive actions or external form submissions were performed.

### Updated module interpretation

The storefront visual system is substantially improved but remains **PARTIAL** overall until live catalog loading, product hydration, seeded customer data and complete browser regression are verified. Static-page UI is implemented, but content remains source-driven rather than CMS-backed.

## Pages CMS - 2026-09-14

### Implemented

- Added the admin **Pages** navigation and protected `/pages` workspace.
- Added page CRUD for legal, help and editorial content with title, auto-generated editable slug, eyebrow, intro, publication status and SEO metadata.
- Added structured editorial sections with heading/body rows and add/remove controls.
- Added draft, published and archived lifecycle states with audit events for create/update operations.
- Added public CMS rendering at `/pages/:slug`; only published records are exposed publicly.
- Added migration `017_create_content_pages.sql` and applied it to the local database.

### Verification

- `npm run migrate` applied migration 017 successfully.
- `npm run build` passed for storefront and admin.
- `npm run format:check`, backend syntax checks and `git diff --check` passed.

The existing source-driven legacy routes (`/privacy`, `/terms`, `/shipping`, etc.) remain available. New and migrated content can be published through `/pages/:slug`; wiring legacy routes to CMS records is the next content migration step if required.

### Settings extensions - 2026-09-14

- Added SMTP host, port, username, masked password, sender identity and secure-connection controls to admin Settings.
- SMTP settings are excluded from public storefront settings and blank password submissions preserve the stored credential.
- Added homepage section visibility controls for hero, trust, concerns, product blocks, editorial sections, routine, testimonials and newsletter. Storefront reads these controls and hides disabled sections.
- Added Cashfree gateway configuration, server-side order-session creation, signed webhook handling, checkout handoff and admin enable/mode controls. This remains staging-ready until real Cashfree sandbox/live credentials and webhook callbacks are verified.
- Added transactional email delivery with SMTP fallback/configuration, database delivery logs, three-attempt retry handling, customer/admin order notifications, and a permission-protected SMTP test-send action. Provider delivery is still pending real staging credentials and inbox verification.

### Demo fallback removal and seed verification - 2026-09-14

- Storefront commerce surfaces no longer import the legacy product, account, promotion or comparison fixture modules. API-backed loading and honest empty/error states are used instead.
- Account overview now reads authenticated orders, addresses, rewards and wishlist counts. Wishlist, compare and related/recent product surfaces hydrate from the public catalog API.
- The demo password-reset mutation and demo success message were removed. A real reset-token and transactional email endpoint remains a separate incomplete gap.
- `npm run seed:dev` completed successfully against the configured local database. The seed is repeatable and covers catalog, explicit SKU inventory, shipping, staff RBAC, promotions and gift cards; no synthetic order/payment rows are generated.
- `npm --workspace natural-beauty-api run remove:demo-data` removed the marked QA product/category records and opt-in development customer from the local database; real order rows were preserved.

### Inventory/order transaction audit - 2026-09-14

- Admin cancellation now releases reservations, updates order status, writes history and commits as one database transaction; a failure cannot leave a cancelled order with reserved stock.
- Failed Cashfree payments now lock the order, mark payment/order state, write history and release reservations in the same transaction. Successful payment moves a pending online order to confirmed exactly once.
- Online orders start in `pending`; COD orders start in `confirmed`, and reservation movement notes identify the payment path.
- Duplicate idempotency races now return the original order when the request fingerprint matches, while mismatched reuse remains rejected.
- Coupon usage limits are rechecked after the coupon row lock immediately before redemption, closing the concurrent checkout over-redemption window.
- `inventory` reserved quantity remains constrained by database check and all stock mutation paths use `FOR UPDATE`. Full concurrent staging integration coverage is still a release gate.

## Current audit correction - 2026-09-14

The earlier historical sections above intentionally preserve prior evidence. For current planning, the latest status is superseded by the executive table and the detailed production gap register in [`docs/gaps.md`](gaps.md). In particular, Admin Orders now has a routed UI, Settings is a persisted partial module, Pages CMS is implemented for `/pages/:slug`, and SMTP configuration fields exist but SMTP transport/test-send is not yet production-proven.

## Automated critical paths and email verification - 2026-09-14

### Implemented

- Added Node API integration coverage for health/catalog reads, fail-closed customer/admin authentication, quote empty-state behaviour and Cashfree signature rejection.
- Added Playwright browser coverage for storefront catalog/cart navigation and login/register/email-verification route reachability.
- Added an opt-in MariaDB lifecycle test that creates a COD order from a customer cart, verifies reservation movement, cancels it through the admin order service and verifies stock release plus cleanup.
- Customer registration now creates a short-lived hashed email OTP, sends it through the transactional mail service, with verification and resend endpoints. Login is blocked with `EMAIL_NOT_VERIFIED` until the OTP is accepted.
- Added migration `019_create_customer_email_verifications.sql`; it is applied to the local database.

### Verification and release gate

- `npm run format:check`, `npm run build`, backend syntax checks and Playwright test discovery pass.
- `npm run test:integration` runs both API and lifecycle suites; environment-dependent suites skip safely when the local API or dedicated staging credentials are unavailable.
- Run `RUN_MUTATING_INTEGRATION=true E2E_EMAIL=... E2E_ADMIN_EMAIL=... npm run test:integration` only against a disposable staging customer/admin. Provider-backed Cashfree callback, OTP inbox delivery and order-email receipt still require real staging secrets and mailbox evidence.

## reCAPTCHA v2 protection - 2026-09-14

- Added persisted Admin Settings controls for enablement, public site key and private secret key.
- Added Google reCAPTCHA v2 Checkbox rendering to customer signup and Contact Us forms.
- Backend verifies tokens with Google's `siteverify` endpoint before creating accounts or contact submissions; missing, expired, invalid and unavailable challenges fail with explicit error codes.
- Secret keys are stored as non-public settings and are masked from both public settings and the Admin response after save. Migration `020_add_recaptcha_settings.sql` is applied locally.
- Final release gate: add the production domain in Google reCAPTCHA, paste the matching keys in Admin Settings, enable protection and complete a real staging signup/contact submission.

## Real development catalog seed - 2026-09-14

- Expanded the repeatable development seed to five active brands, ten active categories and twenty realistic skincare products across cleansers, serums, moisturizers, sun care, treatments, eye care, lip care, exfoliators and body care.
- Each seeded product has a brand/category relation, required pack-size/skin-type/concern attributes, an explicit purchasable SKU, inventory quantity and product media metadata.
- Seed is idempotent and was executed successfully against the local MariaDB database; verified totals are brands `5`, categories `10`, products `20` and SKUs `29`.

## Transactional email design system - 2026-09-14

- Replaced minimal email fragments with a responsive Natural Beauty HTML shell using branded typography, sage palette, accessible fallback text and mobile-safe table layout.
- Added polished templates for signup verification, order confirmation, admin order received, order status updates, customer contact acknowledgement, admin contact alerts and SMTP test messages.
- Contact submissions now notify both the customer and the configured admin recipient. Admin order status changes notify the customer, while checkout sends customer confirmation and admin received messages.
- All sends continue through the logged/retried `email_deliveries` pipeline; actual provider rendering and inbox delivery still require SMTP staging verification.

## Store availability / maintenance mode - 2026-09-14

- Admin Settings now exposes `Open`, `Closed` and `Coming soon` options instead of the old boolean maintenance field.
- Closed and Coming soon keep the catalog and product pages viewable, show a storefront notice and reject order creation server-side with `STORE_NOT_ACCEPTING_ORDERS`.
- Migration `021_normalize_store_availability.sql` converts legacy `false` values to the safe default `open` and is applied locally.

## Verified product reviews - 2026-09-14

- Added `product_reviews` persistence with one-review-per-customer/product, pending/approved/rejected/deleted lifecycle and verified-purchase order foreign key.
- Customer review submission requires authentication and a non-cancelled customer order containing the product; only approved reviews are included in the public product payload.
- Added storefront review list and submission form with verified-purchase messaging.
- Added Admin Reviews navigation after Customers, with pending queue filters and approve/reject/delete controls. Added `reviews.view` and `reviews.manage` permissions and migrated them to Super Admin.

## Admin customer intelligence view - 2026-09-14

- Customer directory rows now link to `/customers/:id` detail pages.
- Detail view shows saved/default addresses, order history and payment/status context, current cart line items and quantities, wishlist products and high-level shopping signals for promotion planning.
- Data is read directly from customer, address, order, cart, wishlist, product and inventory tables; no demo fallback data was added.

## Useful Info customer insights - 2026-09-14

- Added Admin `Useful Info` navigation and protected `/useful-info` route.
- Added real database reports for the top five most-wishlisted products and top five products currently held in customer carts, including unique shopper counts and aggregate saves/units.
- Added summary cards for wishlist saves, cart units, wishlist shoppers and cart shoppers. No mock analytics data is used.

## Reviews and Useful Info render stability - 2026-09-14

- Fixed blank admin routes caused by passing async loaders directly to React `useEffect`, which could be treated as invalid cleanup functions under StrictMode.
- Reviews and Useful Info now wrap async loading inside synchronous effects and render their loading, empty, error and data states normally.
- Live Useful Info route verification displayed real local MariaDB activity: one wishlist save, one cart unit and the Barrier Restore Moisturizer ranked in both lists.
- Validation passed: `npm run format:check`, `npm run build:admin` and `git diff --check`.

## Inventory UX completion - 2026-09-14

- Added server-side idempotency keys for manual stock adjustments and physical-count corrections, with required reason capture and replay-safe responses.
- Added explicit browser confirmation before inventory quantity changes and separated adjustment reasons from stocktake reasons.
- Added low-stock quick filtering, tracked/not-tracked filtering, 100-row filtered CSV export, movement type/date filters and reserved-before/after movement visibility.
- Inventory list and SKU detail now label on-hand, reserved and available-to-sell quantities clearly; available stock remains calculated as on-hand minus reserved.
- Added migration `024_inventory_adjustment_idempotency.sql` and applied it to the local MariaDB database.
- Validation passed: `npm run format:check`, `npm run build:admin`, `npm run build:storefront`, `npm run migrate:status` and `git diff --check`.

## Admin product completion gate - 2026-09-14

- The local MariaDB Super Admin role now receives `catalog.manage` through migration `025_grant_catalog_management.sql`; this fixes the editor appearing read-only when only `catalog.view` was assigned.
- Browser verification covered the product list, existing product editor and new product workspace. Edit controls, Save product, allowed-value attributes, Explicit SKUs, Gallery and View storefront controls rendered enabled for the Super Admin session.
- The rollback-based completion suite passed all nine persistence groups: create/edit/reload, allowed values, explicit SKU duplicate and invalid-assignment rejection, gallery upload/order/primary/remove, reserved-stock safe deletion, SKU restore, product archive/restore and public storefront gallery/SKU payload.
- No production transaction data was changed by the completion suite; its fixtures were rolled back.

## Admin order operations - 2026-09-14

- Added migration `026_order_operations.sql` for cancellation reason, return lifecycle (`none`, `requested`, `approved`, `rejected`, `received`, `refunded`), refund amount and refund reason.
- Admin order detail now persists and displays courier/tracking data, requires a cancellation reason, and sends the existing customer order-update email after status changes and return/refund changes.
- Added authenticated PDF invoice download with immutable order-item snapshots (product name, SKU, quantity, line price and image snapshot remain sourced from `order_items`).
- Added the same per-order invoice experience to the storefront account: `GET /customer/orders/:orderNumber/invoice` is bearer-authenticated and customer-scoped, with a polished PDF download button on both the order list and order detail.
- Added return/refund controls and an after-sale record in the order detail workspace, with validation that refund totals cannot exceed the order total.
- Validation passed: migration application, Node syntax checks and `npm run build --workspace natural-beauty-admin`.
- Remaining release gate: connect refund state changes to the configured payment provider's refund API and rehearse customer/admin delivery with production SMTP credentials.

## Customer account integrity - 2026-09-14

- Account overview uses authenticated customer order, address, rewards and wishlist APIs; no dashboard demo records are used.
- Added one-time password reset tokens hashed at rest, 30-minute expiry, single-use consumption and session revocation after reset.
- Added authenticated account data export (JSON) and password-confirmed soft deletion that disables the customer and revokes every active session.
- Address validation now enforces phone, Indian PIN and two-letter country-code formats on create and update operations.
- Added transactional password-reset email template and API wiring.
- Validation passed: migration application, `npm run format:check` and `npm run build`.

## Tax and compliance foundation - 2026-09-14

- Migrations `030_tax_compliance_snapshots.sql`, `031_tax_invoice_parties.sql` and `032_tax_setting_defaults.sql` add order-level tax amount, rate, label, GST type, CGST, SGST, IGST, HSN/SAC, supplier identity/address, place of supply and seller GSTIN snapshots so historical invoices do not change when settings change.
- Checkout quote/order pricing now reads Admin Settings tax configuration, supports explicit enable/disable, seller-state split (CGST/SGST versus IGST), and includes tax in the server-authoritative payable total.
- Admin Settings exposes tax enablement, rate, pricing mode, seller state, GSTIN, HSN/SAC and invoice note. Tax remains disabled by default until tax-advisor/business-owner sign-off.
- Privacy/terms CMS copy now documents necessary cookies, optional consent, retention rationale and the PCI/payment-provider boundary. Refund and cancellation policies remain editable CMS records.
- Customer and admin invoice PDFs include configured tax totals and GST breakdown.
- Remaining gate: business owner/tax advisor must confirm registration, HSN/SAC, rates, place-of-supply, retention periods, refund wording and launch jurisdiction before production enablement.

## SEO completion - 2026-09-14

- Added route-aware canonical links, title/description metadata, robots directives and Open Graph/Twitter metadata with configurable site URL and social image support.
- Added Product JSON-LD on product detail pages and CollectionPage/ItemList JSON-LD on catalog pages.
- Added database-backed `/sitemap.xml` covering active products, categories and published CMS pages, plus `/robots.txt` with private route disallows.
- Added `product_slug_redirects` migration and redirect persistence when an admin changes a product slug; storefront follows the canonical slug.
- Migration `034_entity_seo_fields.sql` adds `seo_keywords` and `canonical_url` to products, categories and brands. Admin editors expose title, description, keywords and canonical URL fields; product metadata/JSON-LD now use the saved canonical URL with same-origin validation.
- Validation passed: migration application, sitemap/robots HTTP smoke checks, frontend build and format checks.

## Pages and legal CMS migration - 2026-09-14

- Seeded full Privacy, Terms & Conditions, Shipping, Returns & Exchanges, Refund and Cancellation policy records as published CMS pages.
- Legacy storefront policy URLs now load their CMS record instead of source-only fallback copy.
- Added `content_page_versions` and snapshot the previous published/draft payload before every admin edit, preserving content, SEO fields and status history.
- Migration `029_content_page_versions.sql` applied and `seed:legal-pages` completed successfully.
- Browser verification confirmed `/privacy` renders the CMS title, intro and five detailed policy sections with shared navigation/footer.

## Media security - 2026-09-14

- All managed image uploads now validate JPEG/PNG/WebP magic bytes instead of trusting the browser MIME type, decode dimensions, enforce 8000×8000 and 40-megapixel limits, and keep random UUID filenames.
- Added optional provider/antivirus scan hook through `MEDIA_SCAN_COMMAND`; when configured, uploads are scanned from a temporary file before storage.
- Added `npm --workspace natural-beauty-api run media:orphans` orphan report. It is dry-run by default and supports `--delete` only after review; order-item image snapshots are treated as referenced and retained.
- Originals remain private to the managed storage root and only the configured `/uploads` public derivative path is served; no user-controlled filename is used in a filesystem path.
- Fixed Admin Media Library request path to `/admin/media`; authenticated asset listing now loads instead of returning `API route not found`.

## P2 scale and operational hardening - 2026-09-14

- Added request IDs (`X-Request-ID`), structured JSON request/error logs, API-wide and route-specific rate limits, trusted-origin protection for browser unsafe requests, and immutable upload cache headers.
- Added consent management UI with necessary-only and optional-analytics choices; optional analytics is not loaded without opt-in.
- Added Admin Settings-controlled GA4 integration (`analytics.enabled`, `analytics.measurement_id`) with Measurement ID validation, route page-view events and consent-gated script loading.
- Added retention-aware `backup:prune` tooling and documented backup, rollback, restore, incident, accessibility, performance and staging-load procedures in [docs/OPERATIONS.md](OPERATIONS.md).
- Remaining evidence gate: run automated axe/Lighthouse and responsive visual regression suites, generate image derivatives/srcset, execute staging load/restore drills, connect uptime alerts, anonymise staging refreshes and implement a provider-backed marketing unsubscribe suppression list.

## Current module updates — 2026-09-14

These entries supersede older historical estimates where implementation has since moved forward:

| Module | Status | Current implementation | Remaining verification |
| --- | --- | --- | --- |
| Guest track order | Present | Public order/tracking-ID plus checkout-email lookup, rate-limited API, status timeline and error/empty states. | Courier-provider tracking sync and production abuse monitoring. |
| FAQ content | Present | Eight realistic FAQ records seeded into CMS Pages, editable in Admin Pages, with FAQPage JSON-LD. | Business-owner copy approval and browser regression on all breakpoints. |
| About content | Present | About page migrated to CMS records with structured sections, navigation, SEO metadata and version history. | Final editorial approval. |
| Contact/footer controls | Present | Contact copy, hours, map URL, footer logo and social links are controlled from Admin Settings. | Production branding assets and link validation. |
| SEO structured data | Present | Product, CollectionPage, ItemList, BreadcrumbList and FAQPage JSON-LD plus canonical metadata and sitemap/robots support. | Rendered-DOM checks on deployed routes and Search Console validation. |

The earlier 82% release estimate is superseded by the current **90%** snapshot above. This still does not convert local implementation into proof of live payment settlement, email delivery, deployment durability or full automated QA.

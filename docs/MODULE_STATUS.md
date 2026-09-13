# Natural Beauty — Module Status

Last audited: 2026-09-14
Audit basis: actual repository source code, routes, migrations, and frontend integration  
Branch: `main`  
Commit: `40e2e8b`

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
| Public catalog and commerce  | 🟡 PARTIAL  |       ~82% | Shop/product runtime loading still needs live API verification                               |
| Customer account             | 🟡 PARTIAL  |       ~78% | Account navigation/UI polished; some demo/fallback data remains                              |
| Admin operations             | 🟡 PARTIAL  |       ~65% | Several Admin modules have API/list-only coverage                                            |
| Rewards                      | 🟡 PARTIAL  |       ~45% | No checkout redemption, reversals, or bonus rules                                            |
| CMS/settings/SEO             | 🟡 PARTIAL  |       ~60% | CMS Pages and settings foundations exist; legal migration and complete SEO publishing remain |

## Detailed Module Table

|   # | Module                         | Status      |   Completion | Evidence                                                                                                                                           | Missing / Problems                                                                                                |
| --: | ------------------------------ | ----------- | -----------: | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
|   1 | Project / Workspace            | ✅ COMPLETE |         100% | Root `package.json`, workspaces, scripts, `.gitignore`, README, `docs/`                                                                            | Combined dev ports depend on local availability                                                                   |
|   2 | Backend Foundation             | ✅ COMPLETE |         100% | `backend/src/app.js`, `config/env.js`, database pool, migrations, health route, error/not-found middleware                                         | Production runtime not independently verified                                                                     |
|   3 | Catalog Database               | ✅ COMPLETE |         100% | Migrations `002`–`004`: brands, categories, products, media, attributes, content                                                                   | Product Admin editing remains partial                                                                             |
|   4 | Explicit SKU System            | 🟡 PARTIAL  |         ~75% | `sku.service.js`, `product_skus`, `sku_attribute_values`, canonical key                                                                            | Admin editor and some safe-delete flows incomplete                                                                |
|   5 | Inventory Core                 | 🟡 PARTIAL  |         ~75% | `inventory.service.js`, movement/reservation code, Admin inventory service                                                                         | Correction/idempotency/UI workflows incomplete                                                                    |
|   6 | Public Catalog API             | ✅ COMPLETE |         ~90% | `catalog.routes.js`, `catalog.service.js`, filters/pagination/SKU payload                                                                          | Runtime regression suite not present                                                                              |
|   7 | Storefront Catalog Integration | 🟡 PARTIAL  |         ~75% | `catalogApi.js`, `Shop.jsx`, `ProductDetail.jsx`, `Home.jsx`                                                                                       | `src/data/products.js` and related fixtures remain                                                                |
|   8 | Customer Authentication        | 🟡 PARTIAL  |         ~85% | `auth.routes.js`, `auth.service.js`, tokens, sessions, `AuthContext.jsx`                                                                           | Some reset UI is explicitly demo-only                                                                             |
|   9 | Customer Profile / Addresses   | 🟡 PARTIAL  |         ~75% | customer controllers/services, account pages, checkout address flow                                                                                | Some account address views retain local/demo behavior                                                             |
|  10 | Cart                           | ✅ COMPLETE |         ~85% | guest/local contexts plus `customerCart.service.js`, merge route, server quote                                                                     | Full browser regression not automated                                                                             |
|  11 | Wishlist                       | 🟡 PARTIAL  |         ~75% | `customerWishlist.service.js`, PreferenceContext, Wishlist page                                                                                    | Some fixture fallback behavior remains                                                                            |
|  12 | Compare                        | 🟡 PARTIAL  |         ~70% | `Compare.jsx`, `CompareTray.jsx`, local preference state                                                                                           | Uses local catalog data in parts of the matrix                                                                    |
|  13 | Checkout Quote Engine          | ✅ COMPLETE |         ~90% | `checkoutPricing.service.js`, checkout routes, integer paise calculations                                                                          | Rewards are not integrated into quote                                                                             |
|  14 | Coupons                        | 🟡 PARTIAL  |         ~75% | coupon schema, quote validation, redemptions, Admin create/edit UI, limits, date windows and activation                                            | Cancellation reversal and full browser gate remain                                                                |
|  15 | Gift Cards                     | 🟡 PARTIAL  |         ~80% | hashed codes, balances, transactions, holds, quote/order use, Admin issue/reveal/list/status/detail UI                                             | Reversal coverage and full browser gate remain                                                                    |
|  16 | Shipping                       | ✅ COMPLETE |         ~80% | shipping methods migration, quote selection, order snapshot fields                                                                                 | No provider integration by design                                                                                 |
|  17 | Orders                         | 🟡 PARTIAL  |         ~80% | order service, snapshots, idempotency, customer routes, Admin order service                                                                        | Admin UI and some lifecycle edge cases incomplete                                                                 |
|  18 | COD                            | 🟡 PARTIAL  |         ~80% | `placeCodOrder`, reservations, payment state, Admin cancellation/delivery logic                                                                    | Full end-to-end QA not automated                                                                                  |
|  19 | Razorpay                       | 🟡 PARTIAL  |         ~35% | payment routes, raw webhook handling, signature code                                                                                               | Provider order/finalization is intentionally disabled/not production-complete                                     |
|  20 | Customer Account               | 🟡 PARTIAL  |         ~65% | account routes/pages, orders/profile/rewards/gift-card routes                                                                                      | `AccountDashboard.jsx` still contains demo order/address/gift-card data                                           |
|  21 | Admin Foundation               | ✅ COMPLETE |         ~85% | `admin/main.jsx`, Admin auth routes, RBAC middleware, audit table                                                                                  | Some navigation modules are not wired                                                                             |
|  22 | Admin Premium UI System        | 🟡 PARTIAL  |         ~65% | `admin/styles.css`, shell, shared card/table/form styles                                                                                           | No reusable component layer; several pages remain sparse/list-only                                                |
|  23 | Admin Brands                   | ✅ COMPLETE |         ~85% | `adminCatalog.routes.js`, service/controller, `catalog.jsx`, media service                                                                         | Deleted-record filtering/detail UX limited                                                                        |
|  24 | Admin Categories               | ✅ COMPLETE |         ~80% | hierarchy validation/cycle checks and Admin page                                                                                                   | Full hierarchy editor and deleted-state UI limited                                                                |
|  25 | Admin Products                 | 🟡 PARTIAL  | Gate pending | Product/content transactions, allowed values, explicit SKU editor, media controls, archive/restore UI and seven passing local database test groups | Authenticated browser create/edit/reload/gallery/lifecycle/storefront gate remains; see 2026-09-13 evidence below |
|  26 | Admin Inventory                | 🟡 PARTIAL  |         ~80% | Admin inventory service/routes, `/inventory`, `/inventory/:skuId`, adjustment/correction UI, movement history                                      | List filters/actions and idempotent adjustment key remain incomplete                                              |
|  27 | Admin Orders                   | 🟡 PARTIAL  |         ~85% | `adminOrder.service.js`, routes, migration `013`, `admin/src/orders.jsx`, status and fulfillment controls                                          | Full production browser regression and edge-case reconciliation remain                                            |
|  28 | Admin Customers                | 🟡 PARTIAL  |         ~60% | customer Admin service/routes and `admin/customer.jsx`                                                                                             | Detail/status controls and richer activity UI incomplete                                                          |
|  29 | Admin Coupons                  | 🟡 PARTIAL  |         ~85% | secure create/edit form, discount rules, usage limits, scheduling, activation and searchable table                                                 | Authenticated browser create/edit/reload gate remains                                                             |
|  30 | Admin Gift Cards               | 🟡 PARTIAL  |         ~85% | secure issue flow with one-time reveal, balance/status table, enable/disable and transaction detail modal                                          | Authenticated browser issue/detail/reload gate remains                                                            |
|  31 | Rewards / Loyalty              | 🟡 PARTIAL  |         ~45% | migration `014`, `reward.service.js`, customer rewards endpoint/page, order earn hook                                                              | No checkout redemption, reversal, bonus periods, or Admin settings UI                                             |
|  32 | CMS / Homepage                 | 🟡 PARTIAL  |         ~35% | `Home.jsx`, `data/home.js`, product/catalog integrations                                                                                           | Homepage content remains largely source/fixture driven                                                            |
|  33 | Static Pages / CMS             | 🟡 PARTIAL  |         ~45% | routes/pages in `storefront/src/pages` and App                                                                                                     | Content is hardcoded; no CMS backing                                                                              |
|  34 | Settings                       | 🟡 PARTIAL  |         ~70% | Persisted branding, SEO, commerce, SMTP, homepage visibility, navigation/footer and store settings                                                 | SMTP transport wiring/test-send, richer homepage ordering/content controls and secret rotation remain             |
|  35 | Media System                   | ✅ COMPLETE |         ~75% | `mediaStorage.service.js`, `/uploads` static serving, brand/category usage                                                                         | Deep file-signature validation and full product gallery incomplete                                                |
|  36 | SEO                            | 🟡 PARTIAL  |         ~40% | product/category/brand SEO columns and product responses                                                                                           | No complete metadata/canonical/sitemap Admin workflow                                                             |
|  37 | Security                       | 🟡 PARTIAL  |         ~80% | Helmet, CORS, parameterized SQL, auth separation, RBAC, hashed tokens, upload restrictions                                                         | Some error contracts and production secret/runtime validation need hardening                                      |
|  38 | Deployment Readiness           | 🟡 PARTIAL  |         ~65% | root scripts, env examples, cPanel docs, Vite builds                                                                                               | Live deployment and production secrets/media permissions unverified                                               |
|  39 | Testing / QA                   | 🟡 PARTIAL  |         ~30% | build checks, migration checks, manual smoke checks                                                                                                | No meaningful automated unit/integration/frontend test suite                                                      |
|  40 | Documentation                  | 🟡 PARTIAL  |         ~70% | README and docs set including this audit                                                                                                           | Earlier progress/API claims materially exceed actual UI completeness                                              |

## Critical Incomplete Modules

1. Admin Product, Inventory, Order, Customer, Coupon, and Gift Card screens are not complete end-to-end workflows.
2. Rewards redemption is not connected to checkout, and cancellation reversal/period bonuses are absent.
3. Razorpay remains a foundation rather than a production payment flow.
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

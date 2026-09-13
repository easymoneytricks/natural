# Natural Beauty — Production Ecommerce Gap Report

Last audited: 2026-09-14

Audit basis: source code, database migrations, registered routes, local MariaDB, build/format checks, HTTP smoke checks and authenticated browser verification where noted.

## Executive verdict

The repository now contains the core storefront, customer, catalog, inventory, order, admin and SEO foundations. The remaining work is primarily production proof and provider/deployment integration: real payment settlement/refunds, real SMTP delivery, staging concurrency, backups, observability, compliance review and release regression.

Current readiness: **strong controlled-staging foundation; not yet approved for public paid checkout.**

## Present in this repository

The following capabilities are implemented in source and local database migrations. “Present” means code and local validation exist; it does not claim production credentials or legal approval.

### Storefront and discovery

- Responsive header, mega menu, mobile menu, search overlay, cart drawer, wishlist and compare surfaces.
- Homepage, shop/catalog, product detail, cart, checkout, order success/failure, contact, about, legal and CMS page routes.
- Server-backed products, brands, categories, filters, pagination, product SKUs, stock availability and related product data.
- Explicit loading, empty, not-found and error states in the major catalog/account flows.
- Shared footer across storefront routes.

### Catalog and media

- MariaDB brands, categories, products, attributes, allowed values, explicit SKUs, prices/MRP, product content and product-category relations.
- Admin CRUD for brands, categories and products with archive/restore and safe-delete rules.
- SKU editor with combination validation and duplicate-SKU rejection.
- Product gallery upload, ordering, primary-image selection, SKU media assignment and removal.
- Media library with brand/category/product asset visibility.
- Upload hardening: JPEG/PNG/WebP magic-byte validation, decoded dimension checks, 5 MB limit, 8000×8000/40 MP limit, UUID filenames and path traversal protection.
- Optional malware/provider scan hook through `MEDIA_SCAN_COMMAND`.
- Dry-run orphan scanner: `npm --workspace natural-beauty-api run media:orphans`; order snapshot images are retained.

### Customer identity and account integrity

- Customer registration with email OTP verification, resend flow, login, refresh, logout and logout-all.
- Hashed, single-use password reset tokens with 30-minute expiry and transactional reset email template.
- Password reset revokes all customer sessions.
- Authenticated account dashboard using real order, wishlist, address and rewards APIs; no dashboard demo records.
- Profile update and validated saved addresses with default-address handling and soft deletion.
- Authenticated JSON data export containing profile, addresses, orders, cart and wishlist.
- Password-confirmed account deletion: customer is disabled/soft-deleted and every session is revoked.

### Commerce, pricing and inventory

- Guest/customer cart, wishlist merge and server-authoritative quote calculation.
- Coupons, gift cards, shipping methods, tax fields and checkout pricing persisted server-side.
- Configurable tax engine and invoice snapshots: tax can be enabled from Admin Settings, with rate, seller state, GSTIN, HSN/SAC, CGST/SGST versus IGST split and tax amount preserved on each order.
- Inventory on-hand, reserved and available-to-sell quantities.
- Reservation-aware COD order creation and stock release paths.
- Inventory adjustment idempotency keys, required reason capture, confirmation UI, movement filters, low-stock views and CSV export.
- Order item/product/SKU/name/price/image snapshots preserved for historical display.

### Orders, payments and communication

- Customer order list/detail and admin order list/detail APIs and UI.
- Fulfilment status transitions, courier/tracking fields and cancellation reason requirement.
- Return lifecycle states: `none`, `requested`, `approved`, `rejected`, `received`, `refunded`.
- Refund amount/reason validation and immutable after-sale record display.
- Authenticated PDF invoice download for customers and admins; customer downloads are constrained to the signed-in customer's own order and use immutable order snapshots, including tax breakdown where configured.
- Customer status/return email triggers and existing order-confirmation/admin-received email templates.
- Razorpay/Cashfree integration foundations, webhook routes and signature verification boundaries.

### Admin control plane

- Protected admin shell with ordered, scrollable navigation.
- Staff users, roles, permissions, session protection and audit logs.
- Admin customers, promotions, gift cards, reviews, contact inbox, media library, reports, useful-info analytics, settings, system and Pages/CMS routes.
- Storefront settings for branding, SEO/social image, shipping, tax, SMTP, homepage content, navigation/footer, payment gateway and maintenance mode.
- Optional Google Analytics 4 integration is controlled by Admin Settings (`enabled` plus Measurement ID) and is loaded only after optional analytics consent.
- Safe destructive operations and audit events across catalog/inventory/order operations.

### Content and SEO

- Published CMS pages with draft/published/archive states, SEO fields and public `/pages/:slug` route.
- Privacy, terms, shipping, returns, refund and cancellation policies are seeded as published CMS records with full customer-facing content and editable admin fields.
- CMS updates preserve the previous page payload in `content_page_versions` before each edit; legacy policy URLs now render the CMS records directly.
- Route-aware canonical URL, title, description, robots directive, Open Graph and Twitter metadata.
- Product Product JSON-LD and shop CollectionPage/ItemList JSON-LD.
- Database-backed `/sitemap.xml` for active products/categories and published CMS pages.
- `/robots.txt` disallowing private account, checkout, cart, wishlist, compare and admin routes.
- Product slug redirect table and storefront canonical navigation after slug changes.
- Product, category and brand editors now support SEO title, description, comma-separated keywords and an optional same-origin canonical URL. Product detail metadata and JSON-LD consume the saved canonical URL; unsafe cross-origin canonical values safely fall back to the current site URL.
- Product pages now publish a Schema.org `@graph` containing Product, Brand/category context, AggregateOffer, optional AggregateRating and BreadcrumbList. Shop pages publish CollectionPage, ItemList and BreadcrumbList JSON-LD.

## Remaining gaps

### P0 — before accepting public paid orders

1. **Payment provider finalization:** complete one selected Cashfree/Razorpay production path, verified callback/webhook reconciliation, replay/idempotency tests, delayed-payment recovery and provider-backed refunds. Admin refund states currently track workflow but do not settle money with the provider.
2. **Transactional email proof:** configure production SMTP/provider secrets, run test-send, verify OTP/order/status/reset delivery from staging, and monitor failed/retried deliveries. Add unsubscribe/complaint handling where legally required.
3. **Production deployment boundary:** configure separate production DB/JWT/admin/payment/SMTP/storage secrets, HTTPS, secure cookie domain, CORS allowlist, durable object storage, encrypted backups and a tested rollback/restore drill.
4. **Transaction concurrency proof:** run clean-staging concurrent tests for reservation expiry, cancellation, payment failure, duplicate checkout, coupon/gift-card limits and refund/release invariants.

### P1 — before serious public launch

1. **Provider-backed automated E2E:** browser/API tests for login, signup OTP, catalog, cart, quote, COD, online callback, order confirmation, admin status update, stock release and reset email.
2. **Promotion reversals:** restore coupon usage and gift-card holds/balances after cancellation/refund; add timezone and expiry tests.
3. **Rewards lifecycle:** define earn/redeem rules, apply rewards in quote, reserve/reverse ledger entries and cover cancellation/refund.
4. **Search/performance:** server-backed search with debouncing/cancellation, no-result suggestions, URL filter state, pagination and query/index performance checks.
5. **Media production policy:** configure scanner, private originals/derivatives and CDN/object-storage lifecycle; review the three locally reported orphan files before any deletion.
6. **Tax/compliance sign-off:** implementation now supports configurable GST invoice fields/rates, tax snapshots, privacy retention language, necessary-cookie/optional-consent wording and a no-card-data payment boundary. The business owner/tax advisor must still confirm GST registration, HSN/SAC, applicable rates/place-of-supply treatment, retention periods, refund wording and launch jurisdiction before enabling tax or public checkout.

### P2 — scale and operational hardening

- Accessibility/performance/operations foundations are present: visible focus and reduced-motion CSS, labelled/live-region patterns, route/API rate limits, request IDs, structured JSON logs, cache headers, consent capture and backup-prune tooling. See [docs/OPERATIONS.md](OPERATIONS.md).
- Remaining P2 evidence work is the automated axe/Lighthouse and responsive visual suite, generated image derivatives/srcset, staging load test, provider uptime/alert wiring, restore rehearsal, anonymised staging refresh and a real marketing unsubscribe/suppression workflow before campaigns. GA4 production reporting still requires the business owner to configure the Measurement ID and validate the consent/legal basis.

## Next execution sequence

1. Freeze current migrations and back up the local/staging database.
2. Create a clean staging environment with provider-managed secrets and HTTPS/CORS/cookie configuration.
3. Configure SMTP and run OTP, password-reset, order, status and admin-notification delivery tests.
4. Select Cashfree or Razorpay as the single launch provider; complete callback/webhook reconciliation, refund settlement and replay tests.
5. Run concurrent quote/reservation/order/payment/refund tests against a dedicated staging dataset.
6. Run browser E2E across customer and admin critical paths, including product lifecycle, inventory and order operations.
7. Maintain legal CMS versions and complete tax/privacy/retention review with owner sign-off.
8. Configure media scanning, private originals, derivatives/CDN and review orphan cleanup output.
9. Add monitoring, alerts, backup/restore and rollback evidence.
10. Promote only when every P0 item is green, evidence is recorded and business/payment/legal owners sign off.

## Evidence and limitations

- Local migrations through `032_tax_setting_defaults.sql` are applied.
- `npm run format:check` and full storefront/admin builds pass after the latest changes.
- Sitemap, robots, invoice and media-orphan HTTP/CLI smoke checks pass locally.
- Browser checks covered authenticated admin order operations and storefront password-recovery UI; they do not prove all responsive/accessibility states.
- Local builds/source inspection cannot prove production email delivery, payment settlement, provider refunds, legal compliance, concurrent correctness or deployment durability.

## Release decision

**Do not launch public paid checkout yet.** The next release is a staging-hardening release focused on provider-backed payment/refund settlement, real email delivery, concurrency tests, deployment/backup proof and automated critical-path coverage.

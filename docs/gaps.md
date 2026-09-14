# Natural Beauty — Current Production Gap Register

Last audited: 2026-09-15

Current readiness: **90%**. This register contains only genuine functional gaps or production launch evidence; completed source modules are not called missing because external verification is pending.

## P0 — before public paid launch

1. **Payment launch evidence:** run one selected Cashfree or Razorpay path with real credentials; verify callback replay/idempotency, delayed-payment recovery and provider-backed refunds.
2. **Transactional email proof:** configure production SMTP/provider secrets and verify OTP, order, status, reset and admin-notification delivery with monitoring.
3. **Hosted deployment evidence:** configure real secrets/domains, verify HTTPS/CORS/cookies and durable media, then complete encrypted backup/rollback/restore rehearsal.
4. **Concurrency proof:** run staging tests for reservations, duplicate checkout, payment failure, cancellation, coupon limits, gift-card balances and refund invariants.

## P1 — before serious public launch

1. **Rewards quote integration:** apply configured reward points in quote/order pricing and complete full refund/reversal ledger coverage.
2. **Promotion reversal hardening:** reconcile coupon usage and gift-card balances after every cancellation/refund path, including expiry/timezone cases.
3. **Automated critical-path suite:** add authenticated API/browser tests for catalog, auth, cart merge, checkout, COD, online callbacks, account and Admin workflows.
4. **Accessibility/performance regression:** run axe/Lighthouse, responsive visual checks, image derivative/srcset checks and staging load tests.
5. **Marketing unsubscribe suppression:** implement and verify unsubscribe/complaint suppression before campaigns.
6. **Tax/legal sign-off:** owner/tax-advisor confirmation for GST, HSN/SAC, place of supply, retention, consent and refund wording.

## P2 — operational hardening

- Configure provider uptime/alert wiring, backup monitoring and restore evidence.
- Configure media scanning, private originals, derivatives/CDN and orphan review.
- Validate production SEO crawl/indexing and analytics consent/reporting.

## Completed implementation areas

Catalog/SKU/inventory, storefront integration, authentication, profile/addresses, cart merge, wishlist, compare, shipping, coupons, gift cards, orders/COD, Cashfree/Razorpay source flows, Admin CRUD/UI, CMS/settings, SEO and security are implemented. Their remaining checks above are production evidence or hardening, not missing feature code.

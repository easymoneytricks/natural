# Natural Beauty — Development Progress

## Current Phase
Rewards and loyalty ledger foundation (Task 33).

## Completed
Storefront foundation, catalog/PDP, explicit SKU selection, cart, wishlist, compare, checkout/COD, customer auth/dashboard, persistent commerce foundations, public catalog API, Admin auth/RBAC/dashboard, Brands and Categories Admin.

## In Progress
Product Admin and explicit SKU editor are partially implemented. Inventory, Order, Customer, Promotions, and Rewards APIs are implemented with lightweight UIs; richer Admin settings and checkout redemption UX remain in progress.

## Next
Complete Product Admin editor and connect the inventory page to adjustment and movement-history interactions.

## Deferred
Inventory adjustment UI, bulk import, reviews, CMS, settings, and other later Admin modules.

## Important Architecture Decisions
Explicit SKUs only; no Cartesian generation; server-authoritative pricing; inventory reservations; immutable order snapshots; separate customer/Admin auth; local/cPanel media; root npm workspace.

## Last Updated
2026-09-10

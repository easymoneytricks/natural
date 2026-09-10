# API

Public routes include `/api/health`, `/api/v1/products`, `/api/v1/categories`, `/api/v1/brands`, customer auth/commerce, checkout, orders, and payments/webhooks. Admin routes include `/api/v1/admin/auth/*`, dashboard, brands, categories, and products. Customer routes use customer tokens; Admin routes use staff tokens and RBAC.

Inventory Admin routes: `GET /api/v1/admin/inventory`, `/summary`, `/:skuId`, and `/:skuId/movements` require `inventory.view`; stock adjustment and reorder-level changes require `inventory.manage`.

Order Admin routes: `GET /api/v1/admin/orders`, `/summary`, and `/:orderNumber` require `orders.view`; status and shipping updates require `orders.manage`.

Customer Admin routes: `GET /api/v1/admin/customers`, `/summary`, and `/:id` require `customers.view`; account status changes require `customers.manage`. Responses exclude passwords, hashes, tokens, and session secrets.

Promotions Admin routes: `/api/v1/admin/promotions/coupons` supports list/create/update; `/gift-cards` supports masked list, secure generation, detail, and status changes. Reads require `promotions.view`; mutations require `promotions.manage`.

Customer rewards: `GET /api/v1/customer/rewards` returns the authenticated customer's balance and ledger; `/rewards/redeem` validates and redeems points. Admin reward visibility is available at `/api/v1/admin/customers/:customerId/rewards` and `/api/v1/admin/rewards/config`.

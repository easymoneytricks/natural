# Natural Beauty API

Node.js and Express foundation for the Natural Beauty storefront.

## Requirements

- Node.js 18+
- MariaDB/MySQL (XAMPP is suitable for local development)
- Existing `naturalbeauty` database

## Setup

```text
cd backend
npm install
copy .env.example .env
npm run migrate
npm run dev
```

The API health endpoint is available at `http://localhost:4000/api/health`.

## Public catalog API

- `GET /api/v1/products` — paginated listing with `q`, `category`, `brand`, `skin`, `concern`, `size`, `minPrice`, `maxPrice`, `availability`, `sort`, `page`, and `limit` filters.
- `GET /api/v1/products/:slug` — product detail, attributes, active explicit SKUs, and derived availability.
- `GET /api/v1/categories` and `GET /api/v1/categories/:slug`
- `GET /api/v1/brands` and `GET /api/v1/brands/:slug`
- `GET /api/v1/catalog/filters` — active filter metadata and price range.

Catalog endpoints are read-only. Prices are numeric JSON values and public
inventory responses expose derived `available` quantities only.

## Customer authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/me`

## Customer profile and saved addresses

All endpoints below require the authenticated customer's Bearer access token;
the customer identity is taken from that token, never from request input.

- `GET /api/v1/customer/profile`
- `PATCH /api/v1/customer/profile` (firstName, lastName, phone; email is read-only)
- `GET /api/v1/customer/addresses`
- `POST /api/v1/customer/addresses`
- `PATCH /api/v1/customer/addresses/:id`
- `DELETE /api/v1/customer/addresses/:id` (soft delete)
- `POST /api/v1/customer/addresses/:id/default`

## Persistent cart and wishlist

Authenticated customers use server-side cart and product-level wishlist data;
guest cart and wishlist remain in browser storage and merge additively after
login. Cart prices and availability are always resolved from current SKU and
inventory data. Cart changes never reserve inventory.

- `GET /api/v1/customer/cart`
- `POST /api/v1/customer/cart/items`
- `PATCH /api/v1/customer/cart/items/:skuId`
- `DELETE /api/v1/customer/cart/items/:skuId`
- `DELETE /api/v1/customer/cart`
- `POST /api/v1/customer/cart/merge` (idempotent `mergeId`)
- `GET /api/v1/customer/wishlist`
- `POST /api/v1/customer/wishlist/items`
- `DELETE /api/v1/customer/wishlist/items/:productId`
- `POST /api/v1/customer/wishlist/merge`

Compare remains local-only. Checkout and order creation are not part of this API.

## Orders and COD

- `POST /api/v1/orders` places a COD order for a guest or authenticated customer.
- `GET /api/v1/customer/orders` lists the authenticated customer's orders.
- `GET /api/v1/customer/orders/:orderNumber` returns immutable item/address snapshots and status history.

Order creation recalculates the quote, locks inventory rows, reserves stock,
consumes promotions/gift-card funds transactionally, and accepts an
`idempotencyKey` to prevent duplicate placement. Razorpay and online capture
are intentionally not implemented yet.

## Razorpay payment foundation

- `GET /api/v1/checkout/payment-methods`
- `POST /api/v1/payments/razorpay/create`
- `POST /api/v1/payments/razorpay/verify`
- `POST /api/v1/webhooks/razorpay`

Set `RAZORPAY_ENABLED=true` only with provider credentials supplied through
the environment. Webhooks verify the raw request body with the separate
webhook secret. Online payment remains disabled until live provider order
creation and finalization are configured.

Login and registration return a short-lived Bearer access token. Refresh
sessions use a rotated, opaque HttpOnly cookie named `nb_refresh` by default;
the raw refresh token is never stored in MariaDB. Browser clients must send
`credentials: 'include'`. Credentialed CORS is limited to `CORS_ORIGINS`, and
the cookie uses SameSite protection (lax locally, strict in production).

This foundation intentionally contains only migration infrastructure and a
database-backed health check. Storefront integrations and business schemas are
added in later tasks.

## Admin security domain

Admin/staff authentication is separate from customer authentication. Admin
endpoints use `/api/v1/admin/*`, a distinct JWT secret, and the `nb_admin_refresh`
HttpOnly cookie. Seed development staff with `DEV_ADMIN_PASSWORD` (and
optionally `DEV_ADMIN_EMAIL`) before running `npm run seed:dev`.

The initial Super Admin receives the module-level permissions defined in the
admin seed. Protected dashboard and audit endpoints enforce those permissions;
catalog/order CRUD is intentionally deferred.

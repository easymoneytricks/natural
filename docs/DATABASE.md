# Database

SQL migrations in `backend/src/db/migrations` cover catalog (brands, categories, products, media, attributes, SKUs), inventory and movements, customers/sessions/addresses, carts/wishlist, promotions, orders, payments, and Admin users/roles/permissions/sessions/audit logs.

Migration 014 adds ledger-based `reward_accounts`, `reward_transactions`, and centralized `reward_config`. Reward balances are derived from account balance fields and traceable transactions.

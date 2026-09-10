# Architecture

`storefront/` is the React/Vite customer app; `admin/` is a separate React/Vite staff app with independent authentication; `backend/` is a Node.js/Express API backed by MariaDB and SQL migrations.

Explicit SKU combinations are the sellable identity; allowed values never generate Cartesian combinations. Inventory available is on-hand minus reserved. Checkout pricing is server-authoritative, and orders retain snapshots.

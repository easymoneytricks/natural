# Natural Beauty

Premium natural skincare ecommerce project with a React storefront, separate staff Admin Panel, and Node.js/Express/MariaDB API.

## Structure

- `storefront/` — customer-facing React/Vite ecommerce application
- `admin/` — separate React/Vite staff application
- `backend/` — Node.js + Express + MariaDB API
- `docs/` — project and operational documentation

## Local development

Requirements: Node.js, npm, and MariaDB/MySQL with a `naturalbeauty` database.

```bash
npm install
npm run dev
```

Storefront: `http://localhost:5173` · Admin: `http://localhost:5174` · Backend: `http://localhost:4000`.

Individual commands: `npm run dev:storefront`, `npm run dev:admin`, `npm run dev:backend`.

Build with `npm run build`, or use `npm run build:storefront` and `npm run build:admin`. Migration and seed commands delegate to the backend package.

Read [Architecture](docs/ARCHITECTURE.md) and [Progress](docs/PROGRESS.md) before substantial changes.

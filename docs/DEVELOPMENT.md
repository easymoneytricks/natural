# Development

Run `npm install` and `npm run dev` from the root. Ports are 5173 (storefront), 5174 (Admin), 4000 (API), and 3306 (MariaDB). Use `npm run migrate` and `npm run seed:dev`; backend also provides status and inventory maintenance scripts. Add migrations under `backend/src/db/migrations` using the existing numbered convention.

For substantial tasks: read `docs/ARCHITECTURE.md` and `docs/PROGRESS.md`, implement the scoped task, update progress when status changes, and update specialized docs only when architecture/API/database/security/deployment changes.

# Production deployment runbook

This short reference is supplemented by the copy/paste first-hosted-deployment procedure in [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md), the [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md), and the source-derived [ENVIRONMENT.md](ENVIRONMENT.md). The initial deployment is a controlled inspection environment: keep Store Availability **Closed** or **Coming soon** and payments in sandbox/test mode.

## Secrets

Create a separate production secret set in the hosting provider. Start from `backend/.env.production.example`; do not copy the development `.env` or commit a populated env file. Generate independent 64+ character random values for `JWT_ACCESS_SECRET` and `ADMIN_JWT_ACCESS_SECRET`. Keep Cashfree, Razorpay, SMTP, database and media credentials server-side only. Validate with `NODE_ENV=production npm run --workspace natural-beauty-api validate:production` before starting the API.

Production startup fails fast unless database password, separate JWT secrets, HTTPS CORS origins, HTTPS public URLs, SMTP credentials and media public URL are configured. Development seed credentials are rejected in production. Set `DB_SSL=true` for managed MariaDB TLS and use a least-privilege application database user.

## Network and cookies

- Terminate TLS at the reverse proxy/load balancer and forward `X-Forwarded-Proto: https`.
- Set `TRUST_PROXY` to the trusted proxy hop count.
- Set `REQUIRE_HTTPS=true` and list only exact storefront/admin HTTPS origins in `CORS_ORIGINS`.
- Set `COOKIE_DOMAIN` only when storefront and API share the intended parent domain. Refresh cookies are `HttpOnly`, `Secure` and `SameSite=Strict` in production.
- Expose `/api/health` to the load balancer and keep admin endpoints behind auth/RBAC.

## Deploy and rollback

1. Build and run reviewed migrations: `npm run build`, then `npm run migrate`.
2. Take a backup before migrations: `BACKUP_DIR=/secure/backup/path npm run --workspace natural-beauty-api backup:production`.
3. Deploy the immutable artifact and restart with graceful `SIGTERM` handling.
4. Verify `/api/health`, catalog read, login/refresh, staging checkout and email/payment callbacks.
5. For rollback, freeze writes and restore only after incident approval: `CONFIRM_RESTORE=YES npm run --workspace natural-beauty-api restore:production -- <backup-directory>`, redeploy the previous artifact, and re-run health checks.

Backups contain the MariaDB dump and configured persistent uploads directory. Store them encrypted outside the application host with retention and scheduled restore drills. Restore is destructive and requires explicit confirmation.

## Storage

`MEDIA_STORAGE_ROOT` must be a persistent mounted volume in production; ephemeral container disks are not acceptable. `MEDIA_PUBLIC_BASE_URL` must be its HTTPS public URL. Replace local volume storage with a reviewed object-storage adapter before horizontal scaling/CDN delivery.

## Never do this

- Never run `seed:dev` against production.
- Never use development credentials, localhost CORS origins or HTTP callback URLs in production.
- Never restore over a live database without a backup, write freeze and reviewed rollback plan.

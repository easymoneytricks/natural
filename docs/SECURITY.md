# Security

Customer and Admin authentication are separate. Access tokens are short-lived and refresh tokens are HttpOnly, hashed server-side. Passwords are hashed; Admin RBAC protects management routes. SQL is parameterized, CORS is allowlisted, uploads are restricted to image types and managed paths, and payment/webhook signatures are server-verified. Secrets come from environment variables.

For production, customer and Admin JWT secrets must be independent 64+ character random values and may not be reused across staging/production. `CORS_ORIGINS` contains exact HTTPS browser origins; `TRUST_PROXY` must be the verified proxy hop count; and `REQUIRE_HTTPS=true` preserves HTTPS enforcement behind that proxy. Production failures return safe error messages while details remain in server logs with `X-Request-ID` correlation. See [ENVIRONMENT.md](ENVIRONMENT.md) and [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for configuration and hosting procedures.

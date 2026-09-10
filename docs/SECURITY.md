# Security

Customer and Admin authentication are separate. Access tokens are short-lived and refresh tokens are HttpOnly, hashed server-side. Passwords are hashed; Admin RBAC protects management routes. SQL is parameterized, CORS is allowlisted, uploads are restricted to image types and managed paths, and payment/webhook signatures are server-verified. Secrets come from environment variables.

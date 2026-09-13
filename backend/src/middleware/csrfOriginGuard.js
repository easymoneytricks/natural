import { AuthError } from "../services/auth.service.js";
import { env } from "../config/env.js";

const unsafe = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function csrfOriginGuard(req, res, next) {
  if (!unsafe.has(req.method)) return next();
  const origin = req.get("origin");
  if (!origin || env.corsOrigins.includes(origin)) return next();
  return next(
    new AuthError(403, "FORBIDDEN", "This request origin is not allowed."),
  );
}

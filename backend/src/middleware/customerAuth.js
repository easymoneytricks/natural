import { verifyAccessToken } from "../utils/tokens.js";
import { getActiveCustomer, AuthError } from "../services/auth.service.js";
import { pool } from "../config/database.js";

export async function requireCustomerAuth(req, res, next) {
  try {
    const header = req.get("authorization") || "";
    if (!header.startsWith("Bearer "))
      throw new AuthError(
        401,
        "UNAUTHENTICATED",
        "Please sign in to continue.",
      );
    const claims = verifyAccessToken(header.slice(7));
    if (claims.type !== "customer" || !claims.sub)
      throw new AuthError(
        401,
        "UNAUTHENTICATED",
        "Please sign in to continue.",
      );
    const customer = await getActiveCustomer(pool, claims.sub);
    if (!customer)
      throw new AuthError(
        401,
        "UNAUTHENTICATED",
        "Please sign in to continue.",
      );
    req.customer = customer;
    req.auth = claims;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return next(
        new AuthError(401, "UNAUTHENTICATED", "Your access token has expired."),
      );
    if (error.name === "JsonWebTokenError")
      return next(
        new AuthError(401, "UNAUTHENTICATED", "Please sign in to continue."),
      );
    next(error);
  }
}

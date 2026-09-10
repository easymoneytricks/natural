import { verifyAccessToken } from "../utils/tokens.js";
import { getActiveCustomer } from "../services/auth.service.js";
import { pool } from "../config/database.js";
export async function optionalCustomerAuth(req, res, next) {
  try {
    const header = req.get("authorization") || "";
    if (!header) {
      return next();
    }
    if (!header.startsWith("Bearer "))
      throw Object.assign(new Error("Please sign in to continue."), {
        statusCode: 401,
        code: "UNAUTHENTICATED",
      });
    const claims = verifyAccessToken(header.slice(7));
    if (claims.type !== "customer" || !claims.sub)
      throw Object.assign(new Error("Please sign in to continue."), {
        statusCode: 401,
        code: "UNAUTHENTICATED",
      });
    const customer = await getActiveCustomer(pool, claims.sub);
    if (!customer)
      throw Object.assign(new Error("Please sign in to continue."), {
        statusCode: 401,
        code: "UNAUTHENTICATED",
      });
    req.customer = customer;
    req.auth = claims;
    next();
  } catch (e) {
    next(e);
  }
}

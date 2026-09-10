import { AuthError } from "../services/auth.service.js";
import { verifyAdminAccessToken } from "../utils/adminTokens.js";
import { getAdminIdentity } from "../services/adminAuth.service.js";
import { pool } from "../config/database.js";
export async function requireAdminAuth(req, res, next) {
  try {
    const h = req.get("authorization") || "";
    if (!h.startsWith("Bearer "))
      throw new AuthError(
        401,
        "UNAUTHENTICATED",
        "Please sign in to continue.",
      );
    const claims = verifyAdminAccessToken(h.slice(7));
    if (claims.type !== "admin" || !claims.sub)
      throw new AuthError(
        401,
        "UNAUTHENTICATED",
        "Please sign in to continue.",
      );
    req.admin = await getAdminIdentity(pool, claims.sub);
    req.adminId = claims.sub;
    next();
  } catch (e) {
    if (["TokenExpiredError", "JsonWebTokenError"].includes(e.name))
      return next(
        new AuthError(401, "UNAUTHENTICATED", "Please sign in to continue."),
      );
    next(e);
  }
}
export const requireAdminPermission = (permission) => (req, res, next) => {
  if (!req.admin?.effectivePermissions?.includes(permission))
    return next(
      new AuthError(
        403,
        "FORBIDDEN",
        "You do not have permission to access this area.",
      ),
    );
  next();
};

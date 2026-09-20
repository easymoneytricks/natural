import cookieParser from "cookie-parser";
import { env } from "../config/env.js";
import { pool } from "../config/database.js";
import { adminRefreshCookieOptions } from "../utils/adminTokens.js";
import {
  getAdminIdentity,
  loginAdmin,
  refreshAdmin,
  revokeAdminSession,
  revokeAllAdminSessions,
} from "../services/adminAuth.service.js";
import { audit } from "../services/adminCatalog.service.js";
const set = (res, t) =>
  res.cookie(env.admin.refreshCookieName, t, adminRefreshCookieOptions());
const clear = (res) =>
  res.clearCookie(env.admin.refreshCookieName, {
    ...adminRefreshCookieOptions(),
    maxAge: undefined,
  });
export async function login(req, res, next) {
  try {
    const r = await loginAdmin(pool, req.body, req);
    await audit(
      pool,
      r.admin.id,
      "admin.login",
      "admin_users",
      r.admin.id,
      req,
      {
        method: "password",
      },
    );
    set(res, r.rawToken);
    res.json({ data: { accessToken: r.accessToken, admin: r.admin } });
  } catch (e) {
    next(e);
  }
}
export async function refresh(req, res, next) {
  try {
    const r = await refreshAdmin(
      pool,
      req.cookies[env.admin.refreshCookieName],
    );
    set(res, r.rawToken);
    res.json({ data: { accessToken: r.accessToken, admin: r.admin } });
  } catch (e) {
    clear(res);
    next(e);
  }
}
export async function logout(req, res, next) {
  try {
    const adminId = await revokeAdminSession(
      pool,
      req.cookies[env.admin.refreshCookieName],
    );
    if (adminId)
      await audit(pool, adminId, "admin.logout", "admin_users", adminId, req, {
        method: "session",
      });
    clear(res);
    res.json({ data: { loggedOut: true } });
  } catch (e) {
    next(e);
  }
}
export async function logoutAll(req, res, next) {
  try {
    await revokeAllAdminSessions(pool, req.adminId);
    await audit(
      pool,
      req.adminId,
      "admin.logout_all",
      "admin_users",
      req.adminId,
      req,
      { method: "all_sessions" },
    );
    clear(res);
    res.json({ data: { loggedOut: true } });
  } catch (e) {
    next(e);
  }
}
export async function me(req, res) {
  res.json({ data: { admin: req.admin } });
}

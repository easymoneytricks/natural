import { env } from "../config/env.js";
import { pool } from "../config/database.js";
import {
  loginCustomer,
  refreshCustomerSession,
  registerCustomer,
  revokeAllSessions,
  revokeSession,
  publicCustomer,
} from "../services/auth.service.js";
import { refreshCookieOptions } from "../utils/tokens.js";

const setRefreshCookie = (res, token) =>
  res.cookie(env.auth.refreshCookieName, token, refreshCookieOptions());
const clearRefreshCookie = (res) =>
  res.clearCookie(env.auth.refreshCookieName, {
    ...refreshCookieOptions(),
    maxAge: undefined,
  });

export async function register(req, res, next) {
  try {
    const result = await registerCustomer(pool, req.body, req);
    setRefreshCookie(res, result.rawToken);
    res
      .status(201)
      .json({
        data: { accessToken: result.accessToken, customer: result.customer },
      });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginCustomer(pool, req.body, req);
    setRefreshCookie(res, result.rawToken);
    res.json({
      data: { accessToken: result.accessToken, customer: result.customer },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await refreshCustomerSession(
      pool,
      req.cookies[env.auth.refreshCookieName],
    );
    setRefreshCookie(res, result.rawToken);
    res.json({
      data: { accessToken: result.accessToken, customer: result.customer },
    });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await revokeSession(pool, req.cookies[env.auth.refreshCookieName]);
    clearRefreshCookie(res);
    res.json({ data: { loggedOut: true } });
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(req, res, next) {
  try {
    await revokeAllSessions(pool, req.customer.id);
    clearRefreshCookie(res);
    res.json({ data: { loggedOut: true } });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ data: { customer: publicCustomer(req.customer) } });
}

import { env } from "../config/env.js";
import { pool } from "../config/database.js";
import {
  loginCustomer,
  refreshCustomerSession,
  registerCustomer,
  revokeAllSessions,
  revokeSession,
  publicCustomer,
  verifyCustomerEmail,
  createCustomerEmailVerification,
  requestPasswordReset,
  resetPassword,
  exportCustomerData,
  requestCustomerAccountDeletion,
} from "../services/auth.service.js";
import {
  emailVerificationEmail,
  passwordResetEmail,
  sendEmail,
} from "../services/mail.service.js";
import { refreshCookieOptions } from "../utils/tokens.js";
import { verifyRecaptcha } from "../services/recaptcha.service.js";

const setRefreshCookie = (res, token) =>
  res.cookie(env.auth.refreshCookieName, token, refreshCookieOptions());
const clearRefreshCookie = (res) =>
  res.clearCookie(env.auth.refreshCookieName, {
    ...refreshCookieOptions(),
    maxAge: undefined,
  });

export async function register(req, res, next) {
  try {
    await verifyRecaptcha(pool, req.body?.recaptchaToken, req, "signup");
    const result = await registerCustomer(pool, req.body, req);
    await sendEmail(
      emailVerificationEmail({
        recipient: result.verification.email,
        code: result.verification.code,
      }),
    );
    res.status(202).json({
      data: { customer: result.customer, verificationRequired: true },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const result = await verifyCustomerEmail(pool, req.body, req);
    setRefreshCookie(res, result.rawToken);
    res.json({
      data: {
        accessToken: result.accessToken,
        customer: result.customer,
        verified: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const result = await createCustomerEmailVerification(pool, req.body?.email);
    if (result)
      await sendEmail(
        emailVerificationEmail({
          recipient: result.email,
          code: result.code,
        }),
      );
    res.status(202).json({
      data: {
        accepted: true,
        message:
          "If that account needs verification, a new code has been sent.",
      },
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

export async function forgotPassword(req, res, next) {
  try {
    const result = await requestPasswordReset(pool, req.body?.email);
    if (result)
      await sendEmail(
        passwordResetEmail({ recipient: result.email, token: result.token }),
      );
    res.status(202).json({ data: { accepted: true } });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordAction(req, res, next) {
  try {
    await resetPassword(pool, req.body?.token, req.body?.password);
    res.json({ data: { reset: true } });
  } catch (error) {
    next(error);
  }
}

export async function exportAccount(req, res, next) {
  try {
    res.json({ data: await exportCustomerData(pool, req.customer.id) });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    await requestCustomerAccountDeletion(pool, req.customer.id, req.body?.password);
    clearRefreshCookie(res);
    res.json({ data: { requested: true } });
  } catch (error) {
    next(error);
  }
}

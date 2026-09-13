import { AuthError } from "./auth.service.js";

const setting = async (pool, key) => {
  const [[row]] = await pool.execute(
    "SELECT value_json FROM store_settings WHERE setting_group='recaptcha' AND setting_key=? LIMIT 1",
    [key],
  );
  if (!row) return "";
  try {
    return JSON.parse(row.value_json);
  } catch {
    return row.value_json;
  }
};

export async function verifyRecaptcha(pool, token, req, action) {
  const enabled =
    String(await setting(pool, "enabled")).toLowerCase() === "true";
  if (!enabled) return;
  const siteKey = String((await setting(pool, "site_key")) || "").trim();
  const secretKey = String((await setting(pool, "secret_key")) || "").trim();
  if (!siteKey || !secretKey)
    throw new AuthError(
      503,
      "RECAPTCHA_NOT_CONFIGURED",
      "Security verification is not configured yet.",
    );
  if (!token)
    throw new AuthError(
      400,
      "RECAPTCHA_REQUIRED",
      "Please complete the security verification.",
    );
  const body = new URLSearchParams({
    secret: secretKey,
    response: String(token),
    remoteip: req.ip || "",
  });
  let result;
  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      { method: "POST", body, signal: AbortSignal.timeout(8000) },
    );
    result = await response.json();
  } catch {
    throw new AuthError(
      503,
      "RECAPTCHA_UNAVAILABLE",
      "Security verification is temporarily unavailable. Please try again.",
    );
  }
  if (!result?.success)
    throw new AuthError(
      400,
      "RECAPTCHA_FAILED",
      `Security verification failed${action ? ` for ${action}` : ""}. Please try again.`,
    );
}

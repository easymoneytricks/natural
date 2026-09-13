import { pool } from "../config/database.js";
import * as service from "../services/adminSystem.service.js";
import { sendTestEmail } from "../services/mail.service.js";

const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);
export const overview = wrap(async (req, res) =>
  res.json({ data: await service.systemOverview(pool) }),
);
export const reports = wrap(async (req, res) =>
  res.json({ data: await service.reportSummary(pool, req.query) }),
);
export const usefulInfo = wrap(async (req, res) =>
  res.json({ data: await service.usefulInfo(pool) }),
);
export const testEmail = wrap(async (req, res) => {
  const recipient = String(
    req.body?.recipient || req.admin?.email || "",
  ).trim();
  if (!recipient) {
    const error = new Error("A test recipient email is required.");
    error.statusCode = 400;
    error.code = "RECIPIENT_REQUIRED";
    throw error;
  }
  res.json({ data: await sendTestEmail(recipient) });
});

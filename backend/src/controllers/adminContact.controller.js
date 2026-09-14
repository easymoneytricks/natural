import { pool } from "../config/database.js";
import * as service from "../services/contact.service.js";
import { contactResponseEmail, sendEmail } from "../services/mail.service.js";

const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);
export const list = wrap(async (req, res) =>
  res.json({ data: await service.list(pool, req.query) }),
);
export const update = wrap(async (req, res) => {
  const updated = await service.update(
    pool,
    req.params.id,
    req.body,
    req.admin.id,
    req,
  );
  let email = { skipped: true };
  const replyMessage = String(req.body.replyMessage || "").trim();
  if (replyMessage) {
    email = await sendEmail(
      contactResponseEmail({
        recipient: updated.email,
        name: updated.name,
        message: replyMessage,
        submissionId: updated.id,
      }),
    );
  }
  res.json({ data: updated, email });
});

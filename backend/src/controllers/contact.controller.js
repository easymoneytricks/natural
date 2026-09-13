import { pool } from "../config/database.js";
import * as service from "../services/contact.service.js";
import { verifyRecaptcha } from "../services/recaptcha.service.js";
import {
  contactAdminEmail,
  contactReceivedEmail,
  sendEmail,
} from "../services/mail.service.js";

const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);
export const create = wrap(async (req, res) => {
  await verifyRecaptcha(pool, req.body?.recaptchaToken, req, "contact");
  const submission = await service.create(pool, req.body);
  Promise.allSettled([
    sendEmail(
      contactReceivedEmail({
        recipient: req.body.email,
        name: req.body.name,
      }),
    ),
    sendEmail(
      contactAdminEmail({ submission: { ...req.body, ...submission } }),
    ),
  ]).catch(() => {});
  res.status(201).json({ data: submission });
});

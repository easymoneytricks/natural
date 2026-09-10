import { pool } from "../config/database.js";
import { upload } from "../services/mediaStorage.service.js";
import * as s from "../services/adminProductExtras.service.js";
const w = (f) => (req, res, next) => f(req, res).catch(next);
export const content = w(async (req, res) =>
  res.json({
    data: await s.syncContent(pool, req.params.id, req.body, req.admin.id, req),
  }),
);
export const attrs = w(async (req, res) =>
  res.json({ data: await s.attributes(pool) }),
);
export const mediaUpload = [
  upload.array("images", 10),
  w(async (req, res) =>
    res.status(201).json({
      data: await Promise.all(
        (req.files || []).map((file) =>
          s.mediaUpload(pool, req.params.id, file, req.admin.id, req),
        ),
      ),
    }),
  ),
];
export const mediaUpdate = w(async (req, res) =>
  res.json({
    data: await s.mediaUpdate(
      pool,
      req.params.id,
      { ...req.body, mediaId: req.params.mediaId },
      req.admin.id,
      req,
    ),
  }),
);
export const mediaRemove = w(async (req, res) =>
  res.json({
    data: await s.mediaRemove(
      pool,
      req.params.id,
      req.params.mediaId,
      req.admin.id,
      req,
    ),
  }),
);
export const remove = w(async (req, res) => {
  await s.removeProduct(pool, req.params.id, req.admin.id, req);
  res.json({ data: { success: true } });
});
export const restore = w(async (req, res) => {
  await s.restoreProduct(pool, req.params.id, req.admin.id, req);
  res.json({ data: { success: true } });
});

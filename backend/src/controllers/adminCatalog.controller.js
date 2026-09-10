import { pool } from "../config/database.js";
import * as catalog from "../services/adminCatalog.service.js";
import {
  saveUpload,
  removeManagedFile,
} from "../services/mediaStorage.service.js";

const singular = (t) => (t === "brands" ? "brand" : "category");
const send = (res, data) => res.json({ data });
export const list = (type) => (req, res, next) =>
  catalog
    .list(pool, type, req.query.q || "")
    .then((rows) => send(res, rows))
    .catch(next);
export const detail = (type) => (req, res, next) =>
  catalog
    .list(pool, type, "")
    .then((rows) => {
      const row = rows.find((x) => x.id === Number(req.params.id));
      if (!row) {
        const e = new Error("Record not found.");
        e.statusCode = 404;
        e.code = "NOT_FOUND";
        throw e;
      }
      send(res, row);
    })
    .catch(next);
export const save = (type) => (req, res, next) =>
  catalog
    .save(pool, type, req.body, req.params.id || null, req.admin.id, req)
    .then((row) => send(res, row))
    .catch(next);
export const remove = (type) => (req, res, next) =>
  catalog
    .softDelete(pool, type, req.params.id, req.admin.id, req)
    .then(() => send(res, { success: true }))
    .catch(next);
export const restore = (type) => (req, res, next) =>
  catalog
    .restore(pool, type, req.params.id, req.admin.id, req)
    .then(() => send(res, { success: true }))
    .catch(next);
export const permanent = (type) => (req, res, next) =>
  catalog
    .permanentDelete(pool, type, req.params.id, req.admin.id, req)
    .then(() => send(res, { success: true }))
    .catch(next);
export const uploadImage = (type) => (req, res, next) =>
  (async () => {
    if (!req.file) {
      const e = new Error("A JPEG, PNG or WebP image is required.");
      e.statusCode = 400;
      e.code = "INVALID_FILE";
      throw e;
    }
    const pathKey = type === "brands" ? "logo_path" : "image_path";
    const [[row]] = await pool.execute(
      `SELECT ${pathKey} FROM ${type} WHERE id=? AND deleted_at IS NULL`,
      [req.params.id],
    );
    if (!row) {
      const e = new Error("Record not found.");
      e.statusCode = 404;
      e.code = "NOT_FOUND";
      throw e;
    }
    const stored = await saveUpload(req.file, type);
    await pool.execute(`UPDATE ${type} SET ${pathKey}=? WHERE id=?`, [
      stored,
      req.params.id,
    ]);
    await catalog.audit(
      pool,
      req.admin.id,
      `${singular(type)}.image_updated`,
      type,
      req.params.id,
      req,
    );
    await removeManagedFile(row[pathKey]);
    return send(res, { path: stored, url: `/${stored}` });
  })().catch(next);
export const removeImage = (type) => (req, res, next) =>
  (async () => {
    const key = type === "brands" ? "logo_path" : "image_path";
    const [[row]] = await pool.execute(
      `SELECT ${key} FROM ${type} WHERE id=? AND deleted_at IS NULL`,
      [req.params.id],
    );
    if (!row) {
      const e = new Error("Record not found.");
      e.statusCode = 404;
      e.code = "NOT_FOUND";
      throw e;
    }
    await pool.execute(`UPDATE ${type} SET ${key}=NULL WHERE id=?`, [
      req.params.id,
    ]);
    await removeManagedFile(row[key]);
    await catalog.audit(
      pool,
      req.admin.id,
      `${singular(type)}.image_removed`,
      type,
      req.params.id,
      req,
    );
    return send(res, { success: true });
  })().catch(next);

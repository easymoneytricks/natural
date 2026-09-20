import { pool } from "../config/database.js";
import * as media from "../services/adminMedia.service.js";
import { pool as database } from "../config/database.js";
import { saveUpload } from "../services/mediaStorage.service.js";

export async function list(req, res, next) {
  try {
    res.json({ data: await media.list(pool, req.query) });
  } catch (error) {
    next(error);
  }
}

export async function upload(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error("A JPEG, PNG or WebP image is required.");
      error.statusCode = 400;
      error.code = "INVALID_FILE";
      throw error;
    }
    const stored = await saveUpload(req.file, "library");
    const altText =
      String(req.body?.altText || "")
        .trim()
        .slice(0, 255) || null;
    const usageType = ["general", "brand", "category", "product"].includes(
      String(req.body?.usageType || "general"),
    )
      ? String(req.body?.usageType || "general")
      : "general";
    const [result] = await database.execute(
      "INSERT INTO media_assets(file_path,alt_text,usage_type,created_by) VALUES(?,?,?,?)",
      [stored, altText, usageType, req.admin.id],
    );
    res.status(201).json({
      data: {
        id: result.insertId,
        type: "unassigned",
        name: stored.split("/").pop(),
        path: stored,
        altText: altText || "",
        usageType,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const altText =
      String(req.body?.altText || "")
        .trim()
        .slice(0, 255) || null;
    const usageType = ["general", "brand", "category", "product"].includes(
      String(req.body?.usageType || "general"),
    )
      ? String(req.body?.usageType || "general")
      : "general";
    const [result] = await database.execute(
      "UPDATE media_assets SET alt_text=?,usage_type=? WHERE id=? AND deleted_at IS NULL",
      [altText, usageType, req.params.id],
    );
    if (!result.affectedRows) {
      const error = new Error("Media asset not found.");
      error.statusCode = 404;
      throw error;
    }
    res.json({ data: { id: Number(req.params.id), altText, usageType } });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    res.json({ data: await media.remove(pool, req.params.id, req.query.type) });
  } catch (error) {
    next(error);
  }
}

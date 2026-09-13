import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { env } from "../config/env.js";
const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const root = path.resolve(
  env.media.root || path.resolve(backendRoot, "storage", "uploads"),
);
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});
export async function saveUpload(file, area) {
  if (!file) return null;
  const ext =
    file.mimetype === "image/png"
      ? ".png"
      : file.mimetype === "image/webp"
        ? ".webp"
        : ".jpg";
  const name = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(root, area);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), file.buffer);
  return `uploads/${area}/${name}`;
}
export async function removeManagedFile(relativePath) {
  if (!relativePath || !relativePath.startsWith("uploads/")) return;
  const target = path.resolve(root, relativePath.replace(/^uploads[\\/]/, ""));
  if (!target.startsWith(root)) return;
  try {
    await fs.unlink(target);
  } catch {}
}

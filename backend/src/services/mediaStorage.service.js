import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
const root = path.resolve(process.cwd(), "storage", "uploads");
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
  const target = path.resolve(process.cwd(), "storage", relativePath);
  if (!target.startsWith(root)) return;
  try {
    await fs.unlink(target);
  } catch {}
}

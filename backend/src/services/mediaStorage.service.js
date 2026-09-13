import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";
import sizeOf from "image-size";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { env } from "../config/env.js";
const execFileAsync = promisify(execFile);
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
const signatures = {
  "image/jpeg": (buffer) =>
    buffer.length > 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff,
  "image/png": (buffer) =>
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  "image/webp": (buffer) =>
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP",
};
export async function validateImage(file) {
  if (!file || !signatures[file.mimetype]?.(file.buffer)) {
    const error = new Error(
      "The uploaded file signature does not match its image type.",
    );
    error.statusCode = 400;
    error.code = "INVALID_IMAGE_SIGNATURE";
    throw error;
  }
  let dimensions;
  try {
    dimensions = sizeOf(file.buffer);
  } catch {
    const error = new Error("The uploaded image could not be decoded.");
    error.statusCode = 400;
    error.code = "INVALID_IMAGE";
    throw error;
  }
  if (
    !dimensions.width ||
    !dimensions.height ||
    dimensions.width > 8000 ||
    dimensions.height > 8000 ||
    dimensions.width * dimensions.height > 40000000
  ) {
    const error = new Error(
      "Image dimensions must be at most 8000×8000 and 40 megapixels.",
    );
    error.statusCode = 400;
    error.code = "IMAGE_DIMENSIONS_TOO_LARGE";
    throw error;
  }
  const scanner = process.env.MEDIA_SCAN_COMMAND;
  if (scanner) {
    const temp = path.join(root, `.scan-${crypto.randomUUID()}`);
    await fs.writeFile(temp, file.buffer);
    try {
      await execFileAsync(scanner, [temp], { timeout: 30000 });
    } catch (error) {
      const scanError = new Error(
        "The uploaded file did not pass the malware scan.",
      );
      scanError.statusCode = 400;
      scanError.code = "MEDIA_SCAN_FAILED";
      throw scanError;
    } finally {
      await fs.rm(temp, { force: true });
    }
  }
  return dimensions;
}
export async function saveUpload(file, area) {
  if (!file) return null;
  await validateImage(file);
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

import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "../src/config/database.js";
import { env } from "../src/config/env.js";

const root = path.resolve(env.media.root || path.resolve("storage", "uploads"));
const remove = process.argv.includes("--delete");
const walk = async (directory) => {
  const entries = await fs
    .readdir(directory, { withFileTypes: true })
    .catch(() => []);
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else files.push(target);
  }
  return files;
};
const normalize = (value) =>
  String(value || "")
    .replaceAll("\\", "/")
    .replace(/^\/+/, "");
const results = await Promise.all([
  pool.query(
    "SELECT logo_path AS file_path FROM brands WHERE logo_path IS NOT NULL",
  ),
  pool.query(
    "SELECT image_path AS file_path FROM categories WHERE image_path IS NOT NULL",
  ),
  pool.query("SELECT file_path FROM product_media WHERE file_path IS NOT NULL"),
  pool.query(
    "SELECT image_path AS file_path FROM order_items WHERE image_path IS NOT NULL",
  ),
]);
const referenced = new Set(
  results.flatMap(([rows]) => rows.map((row) => normalize(row.file_path))),
);
const files = await walk(root);
const orphans = files.filter((file) => {
  const relative = normalize(path.relative(root, file));
  return !referenced.has(normalize(`uploads/${relative}`));
});
for (const file of orphans) if (remove) await fs.rm(file, { force: true });
console.log(
  JSON.stringify(
    {
      root,
      orphanCount: orphans.length,
      deleted: remove,
      files: orphans.map((file) => path.relative(root, file)),
    },
    null,
    2,
  ),
);
await pool.end();

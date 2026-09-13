import "dotenv/config";
import fsp from "node:fs/promises";
import path from "node:path";

const configuredRoot = process.env.BACKUP_DIR;
if (!configuredRoot)
  throw new Error("BACKUP_DIR is required for backup pruning.");
const backupRoot = path.resolve(configuredRoot);
const retentionDays = Math.max(
  7,
  Number(process.env.BACKUP_RETENTION_DAYS || 30),
);
const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
const entries = await fsp.readdir(backupRoot, { withFileTypes: true });
let removed = 0;
for (const entry of entries) {
  if (!entry.isDirectory() || !/^\d{4}-\d{2}-\d{2}T/.test(entry.name)) continue;
  const target = path.join(backupRoot, entry.name);
  const stat = await fsp.stat(target);
  if (stat.mtimeMs < cutoff) {
    await fsp.rm(target, { recursive: true, force: true });
    removed += 1;
  }
}
console.log(
  `Removed ${removed} backup(s) older than ${retentionDays} days from ${backupRoot}.`,
);

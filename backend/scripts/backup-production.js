import "dotenv/config";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { env } from "../src/config/env.js";

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = path.resolve(process.env.BACKUP_DIR || "backups", timestamp);
const mediaRoot = path.resolve(
  env.media.root || path.resolve("storage", "uploads"),
);

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: { ...process.env, MYSQL_PWD: env.db.password },
      ...options,
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with code ${code}`)),
    );
  });
}

await fsp.mkdir(backupRoot, { recursive: true });
const databaseStream = fs.createWriteStream(
  path.join(backupRoot, "database.sql"),
);
await run(
  "mysqldump",
  [
    "--single-transaction",
    "--routines",
    "--triggers",
    "--set-gtid-purged=OFF",
    "--host",
    env.db.host,
    "--port",
    String(env.db.port),
    "--user",
    env.db.user,
    env.db.name,
  ],
  { stdio: ["ignore", databaseStream, "inherit"] },
);
databaseStream.close();
await fsp.cp(mediaRoot, path.join(backupRoot, "uploads"), {
  recursive: true,
  force: true,
});
await fsp.writeFile(
  path.join(backupRoot, "manifest.json"),
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      database: env.db.name,
      mediaRoot,
      restore:
        "Use npm run restore:production -- <backup-directory> with CONFIRM_RESTORE=YES.",
    },
    null,
    2,
  ),
);
console.log(`Backup created at ${backupRoot}`);

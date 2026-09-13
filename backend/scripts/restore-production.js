import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { env } from "../src/config/env.js";

const source = process.argv[2];
if (!source || process.env.CONFIRM_RESTORE !== "YES") {
  console.error(
    "Restore is destructive. Set CONFIRM_RESTORE=YES and pass a backup directory.",
  );
  process.exit(1);
}
const backupRoot = path.resolve(source);
const databaseFile = path.join(backupRoot, "database.sql");
const uploads = path.join(backupRoot, "uploads");
await fs.access(databaseFile);

await new Promise((resolve, reject) => {
  const child = spawn(
    "mysql",
    [
      "--host",
      env.db.host,
      "--port",
      String(env.db.port),
      "--user",
      env.db.user,
      env.db.name,
    ],
    {
      stdio: ["pipe", "inherit", "inherit"],
      env: { ...process.env, MYSQL_PWD: env.db.password },
    },
  );
  fs.readFile(databaseFile)
    .then((sql) => child.stdin.end(sql))
    .catch(reject);
  child.once("error", reject);
  child.once("exit", (code) =>
    code === 0
      ? resolve()
      : reject(new Error(`mysql exited with code ${code}`)),
  );
});

if (await fs.stat(uploads).catch(() => null)) {
  const destination = path.resolve(
    env.media.root || path.resolve("storage", "uploads"),
  );
  await fs.cp(uploads, destination, { recursive: true, force: true });
}
console.log(`Restored database and media from ${backupRoot}`);

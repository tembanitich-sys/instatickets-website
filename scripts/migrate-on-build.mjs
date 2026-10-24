// Runs before every Vercel build: applies any new database migrations, so tables are
// created and updated without anyone running a command by hand. Skipped (not failed)
// when DATABASE_URL is not available, for example on a local build.
import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not set: skipping database migrations.");
  process.exit(0);
}
const result = spawnSync(process.execPath, ["scripts/migrate.mjs"], { stdio: "inherit" });
process.exit(result.status ?? 1);

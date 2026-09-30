import { drizzle } from "drizzle-orm/postgres-js";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import postgres from "postgres";
import * as schema from "./schema";

/** Any Drizzle Postgres database using our schema (Neon in production, PGlite in tests). */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

let cached: Db | null | undefined;

/**
 * Lazily connects using DATABASE_URL. Returns null when it is not set so pages
 * can fall back to defaults instead of failing (for example during a build).
 */
export function getDb(): Db | null {
  if (cached !== undefined) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    cached = null;
    return cached;
  }
  // prepare: false keeps this compatible with pooled (pgbouncer) connection strings.
  const client = postgres(url, { prepare: false, max: 1, idle_timeout: 20, connect_timeout: 10 });
  cached = drizzle(client, { schema });
  return cached;
}

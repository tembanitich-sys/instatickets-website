import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

let ready: Promise<Db> | undefined;

/**
 * In-memory Postgres with the repo's real migrations applied. One instance is
 * created per test file (starting it is slow) and emptied on every call, so each
 * test starts from clean tables.
 */
export async function createTestDb(): Promise<Db> {
  ready ??= (async () => {
    const db = drizzle(new PGlite(), { schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    return db as unknown as Db;
  })();
  const db = await ready;
  await db.execute(
    sql`truncate table site_settings, customer_preregistrations, business_registrations, agent_applications, contact_enquiries, admin_audit`,
  );
  return db;
}

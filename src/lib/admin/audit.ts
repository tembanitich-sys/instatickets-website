import type { Db } from "../db/client";
import { adminAudit } from "../db/schema";

export type AuditAction = "export" | "settings.update" | "login";

type Writer = Pick<Db, "insert">;

/**
 * Records an admin action. `details` says what was done (table, row count, setting
 * key and its old and new value) and must never contain personal data.
 */
export async function writeAudit(db: Writer, action: AuditAction, details: Record<string, unknown> = {}) {
  await db.insert(adminAudit).values({ action, details });
}

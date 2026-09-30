import type { Db } from "../db/client";
import { writeAudit } from "./audit";
import { toCsv } from "./csv";
import { allRows, cellText, type TableDef } from "./tables";

/**
 * Builds the full CSV for a table and records the export. The audit row is written
 * before the file is handed out, so an export can never happen unrecorded: if the
 * audit write fails, this throws and nothing is exported.
 */
export async function exportTable(db: Db, def: TableDef, now: Date) {
  const rows = await allRows(db, def);
  const csv = toCsv(
    def.columns.map((c) => c.header),
    rows.map((row) => def.columns.map((c) => cellText(row[c.key]))),
  );
  await writeAudit(db, "export", { table: def.slug, rows: rows.length });
  return {
    csv,
    rows: rows.length,
    filename: `instatickets-${def.slug}-${now.toISOString().slice(0, 10)}.csv`,
  };
}

import { isAdmin } from "@/lib/admin/auth";
import { exportTable } from "@/lib/admin/export";
import { getTableDef } from "@/lib/admin/tables";
import { getDb } from "@/lib/db/client";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(_request: Request, ctx: RouteContext<"/admin/export/[table]">) {
  // Route handlers must check for themselves; nothing else protects them.
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401, headers: NO_STORE });

  const { table } = await ctx.params;
  const def = getTableDef(table);
  if (!def) return new Response("Not found", { status: 404, headers: NO_STORE });

  const db = getDb();
  if (!db) return new Response("The database is not configured.", { status: 503, headers: NO_STORE });

  try {
    // The export is recorded in the audit log before any data is returned.
    const { csv, filename } = await exportTable(db, def, new Date());
    return new Response(csv, {
      headers: {
        ...NO_STORE,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(`CSV export of ${def.slug} failed.`, error);
    return new Response("The export failed and nothing was exported.", { status: 500, headers: NO_STORE });
  }
}

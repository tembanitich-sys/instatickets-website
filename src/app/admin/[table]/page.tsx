import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell, ExportLink, NoDatabase } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/admin/DataTable";
import { requireAdmin } from "@/lib/admin/auth";
import { PAGE_SIZE, getTableDef, listRows } from "@/lib/admin/tables";
import { getDb } from "@/lib/db/client";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminTablePage(props: PageProps<"/admin/[table]">) {
  await requireAdmin();
  const { table } = await props.params;
  const def = getTableDef(table);
  if (!def || def.slug === "settings") notFound();

  const sp = await props.searchParams;
  const q = first(sp.q).slice(0, 100);
  const page = Math.max(1, Number.parseInt(first(sp.page), 10) || 1);

  const db = getDb();
  const result = db ? await listRows(db, def, { q, page }) : null;

  const href = (p: number) => `/admin/${def.slug}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <AdminShell active={def.slug} title={def.title}>
      {!result ? (
        <NoDatabase />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <form action={`/admin/${def.slug}`} method="get" className="flex flex-wrap items-end gap-2" role="search">
              <div>
                <label htmlFor="q" className="mb-1 block text-sm font-bold text-navy">
                  Search
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={q}
                  maxLength={100}
                  className="min-h-11 w-64 max-w-full rounded-lg border border-line bg-white px-3 text-base"
                />
              </div>
              <button type="submit" className="min-h-11 rounded-full bg-navy px-5 text-sm font-bold text-white hover:bg-navy-deep">
                Search
              </button>
              {q && (
                <Link href={`/admin/${def.slug}`} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-navy underline">
                  Clear
                </Link>
              )}
            </form>
            <ExportLink slug={def.slug}>Export all as CSV</ExportLink>
          </div>

          <p className="mb-3 text-sm text-muted">
            {result.total} {result.total === 1 ? "record" : "records"}
            {q ? ` matching “${q}”` : ""}, newest first
            {result.pages > 1 ? `. Page ${result.page} of ${result.pages} (${PAGE_SIZE} per page).` : "."}
          </p>

          <DataTable columns={def.columns} rows={result.rows} />

          {result.pages > 1 && (
            <nav aria-label="Pages" className="mt-4 flex items-center gap-3 text-sm font-semibold">
              {result.page > 1 && (
                <Link href={href(result.page - 1)} className="inline-flex min-h-11 items-center rounded-full border-2 border-navy px-4 text-navy">
                  Newer
                </Link>
              )}
              {result.page < result.pages && (
                <Link href={href(result.page + 1)} className="inline-flex min-h-11 items-center rounded-full border-2 border-navy px-4 text-navy">
                  Older
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </AdminShell>
  );
}

import Link from "next/link";
import { AdminShell, NoDatabase } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { TABLES, countRows } from "@/lib/admin/tables";
import { getDb } from "@/lib/db/client";

const CARDS = ["customers", "businesses", "enquiries"] as const;

export default async function AdminOverviewPage() {
  await requireAdmin();
  const db = getDb();
  const counts = db ? await Promise.all(CARDS.map((slug) => countRows(db, TABLES[slug]))) : null;

  return (
    <AdminShell active="overview" title="Overview">
      {!counts ? (
        <NoDatabase />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-3">
          {CARDS.map((slug, i) => (
            <li key={slug}>
              <Link href={`/admin/${slug}`} className="block rounded-2xl bg-white p-6 shadow-md hover:shadow-lg">
                <span className="block text-4xl font-extrabold tabular-nums text-navy">{counts[i]}</span>
                <span className="mt-1 block text-sm font-bold text-muted">{TABLES[slug].title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

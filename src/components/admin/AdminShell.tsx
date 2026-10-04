import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Overview", key: "overview" },
  { href: "/admin/customers", label: "Customers", key: "customers" },
  { href: "/admin/businesses", label: "Businesses", key: "businesses" },
  { href: "/admin/agents", label: "Agents", key: "agents" },
  { href: "/admin/enquiries", label: "Enquiries", key: "enquiries" },
  { href: "/admin/settings", label: "Settings", key: "settings" },
  { href: "/admin/audit", label: "Audit log", key: "audit" },
] as const;

/** Frame for signed-in admin pages. Each page must still call requireAdmin() itself. */
export function AdminShell({ active, title, children }: { active: string; title: string; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Image src="/brand/logo-plain.png" alt="InstaTickets" width={1028} height={224} sizes="130px" className="h-7 w-auto" />
          <span className="text-sm font-bold uppercase tracking-widest text-muted">Admin</span>
          <nav aria-label="Admin" className="flex flex-1 flex-wrap gap-1">
            {NAV.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                aria-current={n.key === active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold ${
                  n.key === active ? "bg-navy text-white" : "text-navy hover:bg-mist"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full border-2 border-navy px-4 text-sm font-bold text-navy hover:bg-navy hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </>
  );
}

export function NoDatabase() {
  return (
    <p role="alert" className="rounded-lg border border-red-dark bg-red-50 px-4 py-3 text-sm font-semibold text-red-dark">
      The database is not configured (DATABASE_URL is not set), so there is nothing to show.
    </p>
  );
}

/** Download link for a table's CSV. A real <a> (not next/link): it downloads a file rather than navigating. */
export function ExportLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <a
      href={`/admin/export/${slug}`}
      download
      className="inline-flex min-h-11 items-center rounded-full border-2 border-navy px-5 text-sm font-bold text-navy hover:bg-navy hover:text-white"
    >
      {children}
    </a>
  );
}

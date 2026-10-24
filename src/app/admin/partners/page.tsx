import Link from "next/link";
import { AdminShell, NoDatabase } from "@/components/admin/AdminShell";
import { integrationStatuses, partnerStatuses, partnerTypes, type IntegrationStatus, type PartnerStatus, type PartnerType } from "@content/onboarding";
import { requireAdmin } from "@/lib/admin/auth";
import { getDb } from "@/lib/db/client";
import { listPartners, partnerRef } from "@/lib/partners/service";

const date = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "—");

export default async function AdminPartnersPage() {
  await requireAdmin();
  const db = getDb();
  const rows = db ? await listPartners(db) : null;
  return (
    <AdminShell active="partners" title="Partners">
      {!rows ? (
        <NoDatabase />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Invite-only onboarding for bus operators and event organisers. {rows.length} {rows.length === 1 ? "partner" : "partners"}.
            </p>
            <Link href="/admin/partners/new" className="inline-flex min-h-11 items-center rounded-full bg-red px-5 text-sm font-bold text-white hover:bg-red-dark">
              NEW PARTNER
            </Link>
          </div>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-md">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  {["Reference", "Partner", "Type", "Status", "Integration", "Invited", "Submitted"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono">{partnerRef(p)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/partners/${p.id}`} className="font-semibold text-navy underline">
                        {p.tradingName || p.legalName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{partnerTypes[p.type as PartnerType].label}</td>
                    <td className="px-4 py-3">{partnerStatuses[p.status as PartnerStatus]}</td>
                    <td className="px-4 py-3">{p.type === "bus_operator" ? integrationStatuses[p.integrationStatus as IntegrationStatus] : "—"}</td>
                    <td className="px-4 py-3">{date(p.invitedAt)}</td>
                    <td className="px-4 py-3">{date(p.submittedAt)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-muted">
                      No partners yet. Create the first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  contractSlots,
  eventStatuses,
  integrationStatuses,
  partnerStatuses,
  partnerTypes,
  type EventStatus,
  type IntegrationStatus,
  type PartnerStatus,
  type PartnerType,
} from "@content/onboarding";
import { AdminShell, NoDatabase } from "@/components/admin/AdminShell";
import { BusKycSummary, OrganiserKycSummary } from "@/components/admin/KycSummary";
import { InviteButton, PartnerActions, SandboxForm, SetupForm } from "@/components/admin/PartnerControls";
import { DocumentSlots } from "@/components/partners/DocumentSlots";
import { adminDeleteDocumentAction, adminRecordUploadAction } from "@/app/admin/partners/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { getDb } from "@/lib/db/client";
import { partnerPrefix } from "@/lib/partners/files";
import { parseKyc, partnerChecklist, signedChecklist, type BusKyc, type OrganiserKyc } from "@/lib/partners/kyc";
import {
  eventRef,
  getPartner,
  invitationBlockers,
  listDocuments,
  listEvents,
  partnerRef,
  submissionProblems,
  type AdminAction,
} from "@/lib/partners/service";

const date = (d: Date | null) => (d ? d.toISOString().replace("T", " ").slice(0, 16) : "—");

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-extrabold text-navy">{title}</h2>
      {children}
    </section>
  );
}

export default async function AdminPartnerPage(props: PageProps<"/admin/partners/[id]">) {
  await requireAdmin();
  const db = getDb();
  if (!db) {
    return (
      <AdminShell active="partners" title="Partner">
        <NoDatabase />
      </AdminShell>
    );
  }
  const p = await getPartner(db, (await props.params).id);
  if (!p) notFound();
  const type = p.type as PartnerType;
  const bus = type === "bus_operator";
  const kyc = parseKyc(type, p.kyc);
  const status = p.status as PartnerStatus;
  const docs = await listDocuments(db, p.id);
  const files = docs.filter((d) => !d.eventId).map(({ id, slot, fileName, size }) => ({ id, slot, fileName, size }));
  const events = type === "event_organiser" ? await listEvents(db, p.id) : [];
  const blockers = await invitationBlockers(db, p);
  const outstanding = ["invited", "draft", "changes_requested"].includes(status) ? await submissionProblems(db, p) : [];
  const upload = {
    prefix: partnerPrefix(p.id),
    uploadUrl: "/admin/api/upload",
    downloadBase: "/admin/files",
    record: adminRecordUploadAction.bind(null, p.id),
    remove: adminDeleteDocumentAction,
  };

  const actions: { action: AdminAction; label: string; needsNote?: boolean; tone?: "red" | "navy" }[] = [];
  if (status === "submitted") actions.push({ action: "start_review", label: "START REVIEW" });
  if (["submitted", "under_review"].includes(status)) {
    actions.push({ action: "approve", label: "APPROVE", tone: "red" });
    actions.push({ action: "request_changes", label: "REQUEST CHANGES", needsNote: true });
  }
  if (["submitted", "under_review", "changes_requested"].includes(status)) actions.push({ action: "reject", label: "REJECT", needsNote: true });
  if (status === "approved") actions.push({ action: "suspend", label: "SUSPEND" });
  if (status === "suspended") actions.push({ action: "reinstate", label: "REINSTATE" });
  if (bus && ["submitted", "under_review", "changes_requested", "approved"].includes(status)) {
    actions.push({ action: "resend_integration", label: p.integrationStatus === "not_started" ? "SEND INTEGRATION PACK" : "RESEND INTEGRATION PACK" });
    if (p.integrationStatus === "standard_sent") actions.push({ action: "certified", label: "MARK CERTIFIED" });
    if (status === "approved" && p.integrationStatus === "certified") actions.push({ action: "live", label: "MARK LIVE" });
  }

  return (
    <AdminShell active="partners" title={`${partnerRef(p)} · ${p.tradingName || p.legalName}`}>
      <div className="space-y-6">
        <Link href="/admin/partners" className="text-sm font-semibold text-navy underline">
          All partners
        </Link>

        <Panel title="Status">
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            {(
              [
                ["Type", partnerTypes[type].label],
                ["Status", partnerStatuses[status]],
                ["Integration", bus ? integrationStatuses[p.integrationStatus as IntegrationStatus] : "—"],
                ["Invited", date(p.invitedAt)],
                ["Submitted", date(p.submittedAt)],
                ["Approved", date(p.approvedAt)],
                ["Integration Standard sent", date(p.integrationSentAt)],
                ["Reminders sent", String(p.remindersSent)],
                ["Anchor Addendum", p.anchorAddendum ? "Yes" : "No"],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="font-semibold text-muted">{k}</dt>
                <dd className="font-bold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          {p.reviewNote && <p className="mt-4 whitespace-pre-line rounded-xl bg-mist p-3 text-sm">Last note: {p.reviewNote}</p>}
          <div className="mt-5">
            <PartnerActions partnerId={p.id} actions={actions} />
          </div>
          {status === "approved" || status === "submitted" || status === "under_review" ? (
            <p className="mt-3 text-sm text-muted">
              Approving needs the executed (countersigned) agreement uploaded under Contract documents.
            </p>
          ) : null}
        </Panel>

        {["created", "invited", "draft"].includes(status) && (
          <Panel title={status === "created" ? "Send the invitation" : "Invitation"}>
            <InviteButton partnerId={p.id} label={status === "created" ? "SEND INVITATION" : "SEND A NEW SIGN-IN LINK"} blockers={blockers} />
            {outstanding.length > 0 && status !== "created" && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-semibold text-navy">Still outstanding before the partner can submit ({outstanding.length})</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                  {outstanding.map((x) => (
                    <li key={x.path + x.message}>{x.message}</li>
                  ))}
                </ul>
              </details>
            )}
          </Panel>
        )}

        {bus && (
          <Panel title="Sandbox access">
            <SandboxForm partnerId={p.id} initial={p.sandboxCredentials ?? ""} />
          </Panel>
        )}

        <Panel title="Contract documents">
          <DocumentSlots
            slots={[
              ...(bus
                ? [
                    { slot: contractSlots.orderForm.slot, label: `${contractSlots.orderForm.label}: tailored to this operator`, multiple: false },
                    ...(p.anchorAddendum ? [{ slot: contractSlots.addendum.slot, label: contractSlots.addendum.label, multiple: false }] : []),
                  ]
                : []),
              ...signedChecklist(type, { anchorAddendum: p.anchorAddendum }),
              { slot: contractSlots.executed.slot, label: contractSlots.executed.label, multiple: true },
            ]}
            docs={files}
            editable
            {...upload}
          />
          <p className="mt-3 text-sm text-muted">The Master Terms are shared by every partner: manage them under Partner documents.</p>
        </Panel>

        {events.length > 0 && (
          <Panel title="Events">
            <ul className="divide-y divide-line text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap justify-between gap-2 py-3">
                  <Link href={`/admin/partners/${p.id}/events/${e.id}`} className="font-semibold text-navy underline">
                    {eventRef(p, e)} · {e.name || "Untitled"}
                  </Link>
                  <span>{eventStatuses[e.status as EventStatus]}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel title="Submitted details">
          {bus ? <BusKycSummary k={kyc as BusKyc} now={new Date()} /> : <OrganiserKycSummary k={kyc as OrganiserKyc} now={new Date()} />}
        </Panel>

        <Panel title="Supporting documents">
          <p className="mb-2 text-sm text-muted">You can upload a document on the partner&apos;s behalf if they sent it another way.</p>
          <DocumentSlots slots={partnerChecklist(type, kyc, { anchorAddendum: p.anchorAddendum })} docs={files} editable {...upload} />
        </Panel>

        <Panel title="Contact on file">
          <SetupForm
            partnerId={p.id}
            bus={bus}
            initial={{
              contactName: p.contactName,
              contactEmail: p.contactEmail,
              contactPhone: p.contactPhone ?? "",
              anchorAddendum: p.anchorAddendum,
              groupName: p.groupName ?? "",
            }}
          />
        </Panel>
      </div>
    </AdminShell>
  );
}

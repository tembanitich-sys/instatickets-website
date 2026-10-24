import Link from "next/link";
import { notFound } from "next/navigation";
import { contractSlots, eventStatuses, type EventStatus } from "@content/onboarding";
import { AdminShell, NoDatabase } from "@/components/admin/AdminShell";
import { EventSummary } from "@/components/admin/KycSummary";
import { EventActions } from "@/components/admin/PartnerControls";
import { DocumentSlots } from "@/components/partners/DocumentSlots";
import { adminDeleteDocumentAction, adminRecordUploadAction } from "@/app/admin/partners/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { getDb } from "@/lib/db/client";
import { partnerPrefix } from "@/lib/partners/files";
import { eventChecklist, eventDataSchema } from "@/lib/partners/kyc";
import { eventRef, getEvent, getPartner, listDocuments, type EventAction } from "@/lib/partners/service";

export default async function AdminEventPage(props: PageProps<"/admin/partners/[id]/events/[eventId]">) {
  await requireAdmin();
  const db = getDb();
  if (!db) {
    return (
      <AdminShell active="partners" title="Event">
        <NoDatabase />
      </AdminShell>
    );
  }
  const { id, eventId } = await props.params;
  const p = await getPartner(db, id);
  const e = p ? await getEvent(db, p.id, eventId) : null;
  if (!p || !e) notFound();
  const data = eventDataSchema.parse(e.data ?? {});
  const status = e.status as EventStatus;
  const files = (await listDocuments(db, p.id))
    .filter((d) => d.eventId === e.id)
    .map(({ id: docId, slot, fileName, size }) => ({ id: docId, slot, fileName, size }));
  const actions: { action: EventAction; label: string; needsNote?: boolean; tone?: "red" | "navy" }[] = [];
  if (status === "submitted") actions.push({ action: "start_review", label: "START REVIEW" });
  if (["submitted", "under_review"].includes(status)) actions.push({ action: "send_order_form", label: "SEND EVENT ORDER FORM", tone: "red" });
  if (status === "order_form_sent") actions.push({ action: "approve", label: "APPROVE FOR SALE", tone: "red" });
  if (["submitted", "under_review", "order_form_sent"].includes(status)) actions.push({ action: "request_changes", label: "REQUEST CHANGES", needsNote: true });
  if (["submitted", "under_review", "changes_requested", "order_form_sent"].includes(status)) actions.push({ action: "reject", label: "REJECT", needsNote: true });
  const upload = {
    prefix: partnerPrefix(p.id),
    uploadUrl: "/admin/api/upload",
    downloadBase: "/admin/files",
    eventId: e.id,
    record: adminRecordUploadAction.bind(null, p.id),
    remove: adminDeleteDocumentAction,
  };
  return (
    <AdminShell active="partners" title={`${eventRef(p, e)} · ${e.name || "Untitled event"}`}>
      <div className="space-y-6">
        <Link href={`/admin/partners/${p.id}`} className="text-sm font-semibold text-navy underline">
          Back to {p.tradingName || p.legalName}
        </Link>
        <section className="rounded-3xl bg-white p-6 shadow-md">
          <p className="text-sm">
            Status: <strong>{eventStatuses[status]}</strong>
          </p>
          {e.reviewNote && <p className="mt-2 whitespace-pre-line rounded-xl bg-mist p-3 text-sm">Last note: {e.reviewNote}</p>}
          <div className="mt-4">
            <EventActions partnerId={p.id} eventId={e.id} actions={actions} />
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-2 text-lg font-extrabold text-navy">Event Order Form</h2>
          <p className="mb-2 text-sm text-muted">
            Upload the Event Order Form (fees, settlement release, reserve), then send it. Approve once the organiser has uploaded the signed copy
            and you have uploaded the executed one.
          </p>
          <DocumentSlots
            slots={[
              { slot: contractSlots.eventOrderForm.slot, label: contractSlots.eventOrderForm.label, multiple: false },
              { slot: contractSlots.signedEventOrderForm.slot, label: contractSlots.signedEventOrderForm.label, multiple: false },
              { slot: contractSlots.executedEventOrderForm.slot, label: contractSlots.executedEventOrderForm.label, multiple: false },
            ]}
            docs={files}
            editable
            {...upload}
          />
        </section>
        <EventSummary e={data} />
        <section className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-2 text-lg font-extrabold text-navy">Event documents</h2>
          <DocumentSlots slots={eventChecklist(data)} docs={files} editable {...upload} />
        </section>
      </div>
    </AdminShell>
  );
}

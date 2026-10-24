import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contractSlots, eventStatuses, portal, type EventStatus } from "@content/onboarding";
import { Card } from "@/components/partners/kit";
import { DocumentSlots } from "@/components/partners/DocumentSlots";
import { EventForm } from "@/components/partners/EventForm";
import { FileLinks, StatusPanel } from "@/components/partners/Status";
import { requirePartner } from "@/lib/partners/auth";
import { partnerDeps } from "@/lib/partners/deps";
import { partnerPrefix } from "@/lib/partners/files";
import { eventChecklist, eventDataSchema } from "@/lib/partners/kyc";
import { eventRef, getEvent, isEventEditable, listDocuments } from "@/lib/partners/service";
import { deleteDocumentAction, recordUploadAction, saveEventAction, submitEventAction } from "../../actions";

export const metadata: Metadata = { title: "Event" };

export default async function PartnerEventPage(props: PageProps<"/partner/events/[id]">) {
  const partner = await requirePartner();
  const deps = partnerDeps()!;
  const { id } = await props.params;
  const event = await getEvent(deps.db, partner.id, id);
  if (!event) notFound();
  const data = eventDataSchema.parse(event.data ?? {});
  const editable = isEventEditable(event);
  const status = event.status as EventStatus;
  const docs = (await listDocuments(deps.db, partner.id)).filter((d) => d.eventId === event.id);
  const files = docs.filter((d) => d.source === "partner").map(({ id, slot, fileName, size }) => ({ id, slot, fileName, size }));
  const fromBullion = (slot: string, label: string) =>
    docs.filter((d) => d.source === "bullion" && d.slot === slot).map((d) => ({ id: d.id, label, fileName: d.fileName }));
  const orderForm = fromBullion(contractSlots.eventOrderForm.slot, contractSlots.eventOrderForm.label);
  const executed = fromBullion(contractSlots.executedEventOrderForm.slot, contractSlots.executedEventOrderForm.label);
  const upload = { prefix: partnerPrefix(partner.id), uploadUrl: "/partner/api/upload", downloadBase: "/partner/files", eventId: event.id };
  const save = saveEventAction.bind(null, event.id);
  const submit = submitEventAction.bind(null, event.id);

  return (
    <div className="space-y-6">
      <Link href="/partner" className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline">
        Back to your onboarding
      </Link>
      <StatusPanel
        title={event.name || "New event"}
        kind={status === "approved" ? "good" : status === "changes_requested" || status === "order_form_sent" ? "warn" : "info"}
        note={
          status === "changes_requested"
            ? `${portal.dashboard.changesRequested}\n${event.reviewNote ?? ""}`
            : status === "order_form_sent"
              ? "Your Event Order Form is ready. Download it below, sign it and upload the signed copy."
              : null
        }
        facts={[
          [portal.dashboard.reference, eventRef(partner, event)],
          [portal.dashboard.statusLabel, eventStatuses[status]],
        ]}
      />
      <EventForm initial={data as unknown as Record<string, unknown>} editable={editable} save={save} submit={submit}>
        <Card title={portal.sections.documents} intro={portal.sections.documentsIntro}>
          <DocumentSlots slots={eventChecklist(data)} docs={files} editable={editable} record={recordUploadAction} remove={deleteDocumentAction} {...upload} />
        </Card>
        {(orderForm.length > 0 || executed.length > 0) && (
          <Card title={contractSlots.eventOrderForm.label}>
            <FileLinks files={orderForm} base="/partner/files" />
            <DocumentSlots
              slots={[{ slot: contractSlots.signedEventOrderForm.slot, label: contractSlots.signedEventOrderForm.label, multiple: false }]}
              docs={files}
              editable={status === "order_form_sent"}
              record={recordUploadAction}
              remove={deleteDocumentAction}
              {...upload}
            />
            <FileLinks files={executed} base="/partner/files" />
          </Card>
        )}
      </EventForm>
    </div>
  );
}

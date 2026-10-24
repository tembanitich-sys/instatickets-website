import type { Metadata } from "next";
import Link from "next/link";
import {
  contractSlots,
  eventStatuses,
  integrationStatuses,
  partnerStatuses,
  partnerTypes,
  portal,
  type EventStatus,
  type IntegrationStatus,
  type PartnerStatus,
  type PartnerType,
} from "@content/onboarding";
import { Card } from "@/components/partners/kit";
import { DocumentSlots } from "@/components/partners/DocumentSlots";
import { KycForm } from "@/components/partners/KycForm";
import { FileLinks, StatusPanel } from "@/components/partners/Status";
import { requirePartner } from "@/lib/partners/auth";
import { partnerDeps } from "@/lib/partners/deps";
import { partnerPrefix } from "@/lib/partners/files";
import { parseKyc, partnerChecklist, signedChecklist } from "@/lib/partners/kyc";
import { eventRef, isEditable, libraryDocument, listDocuments, listEvents, partnerRef } from "@/lib/partners/service";
import { createEventAction, deleteDocumentAction, recordUploadAction, saveKycAction, submitKycAction } from "./actions";

export const metadata: Metadata = { title: "Your onboarding" };

export default async function PartnerDashboard() {
  const partner = await requirePartner();
  const deps = partnerDeps()!;
  const type = partner.type as PartnerType;
  const bus = type === "bus_operator";
  const kyc = parseKyc(type, partner.kyc);
  const editable = isEditable(partner);
  const docs = await listDocuments(deps.db, partner.id);
  const own = docs.filter((d) => !d.eventId);
  const partnerFiles = own.filter((d) => d.source === "partner").map(({ id, slot, fileName, size }) => ({ id, slot, fileName, size }));
  const bullion = (slot: string) => own.filter((d) => d.source === "bullion" && d.slot === slot);
  const master = await libraryDocument(deps.db, bus ? contractSlots.busMasterTerms.slot : contractSlots.organiserMasterTerms.slot);

  const toSign = [
    ...(master ? [{ id: master.id, label: bus ? contractSlots.busMasterTerms.label : contractSlots.organiserMasterTerms.label, fileName: master.fileName }] : []),
    ...bullion(contractSlots.orderForm.slot).map((d) => ({ id: d.id, label: contractSlots.orderForm.label, fileName: d.fileName })),
    ...bullion(contractSlots.addendum.slot).map((d) => ({ id: d.id, label: contractSlots.addendum.label, fileName: d.fileName })),
  ];
  const executed = bullion(contractSlots.executed.slot).map((d) => ({ id: d.id, label: contractSlots.executed.label, fileName: d.fileName }));
  const events = type === "event_organiser" ? await listEvents(deps.db, partner.id) : [];

  const status = partner.status as PartnerStatus;
  const kind = status === "approved" ? "good" : status === "changes_requested" ? "warn" : "info";
  const note =
    status === "changes_requested"
      ? `${portal.dashboard.changesRequested}\n${partner.reviewNote ?? ""}`
      : status === "approved"
        ? portal.dashboard.approvedNote
        : ["submitted", "under_review"].includes(status)
          ? portal.dashboard.submittedNote
          : null;

  const upload = { prefix: partnerPrefix(partner.id), uploadUrl: "/partner/api/upload", downloadBase: "/partner/files" };

  return (
    <div className="space-y-6">
      <StatusPanel
        title={partner.tradingName || partner.legalName}
        kind={kind}
        note={note}
        facts={[
          [portal.dashboard.reference, partnerRef(partner)],
          [portal.dashboard.statusLabel, partnerStatuses[status]],
          ...(bus ? ([[portal.dashboard.integrationLabel, integrationStatuses[partner.integrationStatus as IntegrationStatus]]] as [string, string][]) : []),
          ["Type", partnerTypes[type].label],
        ]}
      />

      {type === "event_organiser" && (
        <Card title={portal.sections.events} intro={portal.sections.eventsIntro}>
          {events.length > 0 && (
            <ul className="divide-y divide-line">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <Link href={`/partner/events/${e.id}`} className="font-semibold text-navy underline">
                    {e.name || "Untitled event"}
                  </Link>
                  <span className="text-sm text-muted">
                    {eventRef(partner, e)} · {eventStatuses[e.status as EventStatus]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {status === "approved" ? (
            <form action={createEventAction}>
              <button type="submit" className="inline-flex min-h-11 items-center rounded-full bg-red px-5 text-sm font-bold text-white hover:bg-red-dark">
                {portal.newEvent}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted">{portal.eventsLocked}</p>
          )}
        </Card>
      )}

      <KycForm type={type} initial={kyc as unknown as Record<string, unknown>} editable={editable} save={saveKycAction} submit={submitKycAction}>
        <Card title={portal.sections.documents} intro={`${portal.sections.documentsIntro} The bank letters listed follow the currencies you have saved.`}>
          <DocumentSlots
            slots={partnerChecklist(type, kyc, { anchorAddendum: partner.anchorAddendum })}
            docs={partnerFiles}
            editable={editable}
            record={recordUploadAction}
            remove={deleteDocumentAction}
            {...upload}
          />
        </Card>
        <Card title={portal.sections.contract} intro={portal.sections.contractIntro}>
          <FileLinks files={toSign} base="/partner/files" />
          <DocumentSlots
            slots={signedChecklist(type, { anchorAddendum: partner.anchorAddendum })}
            docs={partnerFiles}
            editable={editable}
            record={recordUploadAction}
            remove={deleteDocumentAction}
            {...upload}
          />
          {executed.length > 0 && <FileLinks files={executed} base="/partner/files" />}
        </Card>
        {!editable && <p className="text-sm text-muted">{portal.dashboard.lockedNote}</p>}
      </KycForm>
    </div>
  );
}

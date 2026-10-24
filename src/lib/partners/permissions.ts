import { busSlots, contractSlots, eventSlots, organiserSlots, type PartnerType } from "@content/onboarding";
import type { Db } from "../db/client";
import { allowedPartnerSlots, eventChecklist, eventDataSchema, parseKyc } from "./kyc";
import { getEvent, isEditable, isEventEditable, type Partner, type PartnerDocument } from "./service";

const MULTIPLE = new Set([...busSlots, ...organiserSlots, ...eventSlots].filter((s) => s.multiple).map((s) => s.slot));

/** Whether the partner may upload into (or delete from) a slot right now, and whether it holds several files. */
export async function partnerMayUpload(
  db: Db,
  partner: Partner,
  slot: string,
  eventId: string | null,
): Promise<{ ok: boolean; multiple: boolean }> {
  if (eventId) {
    const event = await getEvent(db, partner.id, eventId);
    if (!event) return { ok: false, multiple: false };
    if (slot === contractSlots.signedEventOrderForm.slot) return { ok: event.status === "order_form_sent", multiple: false };
    const def = eventChecklist(eventDataSchema.parse(event.data ?? {})).find((s) => s.slot === slot);
    return { ok: !!def && isEventEditable(event), multiple: !!def?.multiple };
  }
  if (!isEditable(partner)) return { ok: false, multiple: false };
  const type = partner.type as PartnerType;
  const allowed = allowedPartnerSlots(type, parseKyc(type, partner.kyc), partner.anchorAddendum);
  return { ok: allowed.has(slot), multiple: MULTIPLE.has(slot) };
}

/** Whether the partner may download a file: its own files, and the library documents meant for it. */
export function partnerMayDownload(partner: Partner, doc: PartnerDocument): boolean {
  if (doc.partnerId) return doc.partnerId === partner.id;
  const bus = partner.type === "bus_operator";
  if (doc.slot === contractSlots.busMasterTerms.slot) return bus;
  if (doc.slot === contractSlots.integrationStandard.slot) return bus;
  if (doc.slot === contractSlots.organiserMasterTerms.slot) return !bus;
  return false;
}

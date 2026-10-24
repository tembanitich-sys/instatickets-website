import { busSlots, contractSlots, eventSlots, librarySlots, organiserSlots } from "@content/onboarding";
import { CURRENCY_CODES } from "@content/onboarding";

/** Slots an admin may upload into: library documents, contract documents, and any checklist slot on a partner's behalf. */
export function adminMayUpload(target: { partnerId: string | null; eventId: string | null; slot: string; partnerType?: string }) {
  const { partnerId, eventId, slot } = target;
  if (!partnerId) return { ok: librarySlots.some((l) => l.slot === slot), multiple: false };
  if (eventId) {
    const contract = [contractSlots.eventOrderForm.slot, contractSlots.executedEventOrderForm.slot, contractSlots.signedEventOrderForm.slot];
    const def = eventSlots.find((d) => d.slot === slot);
    return { ok: contract.includes(slot as (typeof contract)[number]) || !!def, multiple: !!def?.multiple };
  }
  const contract = [
    contractSlots.orderForm.slot,
    contractSlots.addendum.slot,
    contractSlots.executed.slot,
    contractSlots.signedMaster.slot,
    contractSlots.signedOrderForm.slot,
    contractSlots.signedAddendum.slot,
  ];
  if ((contract as string[]).includes(slot)) return { ok: true, multiple: slot === contractSlots.executed.slot };
  const defs = target.partnerType === "event_organiser" ? organiserSlots : busSlots;
  const def = defs.find((d) => (d.perCurrency ? CURRENCY_CODES.some((c) => slot === `${d.slot}:${c}`) : d.slot === slot));
  return { ok: !!def, multiple: !!def?.multiple };
}

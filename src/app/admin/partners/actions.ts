"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { adminMayUpload } from "@/lib/partners/admin-slots";
import { partnerDeps } from "@/lib/partners/deps";
import {
  adminAction,
  adminEventAction,
  createPartner,
  getDocument,
  getPartner,
  PartnerError,
  partnerRef,
  recordDocument,
  removeDocument,
  sendInvitation,
  updatePartnerSetup,
  type AdminAction,
  type EventAction,
} from "@/lib/partners/service";

export type AdminResult = { ok: true; message?: string } | { ok: false; message: string };

const unavailable: AdminResult = { ok: false, message: "The database is not configured." };

async function guard(run: () => Promise<AdminResult>): Promise<AdminResult> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof PartnerError) return { ok: false, message: error.message };
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Admin partner action failed.", error);
    return { ok: false, message: "Something went wrong. Check the logs and try again." };
  }
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};

export async function createPartnerAction(_prev: AdminResult | null, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  let id = "";
  const result = await guard(async () => {
    const created = await createPartner(deps, {
      type: str(fd, "type") === "event_organiser" ? "event_organiser" : "bus_operator",
      legalName: str(fd, "legalName"),
      tradingName: str(fd, "tradingName"),
      groupName: str(fd, "groupName"),
      anchorAddendum: fd.get("anchorAddendum") !== null,
      organiserType: str(fd, "organiserType"),
      contactName: str(fd, "contactName"),
      contactEmail: str(fd, "contactEmail"),
      contactPhone: str(fd, "contactPhone"),
    });
    if (!created.ok) return { ok: false, message: created.problems.join(" ") };
    id = created.partner.id;
    return { ok: true };
  });
  if (result.ok) redirect(`/admin/partners/${id}`);
  return result;
}

export async function updateSetupAction(partnerId: string, _prev: AdminResult | null, fd: FormData): Promise<AdminResult> {
  await requireAdmin();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    const r = await updatePartnerSetup(deps, partnerId, {
      contactName: str(fd, "contactName"),
      contactEmail: str(fd, "contactEmail"),
      contactPhone: str(fd, "contactPhone"),
      anchorAddendum: fd.get("anchorAddendum") !== null,
      groupName: str(fd, "groupName"),
    });
    revalidatePath(`/admin/partners/${partnerId}`);
    return r.ok ? { ok: true, message: "Saved." } : { ok: false, message: r.problems.join(" ") };
  });
}

export async function inviteAction(partnerId: string): Promise<AdminResult> {
  await requireAdmin();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    const r = await sendInvitation(deps, partnerId);
    revalidatePath(`/admin/partners/${partnerId}`);
    return r.ok ? { ok: true, message: "Invitation sent." } : { ok: false, message: r.problems.join(" ") };
  });
}

export async function partnerAction(partnerId: string, action: AdminAction, note: string): Promise<AdminResult> {
  await requireAdmin();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    await adminAction(deps, partnerId, action, note);
    revalidatePath(`/admin/partners/${partnerId}`);
    return { ok: true, message: "Done." };
  });
}

export async function eventAction(partnerId: string, eventId: string, action: EventAction, note: string): Promise<AdminResult> {
  await requireAdmin();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    await adminEventAction(deps, partnerId, eventId, action, note);
    revalidatePath(`/admin/partners/${partnerId}/events/${eventId}`);
    return { ok: true, message: "Done." };
  });
}

export async function adminRecordUploadAction(
  partnerId: string | null,
  input: { slot: string; eventId: string | null; pathname: string; fileName: string },
): Promise<AdminResult> {
  await requireAdmin();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    const partner = partnerId ? await getPartner(deps.db, partnerId) : null;
    if (partnerId && !partner) throw new PartnerError("Partner not found.");
    const may = adminMayUpload({ partnerId, eventId: input.eventId, slot: input.slot, partnerType: partner?.type });
    if (!may.ok) throw new PartnerError("Not an upload slot.");
    await recordDocument(deps, { partnerId, eventId: input.eventId, slot: input.slot, source: "bullion", pathname: input.pathname, fileName: input.fileName, multiple: may.multiple });
    await writeAudit(deps.db, "partner.document.upload", { ref: partner ? partnerRef(partner) : "library", slot: input.slot });
    revalidatePath("/admin", "layout");
    return { ok: true };
  });
}

export async function adminDeleteDocumentAction(documentId: string): Promise<AdminResult> {
  await requireAdmin();
  const deps = partnerDeps();
  if (!deps) return unavailable;
  return guard(async () => {
    const doc = await getDocument(deps.db, documentId);
    if (!doc) throw new PartnerError("Document not found.");
    const partner = doc.partnerId ? await getPartner(deps.db, doc.partnerId) : null;
    await removeDocument(deps, doc);
    await writeAudit(deps.db, "partner.document.delete", { ref: partner ? partnerRef(partner) : "library", slot: doc.slot });
    revalidatePath("/admin", "layout");
    return { ok: true };
  });
}

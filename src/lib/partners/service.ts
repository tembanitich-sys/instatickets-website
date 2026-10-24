import { and, asc, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm";
import { z } from "zod";
import {
  contractSlots,
  currencyShort,
  eventStatuses,
  partnerEmails as pe,
  partnerStatuses,
  partnerTypes,
  UPLOAD_MAX_BYTES,
  UPLOAD_TYPES,
  type EventStatus,
  type PartnerStatus,
  type PartnerType,
} from "@content/onboarding";
import { writeAudit, type AuditAction } from "../admin/audit";
import type { Db } from "../db/client";
import { partnerDocuments, partnerEvents, partners, partnerSignInTokens } from "../db/schema";
import { OPERATOR_MAIL, type EmailMessage, type Notifier } from "../email";
import type { SheetAppender } from "../sheets";
import { libraryPrefix, partnerPrefix, readAll, type FileStore } from "./files";
import {
  busCurrencies,
  checkBusKyc,
  checkEvent,
  checkOrganiserKyc,
  eventChecklist,
  eventDataSchema,
  missingDocuments,
  normalisePhone,
  parseKyc,
  partnerChecklist,
  signedChecklist,
  type BusKyc,
  type OrganiserKyc,
  type Problem,
} from "./kyc";
import { hashToken, INVITE_TTL_MS, newSignInToken, SIGN_IN_TTL_MS } from "./tokens";

export type PartnerDeps = {
  db: Db;
  files: FileStore;
  notify: Notifier;
  sheet: SheetAppender;
  log: Pick<Console, "error">;
  now: () => Date;
  /** Base address of the portal, for links in emails (https://operators.instatickets.co.zw). */
  portalUrl: string;
  /** Base address of the admin area, for links in team emails. */
  adminUrl: string;
};

export type Partner = typeof partners.$inferSelect;
export type PartnerEvent = typeof partnerEvents.$inferSelect;
export type PartnerDocument = typeof partnerDocuments.$inferSelect;

export class PartnerError extends Error {}

const pad = (n: number, width: number) => String(n).padStart(width, "0");
export const partnerRef = (p: Pick<Partner, "type" | "typeSeq">) =>
  `${partnerTypes[p.type as PartnerType].prefix}-${pad(p.typeSeq, 4)}`;
export const eventRef = (p: Pick<Partner, "type" | "typeSeq">, e: Pick<PartnerEvent, "seq">) => `${partnerRef(p)}-E${pad(e.seq, 2)}`;

const EDITABLE: PartnerStatus[] = ["invited", "draft", "changes_requested"];
export const isEditable = (p: Pick<Partner, "status">) => EDITABLE.includes(p.status as PartnerStatus);
const EVENT_EDITABLE: EventStatus[] = ["draft", "changes_requested"];
export const isEventEditable = (e: Pick<PartnerEvent, "status">) => EVENT_EDITABLE.includes(e.status as EventStatus);

const body = (lines: readonly string[]) => [...lines, ...pe.signature].join("\n");

/** Follow-ups never fail the action that triggered them; failures are logged. */
async function quietly(deps: PartnerDeps, what: string, run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    deps.log.error(`${what} failed.`, error);
  }
}

async function audit(deps: PartnerDeps, action: AuditAction, details: Record<string, unknown>) {
  await quietly(deps, "Audit log", () => writeAudit(deps.db, action, details));
}

// --- Reading ------------------------------------------------------------------

export async function getPartner(db: Db, id: string): Promise<Partner | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [row] = await db.select().from(partners).where(eq(partners.id, id));
  return row ?? null;
}

export async function getEvent(db: Db, partnerId: string, eventId: string): Promise<PartnerEvent | null> {
  if (!z.uuid().safeParse(eventId).success) return null;
  const [row] = await db
    .select()
    .from(partnerEvents)
    .where(and(eq(partnerEvents.id, eventId), eq(partnerEvents.partnerId, partnerId)));
  return row ?? null;
}

export const listPartners = (db: Db) => db.select().from(partners).orderBy(desc(partners.createdAt));
export const listEvents = (db: Db, partnerId: string) =>
  db.select().from(partnerEvents).where(eq(partnerEvents.partnerId, partnerId)).orderBy(desc(partnerEvents.seq));
export const listDocuments = (db: Db, partnerId: string) =>
  db.select().from(partnerDocuments).where(eq(partnerDocuments.partnerId, partnerId)).orderBy(asc(partnerDocuments.createdAt));
export const listLibrary = (db: Db) =>
  db.select().from(partnerDocuments).where(isNull(partnerDocuments.partnerId)).orderBy(desc(partnerDocuments.createdAt));

export async function getDocument(db: Db, id: string): Promise<PartnerDocument | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [row] = await db.select().from(partnerDocuments).where(eq(partnerDocuments.id, id));
  return row ?? null;
}

/** The current library file for a slot (master terms, Integration Standard). */
export async function libraryDocument(db: Db, slot: string): Promise<PartnerDocument | null> {
  const [row] = await db
    .select()
    .from(partnerDocuments)
    .where(and(isNull(partnerDocuments.partnerId), eq(partnerDocuments.slot, slot)))
    .orderBy(desc(partnerDocuments.createdAt))
    .limit(1);
  return row ?? null;
}

const masterSlot = (type: PartnerType) =>
  type === "bus_operator" ? contractSlots.busMasterTerms.slot : contractSlots.organiserMasterTerms.slot;

// --- Creating and inviting (admin) ---------------------------------------------

const createInput = z.object({
  type: z.enum(["bus_operator", "event_organiser"]),
  legalName: z.string().trim().min(1, "Enter the registered name.").max(200),
  tradingName: z.string().trim().max(200).transform((v) => v || null),
  groupName: z.string().trim().max(100).transform((v) => v || null),
  anchorAddendum: z.boolean(),
  organiserType: z.string().trim().max(20).transform((v) => v || null),
  contactName: z.string().trim().min(1, "Enter the contact's name.").max(150),
  contactEmail: z.email("Enter a valid email address.").trim().toLowerCase().max(254),
  contactPhone: z.string().trim().max(40),
});
export type CreatePartnerInput = z.input<typeof createInput>;

export async function createPartner(deps: PartnerDeps, input: CreatePartnerInput) {
  const parsed = createInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, problems: parsed.error.issues.map((i) => i.message) };
  const d = parsed.data;
  const phone = d.contactPhone ? normalisePhone(d.contactPhone) : null;
  if (d.contactPhone && !phone) return { ok: false as const, problems: ["Enter a valid phone number for the contact."] };
  const now = deps.now();
  const bus = d.type === "bus_operator";
  const kyc =
    d.type === "bus_operator"
      ? { company: { legalName: d.legalName, tradingName: d.tradingName ?? "" }, contacts: { finance: { name: d.contactName, email: d.contactEmail, phone: phone ?? "" } } }
      : { company: { legalName: d.legalName, tradingName: d.tradingName ?? "", organiserType: d.organiserType ?? "" }, contacts: { main: { name: d.contactName, email: d.contactEmail, phone: phone ?? "" } } };
  const row = await deps.db.transaction(async (tx) => {
    const [{ next }] = await tx
      .select({ next: sql<number>`coalesce(max(${partners.typeSeq}), 0) + 1` })
      .from(partners)
      .where(eq(partners.type, d.type));
    const [created] = await tx
      .insert(partners)
      .values({
        type: d.type,
        typeSeq: Number(next),
        legalName: d.legalName,
        tradingName: d.tradingName,
        groupName: bus ? d.groupName : null,
        anchorAddendum: bus && d.anchorAddendum,
        organiserType: bus ? null : d.organiserType,
        contactName: d.contactName,
        contactEmail: d.contactEmail,
        contactPhone: phone,
        kyc,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  });
  await audit(deps, "partner.create", { ref: partnerRef(row) });
  await syncPartnerRow(deps, row);
  return { ok: true as const, partner: row };
}

/** What still blocks the invitation (contract documents Bullion must upload first). */
export async function invitationBlockers(db: Db, p: Partner): Promise<string[]> {
  const blockers: string[] = [];
  const type = p.type as PartnerType;
  if (!(await libraryDocument(db, masterSlot(type)))) {
    blockers.push(`Upload the ${type === "bus_operator" ? contractSlots.busMasterTerms.label : contractSlots.organiserMasterTerms.label} in Partner documents.`);
  }
  if (type === "bus_operator") {
    const docs = await listDocuments(db, p.id);
    if (!docs.some((d) => d.slot === contractSlots.orderForm.slot)) blockers.push(`Upload this operator's ${contractSlots.orderForm.label}.`);
    if (p.anchorAddendum && !docs.some((d) => d.slot === contractSlots.addendum.slot)) {
      blockers.push(`Upload this operator's ${contractSlots.addendum.label}.`);
    }
  }
  return blockers;
}

async function issueLink(deps: PartnerDeps, partnerId: string, ttlMs: number) {
  const { token, hash } = newSignInToken();
  await deps.db.insert(partnerSignInTokens).values({
    partnerId,
    tokenHash: hash,
    expiresAt: new Date(deps.now().getTime() + ttlMs),
  });
  return `${deps.portalUrl}/partner/continue?token=${token}`;
}

export async function sendInvitation(deps: PartnerDeps, partnerId: string) {
  const p = await getPartner(deps.db, partnerId);
  if (!p) throw new PartnerError("Partner not found.");
  if (!["created", "invited", "draft"].includes(p.status)) throw new PartnerError("This partner has already submitted.");
  const blockers = await invitationBlockers(deps.db, p);
  if (blockers.length) return { ok: false as const, problems: blockers };
  const link = await issueLink(deps, p.id, INVITE_TTL_MS);
  const ref = partnerRef(p);
  await deps.notify({
    to: p.contactEmail,
    from: OPERATOR_MAIL.from,
    replyTo: OPERATOR_MAIL.replyTo,
    subject: pe.invitation.subject(ref),
    text: body(pe.invitation.lines({ name: p.contactName, company: p.tradingName || p.legalName, ref, link, bus: p.type === "bus_operator" })),
  });
  const now = deps.now();
  const [row] = await deps.db
    .update(partners)
    .set({ status: p.status === "created" ? "invited" : p.status, invitedAt: now, updatedAt: now })
    .where(eq(partners.id, p.id))
    .returning();
  await audit(deps, "partner.invite", { ref });
  await syncPartnerRow(deps, row);
  return { ok: true as const };
}

// --- Signing in ------------------------------------------------------------------

/** Always behaves the same whether or not the email is known, so it reveals nothing. */
export async function requestSignIn(deps: PartnerDeps, email: string) {
  const address = email.trim().toLowerCase();
  if (!z.email().safeParse(address).success) return;
  const rows = await deps.db
    .select()
    .from(partners)
    .where(and(eq(partners.contactEmail, address), inArray(partners.status, ["invited", "draft", "submitted", "under_review", "changes_requested", "approved"])));
  for (const p of rows.slice(0, 3)) {
    const link = await issueLink(deps, p.id, SIGN_IN_TTL_MS);
    await quietly(deps, "Sign-in email", () =>
      deps.notify({
        to: p.contactEmail,
        from: OPERATOR_MAIL.from,
        replyTo: OPERATOR_MAIL.replyTo,
        subject: pe.signIn.subject,
        text: body(pe.signIn.lines({ link })),
      }),
    );
  }
}

/** Uses a sign-in link once. Returns the partner id, or null if the link is invalid. */
export async function consumeSignIn(deps: PartnerDeps, token: string): Promise<string | null> {
  if (!token || token.length > 100) return null;
  const now = deps.now();
  const [row] = await deps.db
    .update(partnerSignInTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(partnerSignInTokens.tokenHash, hashToken(token)),
        isNull(partnerSignInTokens.usedAt),
        sql`${partnerSignInTokens.expiresAt} > ${now}`,
      ),
    )
    .returning({ partnerId: partnerSignInTokens.partnerId });
  if (!row) return null;
  const p = await getPartner(deps.db, row.partnerId);
  if (!p || ["created", "rejected", "suspended"].includes(p.status)) return null;
  return p.id;
}

// --- Documents ------------------------------------------------------------------

const SINGLE_SLOT_REPLACES = true;

export type RecordDocumentInput = {
  partnerId: string | null;
  eventId: string | null;
  slot: string;
  source: "partner" | "bullion";
  pathname: string;
  fileName: string;
  multiple: boolean;
};

/**
 * Records a file the browser has just uploaded. Checks it exists in storage, sits under the
 * owner's own folder, and is an allowed type and size. A single-file slot keeps only the
 * newest file.
 */
export async function recordDocument(deps: PartnerDeps, input: RecordDocumentInput) {
  const prefix = input.partnerId ? partnerPrefix(input.partnerId) : libraryPrefix;
  if (!input.pathname.startsWith(prefix) || input.pathname.includes("..")) throw new PartnerError("That file is not in your folder.");
  const stored = await deps.files.head(input.pathname);
  if (!stored) throw new PartnerError("The upload did not reach storage. Please try again.");
  if (stored.size > UPLOAD_MAX_BYTES || !UPLOAD_TYPES.includes(stored.contentType)) {
    await quietly(deps, "Removing a rejected upload", () => deps.files.remove(input.pathname));
    throw new PartnerError("Upload a PDF, JPG or PNG file of up to 20 MB.");
  }
  const [doc] = await deps.db
    .insert(partnerDocuments)
    .values({
      partnerId: input.partnerId,
      eventId: input.eventId,
      slot: input.slot,
      source: input.source,
      pathname: input.pathname,
      fileName: input.fileName.slice(0, 200),
      contentType: stored.contentType,
      size: stored.size,
      createdAt: deps.now(),
    })
    .returning();
  if (SINGLE_SLOT_REPLACES && !input.multiple && input.partnerId) {
    const older = await deps.db
      .select()
      .from(partnerDocuments)
      .where(
        and(
          eq(partnerDocuments.partnerId, input.partnerId),
          eq(partnerDocuments.slot, input.slot),
          input.eventId ? eq(partnerDocuments.eventId, input.eventId) : isNull(partnerDocuments.eventId),
          sql`${partnerDocuments.id} <> ${doc.id}`,
        ),
      );
    for (const o of older) await removeDocument(deps, o);
  }
  return doc;
}

export async function removeDocument(deps: PartnerDeps, doc: PartnerDocument) {
  await deps.db.delete(partnerDocuments).where(eq(partnerDocuments.id, doc.id));
  await quietly(deps, `Deleting ${doc.pathname}`, () => deps.files.remove(doc.pathname));
}

// --- KYC (partner) ------------------------------------------------------------------

export async function saveKyc(deps: PartnerDeps, partnerId: string, raw: unknown) {
  const p = await getPartner(deps.db, partnerId);
  if (!p) throw new PartnerError("Partner not found.");
  if (!isEditable(p)) throw new PartnerError("These details are with InstaTickets and cannot be changed now.");
  const type = p.type as PartnerType;
  const kyc = parseKyc(type, raw);
  // Keep only the settlement accounts for currencies still in use, one per currency.
  const needed = type === "bus_operator" ? busCurrencies(kyc as BusKyc) : (kyc as OrganiserKyc).currencies;
  kyc.accounts = needed.map((c) => kyc.accounts.find((a) => a.currency === c) ?? { currency: c, bank: "", branch: "", accountName: "", accountNumber: "" });
  // The finance (bus) or main (events) contact is the one Bullion has on file; it stays as set.
  if (type === "bus_operator") (kyc as BusKyc).contacts.finance.email = p.contactEmail;
  else (kyc as OrganiserKyc).contacts.main.email = p.contactEmail;
  const now = deps.now();
  const [row] = await deps.db
    .update(partners)
    .set({
      kyc,
      legalName: kyc.company.legalName || p.legalName,
      tradingName: kyc.company.tradingName || null,
      status: p.status === "invited" ? "draft" : p.status,
      updatedAt: now,
    })
    .where(eq(partners.id, p.id))
    .returning();
  if (p.status === "invited") await syncPartnerRow(deps, row);
  return row;
}

/** Everything still missing before this partner can submit. */
export async function submissionProblems(db: Db, p: Partner): Promise<Problem[]> {
  const type = p.type as PartnerType;
  const kyc = parseKyc(type, p.kyc);
  const problems = type === "bus_operator" ? checkBusKyc(kyc as BusKyc) : checkOrganiserKyc(kyc as OrganiserKyc);
  const docs = await listDocuments(db, p.id);
  // A file counts whoever uploaded it: InstaTickets may upload a document on the partner's behalf.
  const uploaded = new Set(docs.filter((d) => !d.eventId).map((d) => d.slot));
  return [
    ...problems,
    ...missingDocuments(partnerChecklist(type, kyc, { anchorAddendum: p.anchorAddendum }), uploaded),
    ...missingDocuments(signedChecklist(type, { anchorAddendum: p.anchorAddendum }), uploaded),
  ];
}

const technicalContact = (k: BusKyc) => (k.contacts.technical.same ? k.contacts.finance : k.contacts.technical);

export async function submitKyc(deps: PartnerDeps, partnerId: string) {
  const p = await getPartner(deps.db, partnerId);
  if (!p) throw new PartnerError("Partner not found.");
  if (!isEditable(p)) throw new PartnerError("This submission is already with InstaTickets.");
  const problems = await submissionProblems(deps.db, p);
  if (problems.length) return { ok: false as const, problems };
  const now = deps.now();
  const [row] = await deps.db
    .update(partners)
    .set({ status: "submitted", submittedAt: now, reviewNote: null, updatedAt: now })
    .where(eq(partners.id, p.id))
    .returning();
  const ref = partnerRef(row);
  const bus = row.type === "bus_operator";
  const kyc = parseKyc(row.type as PartnerType, row.kyc);

  await quietly(deps, "Submission receipt", () =>
    deps.notify({
      to: row.contactEmail,
      from: OPERATOR_MAIL.from,
      replyTo: OPERATOR_MAIL.replyTo,
      subject: pe.submitted.subject(ref),
      text: body(pe.submitted.lines({ name: row.contactName, ref, bus })),
    }),
  );
  await quietly(deps, "Team notification", () => deps.notify(teamEmail(deps, row, kyc, p.status === "changes_requested" ? "Resubmitted:" : "Submitted:")));
  if (bus && row.integrationStatus === "not_started") await sendIntegrationStandard(deps, row);
  const fresh = (await getPartner(deps.db, row.id)) ?? row;
  await syncPartnerRow(deps, fresh);
  return { ok: true as const };
}

function teamEmail(deps: PartnerDeps, p: Partner, kyc: BusKyc | OrganiserKyc, what: string): EmailMessage {
  const type = p.type as PartnerType;
  const currencies = type === "bus_operator" ? busCurrencies(kyc as BusKyc) : (kyc as OrganiserKyc).currencies;
  const lines = [
    `${partnerTypes[type].label}: ${p.legalName}${p.tradingName ? ` (${p.tradingName})` : ""}`,
    `Reference: ${partnerRef(p)}`,
    `Contact: ${p.contactName}, ${p.contactEmail}`,
    `Currencies: ${currencies.map(currencyShort).join(", ") || "-"}`,
    ...(type === "bus_operator" ? [`Routes: ${(kyc as BusKyc).routes.map((r) => `${r.origin} to ${r.destination}`).join("; ") || "-"}`] : []),
    "",
    `Review in the admin area: ${deps.adminUrl}/partners/${p.id}`,
    "",
    "Bank details and documents are in the admin area only.",
  ];
  return {
    to: OPERATOR_MAIL.notify,
    subject: pe.team.subject(partnerRef(p), `${what} ${partnerTypes[type].label.toLowerCase()} onboarding`),
    replyTo: p.contactEmail,
    text: lines.join("\n"),
  };
}

/** Emails the Integration Standard to the operator's technical contact (copy to accounts@). */
export async function sendIntegrationStandard(deps: PartnerDeps, p: Partner) {
  const kyc = parseKyc("bus_operator", p.kyc) as BusKyc;
  const tech = technicalContact(kyc);
  const ref = partnerRef(p);
  const standard = await libraryDocument(deps.db, contractSlots.integrationStandard.slot);
  let attachments: EmailMessage["attachments"];
  if (standard) {
    const data = await readAll(deps.files, standard.pathname).catch(() => null);
    if (data) attachments = [{ filename: standard.fileName, content: data.toString("base64") }];
  }
  let sent = false;
  await quietly(deps, "Integration Standard email", async () => {
    await deps.notify({
      to: [tech.email, OPERATOR_MAIL.replyTo],
      from: OPERATOR_MAIL.from,
      replyTo: OPERATOR_MAIL.replyTo,
      subject: pe.integration.subject(ref),
      text: body(pe.integration.lines({ name: tech.name, company: p.tradingName || p.legalName, ref, attached: !!attachments })),
      attachments,
    });
    sent = true;
  });
  if (sent) {
    const now = deps.now();
    await deps.db
      .update(partners)
      .set({ integrationStatus: p.integrationStatus === "not_started" ? "standard_sent" : p.integrationStatus, integrationSentAt: now, updatedAt: now })
      .where(eq(partners.id, p.id));
  }
  return sent;
}

// --- Review (admin) ------------------------------------------------------------------

export type AdminAction =
  | "start_review"
  | "request_changes"
  | "approve"
  | "reject"
  | "suspend"
  | "reinstate"
  | "resend_integration"
  | "certified"
  | "live";

const allowedFrom: Record<AdminAction, PartnerStatus[]> = {
  start_review: ["submitted"],
  request_changes: ["submitted", "under_review"],
  approve: ["submitted", "under_review"],
  reject: ["submitted", "under_review", "changes_requested"],
  suspend: ["approved"],
  reinstate: ["suspended"],
  resend_integration: ["submitted", "under_review", "changes_requested", "approved"],
  certified: ["submitted", "under_review", "changes_requested", "approved"],
  live: ["approved"],
};

export async function adminAction(deps: PartnerDeps, partnerId: string, action: AdminAction, note = "") {
  const p = await getPartner(deps.db, partnerId);
  if (!p) throw new PartnerError("Partner not found.");
  if (!allowedFrom[action].includes(p.status as PartnerStatus)) {
    throw new PartnerError(`Not possible while the status is "${partnerStatuses[p.status as PartnerStatus]}".`);
  }
  const ref = partnerRef(p);
  const bus = p.type === "bus_operator";
  const now = deps.now();
  const set = async (values: Partial<typeof partners.$inferInsert>) =>
    (await deps.db.update(partners).set({ ...values, updatedAt: now }).where(eq(partners.id, p.id)).returning())[0];
  const trimmed = note.trim().slice(0, 2000);
  let row = p;

  switch (action) {
    case "start_review":
      row = await set({ status: "under_review" });
      break;
    case "request_changes": {
      if (!trimmed) throw new PartnerError("Write a note telling the partner what to change.");
      row = await set({ status: "changes_requested", reviewNote: trimmed });
      const link = await issueLink(deps, p.id, INVITE_TTL_MS);
      await quietly(deps, "Changes requested email", () =>
        deps.notify({ to: p.contactEmail, from: OPERATOR_MAIL.from, replyTo: OPERATOR_MAIL.replyTo, subject: pe.changes.subject(ref), text: body(pe.changes.lines({ name: p.contactName, note: trimmed, link })) }),
      );
      break;
    }
    case "approve": {
      const docs = await listDocuments(deps.db, p.id);
      if (!docs.some((d) => d.slot === contractSlots.executed.slot)) {
        throw new PartnerError("Upload the countersigned (executed) agreement before approving.");
      }
      row = await set({ status: "approved", approvedAt: now, reviewNote: null });
      const link = await issueLink(deps, p.id, INVITE_TTL_MS);
      await quietly(deps, "Approval email", () =>
        deps.notify({ to: p.contactEmail, from: OPERATOR_MAIL.from, replyTo: OPERATOR_MAIL.replyTo, subject: pe.approved.subject(ref), text: body(pe.approved.lines({ name: p.contactName, link, bus })) }),
      );
      break;
    }
    case "reject":
      if (!trimmed) throw new PartnerError("Write the reason for rejection.");
      row = await set({ status: "rejected", reviewNote: trimmed });
      await quietly(deps, "Rejection email", () =>
        deps.notify({ to: p.contactEmail, from: OPERATOR_MAIL.from, replyTo: OPERATOR_MAIL.replyTo, subject: pe.rejected.subject(ref), text: body(pe.rejected.lines({ name: p.contactName, note: trimmed })) }),
      );
      break;
    case "suspend":
      row = await set({ status: "suspended", reviewNote: trimmed || null });
      break;
    case "reinstate":
      row = await set({ status: "approved" });
      break;
    case "resend_integration":
      if (!bus) throw new PartnerError("Only bus operators integrate.");
      if (!(await sendIntegrationStandard(deps, p))) throw new PartnerError("The email could not be sent. Check the logs.");
      row = (await getPartner(deps.db, p.id)) ?? p;
      break;
    case "certified":
      if (!bus) throw new PartnerError("Only bus operators integrate.");
      row = await set({ integrationStatus: "certified" });
      break;
    case "live":
      if (!bus) throw new PartnerError("Only bus operators integrate.");
      if (p.integrationStatus !== "certified" && p.integrationStatus !== "live") throw new PartnerError("Record certification first.");
      row = await set({ integrationStatus: "live" });
      break;
  }
  await audit(deps, "partner.status", { ref, action });
  await syncPartnerRow(deps, row);
  return row;
}

const contactInput = z.object({
  contactName: z.string().trim().min(1, "Enter the contact's name.").max(150),
  contactEmail: z.email("Enter a valid email address.").trim().toLowerCase().max(254),
  contactPhone: z.string().trim().max(40),
  anchorAddendum: z.boolean(),
  groupName: z.string().trim().max(100).transform((v) => v || null),
});

/** Corrects the contact Bullion has on file (it is the address that signs in). */
export async function updatePartnerSetup(deps: PartnerDeps, partnerId: string, input: z.input<typeof contactInput>) {
  const p = await getPartner(deps.db, partnerId);
  if (!p) throw new PartnerError("Partner not found.");
  const parsed = contactInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, problems: parsed.error.issues.map((i) => i.message) };
  const phone = parsed.data.contactPhone ? normalisePhone(parsed.data.contactPhone) : null;
  if (parsed.data.contactPhone && !phone) return { ok: false as const, problems: ["Enter a valid phone number for the contact."] };
  const bus = p.type === "bus_operator";
  const kyc = { ...(p.kyc as Record<string, unknown>) };
  const contacts = { ...((kyc.contacts as Record<string, unknown>) ?? {}) };
  contacts[bus ? "finance" : "main"] = { ...((contacts[bus ? "finance" : "main"] as object) ?? {}), name: parsed.data.contactName, email: parsed.data.contactEmail, phone: phone ?? "" };
  kyc.contacts = contacts;
  const [row] = await deps.db
    .update(partners)
    .set({
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: phone,
      anchorAddendum: bus && parsed.data.anchorAddendum,
      groupName: bus ? parsed.data.groupName : null,
      kyc,
      updatedAt: deps.now(),
    })
    .where(eq(partners.id, p.id))
    .returning();
  await audit(deps, "partner.update", { ref: partnerRef(row) });
  return { ok: true as const, partner: row };
}

// --- Events (organisers) ------------------------------------------------------------

export async function createEvent(deps: PartnerDeps, partnerId: string) {
  const p = await getPartner(deps.db, partnerId);
  if (!p || p.type !== "event_organiser") throw new PartnerError("Only event organisers submit events.");
  if (p.status !== "approved") throw new PartnerError("You can submit events once your onboarding is approved.");
  const now = deps.now();
  return deps.db.transaction(async (tx) => {
    const [{ next }] = await tx
      .select({ next: sql<number>`coalesce(max(${partnerEvents.seq}), 0) + 1` })
      .from(partnerEvents)
      .where(eq(partnerEvents.partnerId, p.id));
    const [row] = await tx
      .insert(partnerEvents)
      .values({ partnerId: p.id, seq: Number(next), createdAt: now, updatedAt: now })
      .returning();
    return row;
  });
}

export async function saveEvent(deps: PartnerDeps, partnerId: string, eventId: string, raw: unknown) {
  const e = await getEvent(deps.db, partnerId, eventId);
  if (!e) throw new PartnerError("Event not found.");
  if (!isEventEditable(e)) throw new PartnerError("This event is with InstaTickets and cannot be changed now.");
  const data = eventDataSchema.parse(raw ?? {});
  const [row] = await deps.db
    .update(partnerEvents)
    .set({ data, name: data.name, updatedAt: deps.now() })
    .where(eq(partnerEvents.id, e.id))
    .returning();
  return row;
}

export async function eventProblems(db: Db, e: PartnerEvent): Promise<Problem[]> {
  const data = eventDataSchema.parse(e.data ?? {});
  const docs = await db.select().from(partnerDocuments).where(eq(partnerDocuments.eventId, e.id));
  return [...checkEvent(data), ...missingDocuments(eventChecklist(data), new Set(docs.map((d) => d.slot)))];
}

export async function submitEvent(deps: PartnerDeps, partnerId: string, eventId: string) {
  const p = await getPartner(deps.db, partnerId);
  const e = await getEvent(deps.db, partnerId, eventId);
  if (!p || !e) throw new PartnerError("Event not found.");
  if (!isEventEditable(e)) throw new PartnerError("This event is already with InstaTickets.");
  const problems = await eventProblems(deps.db, e);
  if (problems.length) return { ok: false as const, problems };
  const now = deps.now();
  const [row] = await deps.db
    .update(partnerEvents)
    .set({ status: "submitted", submittedAt: now, reviewNote: null, updatedAt: now })
    .where(eq(partnerEvents.id, e.id))
    .returning();
  const ref = eventRef(p, row);
  await quietly(deps, "Event receipt", () =>
    deps.notify({ to: p.contactEmail, from: OPERATOR_MAIL.from, replyTo: OPERATOR_MAIL.replyTo, subject: pe.eventSubmitted.subject(ref), text: body(pe.eventSubmitted.lines({ name: p.contactName, event: row.name, ref })) }),
  );
  await quietly(deps, "Team notification", () =>
    deps.notify({
      to: OPERATOR_MAIL.notify,
      replyTo: p.contactEmail,
      subject: pe.team.subject(ref, "Event submitted:"),
      text: [`Organiser: ${p.legalName}`, `Event: ${row.name}`, `Reference: ${ref}`, "", `Review: ${deps.adminUrl}/partners/${p.id}/events/${row.id}`].join("\n"),
    }),
  );
  await syncEventRow(deps, p, row);
  return { ok: true as const };
}

export type EventAction = "start_review" | "request_changes" | "send_order_form" | "approve" | "reject";

export async function adminEventAction(deps: PartnerDeps, partnerId: string, eventId: string, action: EventAction, note = "") {
  const p = await getPartner(deps.db, partnerId);
  const e = await getEvent(deps.db, partnerId, eventId);
  if (!p || !e) throw new PartnerError("Event not found.");
  const status = e.status as EventStatus;
  const from: Record<EventAction, EventStatus[]> = {
    start_review: ["submitted"],
    request_changes: ["submitted", "under_review", "order_form_sent"],
    send_order_form: ["submitted", "under_review"],
    approve: ["order_form_sent"],
    reject: ["submitted", "under_review", "changes_requested", "order_form_sent"],
  };
  if (!from[action].includes(status)) throw new PartnerError(`Not possible while the event is "${eventStatuses[status]}".`);
  const docs = await deps.db.select().from(partnerDocuments).where(eq(partnerDocuments.eventId, e.id));
  const has = (slot: string) => docs.some((d) => d.slot === slot);
  const ref = eventRef(p, e);
  const now = deps.now();
  const trimmed = note.trim().slice(0, 2000);
  const set = async (values: Partial<typeof partnerEvents.$inferInsert>) =>
    (await deps.db.update(partnerEvents).set({ ...values, updatedAt: now }).where(eq(partnerEvents.id, e.id)).returning())[0];
  const mail = (subject: string, lines: readonly string[]) =>
    quietly(deps, "Event email", () => deps.notify({ to: p.contactEmail, from: OPERATOR_MAIL.from, replyTo: OPERATOR_MAIL.replyTo, subject, text: body(lines) }));
  let row = e;
  switch (action) {
    case "start_review":
      row = await set({ status: "under_review" });
      break;
    case "request_changes": {
      if (!trimmed) throw new PartnerError("Write a note telling the organiser what to change.");
      row = await set({ status: "changes_requested", reviewNote: trimmed });
      const link = await issueLink(deps, p.id, INVITE_TTL_MS);
      await mail(pe.eventChanges.subject(ref), pe.eventChanges.lines({ name: p.contactName, event: e.name, note: trimmed, link }));
      break;
    }
    case "send_order_form": {
      if (!has(contractSlots.eventOrderForm.slot)) throw new PartnerError("Upload the Event Order Form first.");
      row = await set({ status: "order_form_sent" });
      const link = await issueLink(deps, p.id, INVITE_TTL_MS);
      await mail(pe.eventOrderForm.subject(ref), pe.eventOrderForm.lines({ name: p.contactName, event: e.name, link }));
      break;
    }
    case "approve": {
      if (!has(contractSlots.signedEventOrderForm.slot)) throw new PartnerError("The organiser has not uploaded the signed Event Order Form yet.");
      if (!has(contractSlots.executedEventOrderForm.slot)) throw new PartnerError("Upload the executed (countersigned) Event Order Form first.");
      row = await set({ status: "approved", approvedAt: now, reviewNote: null });
      const link = await issueLink(deps, p.id, INVITE_TTL_MS);
      await mail(pe.eventApproved.subject(ref), pe.eventApproved.lines({ name: p.contactName, event: e.name, link }));
      break;
    }
    case "reject":
      if (!trimmed) throw new PartnerError("Write the reason for rejection.");
      row = await set({ status: "rejected", reviewNote: trimmed });
      break;
  }
  await audit(deps, "partner.event", { ref, action });
  await syncEventRow(deps, p, row);
  return row;
}

// --- Reminders (daily job) ------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;
/** Reminder 1 two days after the invitation, reminder 2 five days after. */
export const REMINDER_DAYS = [2, 5];

export async function sendReminders(deps: PartnerDeps) {
  const now = deps.now();
  const rows = await deps.db
    .select()
    .from(partners)
    .where(and(inArray(partners.status, ["invited", "draft"]), lt(partners.remindersSent, REMINDER_DAYS.length)));
  let sent = 0;
  for (const p of rows) {
    if (!p.invitedAt) continue;
    const due = REMINDER_DAYS.at(p.remindersSent);
    if (due === undefined || now.getTime() - p.invitedAt.getTime() < due * DAY) continue;
    const link = await issueLink(deps, p.id, INVITE_TTL_MS);
    await quietly(deps, "Reminder email", async () => {
      await deps.notify({ to: p.contactEmail, from: OPERATOR_MAIL.from, replyTo: OPERATOR_MAIL.replyTo, subject: pe.reminder.subject(partnerRef(p)), text: body(pe.reminder.lines({ name: p.contactName, link })) });
      await deps.db.update(partners).set({ remindersSent: p.remindersSent + 1 }).where(eq(partners.id, p.id));
      sent += 1;
    });
  }
  return sent;
}

// --- Google Sheet pipeline (no bank details, IDs or document links) ---------------------

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export async function syncPartnerRow(deps: PartnerDeps, p: Partner) {
  const type = p.type as PartnerType;
  const kyc = parseKyc(type, p.kyc);
  const currencies = type === "bus_operator" ? busCurrencies(kyc as BusKyc) : (kyc as OrganiserKyc).currencies;
  await quietly(deps, "Google Sheet row", () =>
    deps.sheet(
      [
        ["Reference", partnerRef(p)],
        ["Type", partnerTypes[type].label],
        ["Partner", p.tradingName || p.legalName],
        ["Contact", `${p.contactName} <${p.contactEmail}>`],
        ["Stage", partnerStatuses[p.status as PartnerStatus] ?? p.status],
        ["Integration", type === "bus_operator" ? p.integrationStatus.replace(/_/g, " ") : "n/a"],
        ["Currencies", currencies.map(currencyShort).join(", ")],
        ["Invited", day(p.invitedAt)],
        ["Submitted", day(p.submittedAt)],
        ["Approved", day(p.approvedAt)],
        ["Updated", day(p.updatedAt)],
      ],
      { sheet: "Partners", key: "Reference" },
    ),
  );
}

async function syncEventRow(deps: PartnerDeps, p: Partner, e: PartnerEvent) {
  const data = eventDataSchema.parse(e.data ?? {});
  await quietly(deps, "Google Sheet row", () =>
    deps.sheet(
      [
        ["Reference", eventRef(p, e)],
        ["Organiser", p.tradingName || p.legalName],
        ["Event", e.name],
        ["Event date", data.startDate],
        ["Stage", eventStatuses[e.status as EventStatus] ?? e.status],
        ["Currencies", data.currencies.map(currencyShort).join(", ")],
        ["Submitted", day(e.submittedAt)],
        ["Approved", day(e.approvedAt)],
      ],
      { sheet: "Events", key: "Reference" },
    ),
  );
}

import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { partners, partnerSignInTokens } from "@/lib/db/schema";
import { busCurrencies, busKycSchema } from "@/lib/partners/kyc";
import {
  updateSandboxCredentials,
  adminAction,
  adminEventAction,
  consumeSignIn,
  createEvent,
  createPartner,
  getPartner,
  partnerRef,
  PartnerError,
  requestSignIn,
  saveEvent,
  saveKyc,
  sendInvitation,
  sendReminders,
  submitEvent,
  submitKyc,
} from "@/lib/partners/service";
import { createPartnerSession, hashToken, readPartnerSession } from "@/lib/partners/tokens";
import { fullBusKyc, makePartnerDeps, upload, type TestPartnerDeps } from "./helpers/partners";

const busInput = {
  type: "bus_operator" as const,
  legalName: "Tamuka Coaches (Pvt) Ltd",
  tradingName: "Tamuka Coaches",
  groupName: "",
  anchorAddendum: false,
  organiserType: "",
  contactName: "Rudo Finance",
  contactEmail: "Finance@Tamuka.example",
  contactPhone: "0771234567",
};

const linkToken = (text: string) => /token=([\w-]+)/.exec(text)?.[1] ?? "";

async function invitedBus(deps: TestPartnerDeps, overrides: Partial<typeof busInput> = {}) {
  const created = await createPartner(deps, { ...busInput, ...overrides });
  if (!created.ok) throw new Error(created.problems.join());
  const p = created.partner;
  await upload(deps, { partnerId: null, slot: "master_terms_bus", source: "bullion" });
  await upload(deps, { partnerId: null, slot: "integration_standard", source: "bullion" });
  await upload(deps, { partnerId: p.id, slot: "order_form", source: "bullion" });
  await updateSandboxCredentials(deps, p.id, "Sandbox URL: https://sandbox.example\nClient ID: tamuka\nSecret: s3cr3t");
  if (p.anchorAddendum) await upload(deps, { partnerId: p.id, slot: "addendum", source: "bullion" });
  const invited = await sendInvitation(deps, p.id);
  if (!invited.ok) throw new Error(invited.problems.join());
  return p;
}

const BUS_DOCS = [
  "incorporation",
  "cr6_cr14",
  "operator_licence",
  "route_permits",
  "tax_clearance",
  "timetables",
  "sample_manifest",
  "fitness_certificates",
  "passenger_insurance",
  "ids",
  "bank_letter:USD",
  "bank_letter:ZAR",
  "bank_letter:ZWG",
  "bank_letter:BWP",
  "signed_master_terms",
  "signed_order_form",
];

describe("creating and inviting partners", () => {
  it("numbers bus operators and organisers separately", async () => {
    const deps = await makePartnerDeps();
    const a = await createPartner(deps, busInput);
    const b = await createPartner(deps, { ...busInput, legalName: "City Bus" });
    const c = await createPartner(deps, { ...busInput, type: "event_organiser", organiserType: "promoter" });
    expect([a, b, c].map((r) => (r.ok ? partnerRef(r.partner) : ""))).toEqual(["OP-0001", "OP-0002", "EO-0001"]);
    expect(a.ok && a.partner.contactEmail).toBe("finance@tamuka.example");
    expect(a.ok && a.partner.contactPhone).toBe("+263771234567");
  });

  it("will not invite until the master terms and the operator's Order Form are uploaded", async () => {
    const deps = await makePartnerDeps();
    const created = await createPartner(deps, { ...busInput, anchorAddendum: true });
    if (!created.ok) throw new Error();
    const first = await sendInvitation(deps, created.partner.id);
    expect(first.ok).toBe(false);
    expect(!first.ok && first.problems).toHaveLength(4); // master terms, order form, addendum, sandbox credentials
    expect(deps.sent).toHaveLength(0);
  });

  it("emails a one-time sign-in link and stores only its hash", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    expect(deps.sent).toHaveLength(1);
    const mail = deps.sent[0];
    expect(mail.to).toBe("finance@tamuka.example");
    expect(mail.from).toContain("accounts@instatickets.co.zw");
    expect(mail.subject).toBe("Your invitation to onboard with InstaTickets (OP-0001)");
    const token = linkToken(mail.text);
    expect(mail.text).toContain(`https://operators.example.test/partner/continue?token=${token}`);
    const [stored] = await deps.db.select().from(partnerSignInTokens);
    expect(stored.tokenHash).toBe(hashToken(token));
    expect(stored.tokenHash).not.toContain(token);
    expect((await getPartner(deps.db, p.id))?.status).toBe("invited");
  });
});

describe("signing in", () => {
  it("accepts a link once, then refuses it", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    const token = linkToken(deps.sent[0].text);
    expect(await consumeSignIn(deps, token)).toBe(p.id);
    expect(await consumeSignIn(deps, token)).toBeNull();
    expect(await consumeSignIn(deps, "made-up")).toBeNull();
  });

  it("refuses an expired link", async () => {
    const deps = await makePartnerDeps();
    await invitedBus(deps);
    deps.clock.now = new Date(deps.clock.now.getTime() + 8 * 24 * 3600 * 1000);
    expect(await consumeSignIn(deps, linkToken(deps.sent[0].text))).toBeNull();
  });

  it("emails a link only to an address on file, and says nothing either way", async () => {
    const deps = await makePartnerDeps();
    await invitedBus(deps);
    await requestSignIn(deps, "stranger@example.com");
    expect(deps.sent).toHaveLength(1);
    await requestSignIn(deps, " FINANCE@tamuka.example ");
    expect(deps.sent).toHaveLength(2);
    expect(deps.sent[1].subject).toBe("Your InstaTickets Partner Portal sign-in link");
  });

  it("signs and checks the session cookie", () => {
    const secret = "s".repeat(64);
    const now = Date.now();
    const token = createPartnerSession(secret, "abc", now);
    expect(readPartnerSession(secret, token, now)?.partnerId).toBe("abc");
    expect(readPartnerSession("x".repeat(64), token, now)).toBeNull();
    expect(readPartnerSession(secret, token, now + 13 * 3600 * 1000)).toBeNull();
    expect(readPartnerSession(secret, `${token}x`, now)).toBeNull();
  });
});

describe("bus operator KYC", () => {
  it("keeps one settlement account per currency in use, and the finance email on file", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    const kyc = fullBusKyc("someone-else@example.com");
    const row = await saveKyc(deps, p.id, kyc);
    const saved = busKycSchema.parse(row.kyc);
    expect(busCurrencies(saved)).toEqual(["USD", "ZWG", "ZAR", "BWP"]);
    expect(saved.accounts.map((a) => a.currency)).toEqual(["USD", "ZWG", "ZAR", "BWP"]);
    expect(saved.contacts.finance.email).toBe("finance@tamuka.example");
    expect(row.status).toBe("draft");
  });

  it("lists every missing field and document before it can submit", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    const result = await submitKyc(deps, p.id);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const paths = result.problems.map((x) => x.path);
    expect(paths).toContain("company.registrationNumber");
    expect(paths).toContain("contacts.technical.email");
    expect(paths).toContain("routes");
    expect(paths).toContain("doc:signed_order_form");
    expect(paths).toContain("expiry.taxClearance");
  });

  it("asks for a bank letter for every currency on any route", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    await saveKyc(deps, p.id, fullBusKyc("finance@tamuka.example"));
    for (const slot of BUS_DOCS.filter((s) => s !== "bank_letter:BWP")) await upload(deps, { partnerId: p.id, slot });
    const result = await submitKyc(deps, p.id);
    expect(!result.ok && result.problems.map((x) => x.path)).toEqual(["doc:bank_letter:BWP"]);
  });

  it("on submission: receipt, team email without bank details, Integration Standard to the technical contact, Sheet row", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    await saveKyc(deps, p.id, fullBusKyc("finance@tamuka.example"));
    for (const slot of BUS_DOCS) await upload(deps, { partnerId: p.id, slot });
    deps.sent.length = 0;
    deps.sheetRows.length = 0;
    expect(await submitKyc(deps, p.id)).toEqual({ ok: true });

    const [receipt, team, integration] = deps.sent;
    expect(receipt.to).toBe("finance@tamuka.example");
    expect(receipt.subject).toBe("We have received your onboarding submission (OP-0001)");
    expect(team.to).toEqual(["accounts@instatickets.co.zw", "tich@instatickets.co.zw"]);
    expect(team.text).toContain("Currencies: USD, ZiG, ZAR, BWP");
    expect(team.text).not.toContain("998877");
    expect(integration.to).toEqual(["tech@tamuka.example", "accounts@instatickets.co.zw"]);
    expect(integration.attachments).toHaveLength(1);
    expect(integration.subject).toBe("InstaTickets integration pack: Integration Standard and sandbox access (OP-0001)");
    expect(integration.text).toContain("Client ID: tamuka");

    const row = await getPartner(deps.db, p.id);
    expect(row?.status).toBe("submitted");
    expect(row?.integrationStatus).toBe("standard_sent");
    const sheet = deps.sheetRows.at(-1)!;
    expect(sheet.options).toEqual({ sheet: "Partners", key: "Reference" });
    expect(JSON.stringify(sheet.row)).not.toContain("998877");
    expect(Object.fromEntries(sheet.row).Stage).toBe("Submitted");

    await expect(saveKyc(deps, p.id, {})).rejects.toThrow(PartnerError);
  });

  it("sends the technical contact the standard once, even after a resubmission", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    await saveKyc(deps, p.id, fullBusKyc("finance@tamuka.example"));
    for (const slot of BUS_DOCS) await upload(deps, { partnerId: p.id, slot });
    await submitKyc(deps, p.id);
    await adminAction(deps, p.id, "request_changes", "Please upload a clearer CR14.");
    expect((await getPartner(deps.db, p.id))?.status).toBe("changes_requested");
    expect(deps.sent.at(-1)?.text).toContain("Please upload a clearer CR14.");
    deps.sent.length = 0;
    expect(await submitKyc(deps, p.id)).toEqual({ ok: true });
    expect(deps.sent.some((m) => m.subject.includes("integration pack"))).toBe(false);
    expect(deps.sent[1].subject).toContain("Resubmitted");
  });

  it("approves only once the executed agreement is uploaded", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    await saveKyc(deps, p.id, fullBusKyc("finance@tamuka.example"));
    for (const slot of BUS_DOCS) await upload(deps, { partnerId: p.id, slot });
    await submitKyc(deps, p.id);
    await expect(adminAction(deps, p.id, "approve")).rejects.toThrow(/executed/);
    await upload(deps, { partnerId: p.id, slot: "executed_agreement", source: "bullion" });
    expect((await adminAction(deps, p.id, "approve")).status).toBe("approved");
    await expect(adminAction(deps, p.id, "live")).rejects.toThrow(/certification/);
    await adminAction(deps, p.id, "certified");
    expect((await adminAction(deps, p.id, "live")).integrationStatus).toBe("live");
  });

  it("requires the Anchor Addendum to be signed when it applies", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps, { anchorAddendum: true });
    await saveKyc(deps, p.id, fullBusKyc("finance@tamuka.example"));
    for (const slot of BUS_DOCS) await upload(deps, { partnerId: p.id, slot });
    const result = await submitKyc(deps, p.id);
    expect(!result.ok && result.problems.map((x) => x.path)).toEqual(["doc:signed_addendum"]);
  });
});

describe("integration pack", () => {
  it("holds the pack if the sandbox credentials were removed, tells the team, and sends it once entered", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    await updateSandboxCredentials(deps, p.id, "");
    await saveKyc(deps, p.id, fullBusKyc("finance@tamuka.example"));
    for (const slot of BUS_DOCS) await upload(deps, { partnerId: p.id, slot });
    deps.sent.length = 0;
    await submitKyc(deps, p.id);
    expect(deps.sent.some((m) => m.subject.includes("integration pack"))).toBe(false);
    expect(deps.sent[1].text).toContain("integration pack was NOT sent");
    await expect(adminAction(deps, p.id, "resend_integration")).rejects.toThrow(/sandbox credentials/);
    await updateSandboxCredentials(deps, p.id, "Client ID: late");
    await adminAction(deps, p.id, "resend_integration");
    expect(deps.sent.at(-1)?.text).toContain("Client ID: late");
    expect((await getPartner(deps.db, p.id))?.integrationStatus).toBe("standard_sent");
  });
});

describe("documents", () => {
  it("refuses files outside the partner's folder, and wrong types", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    const other = await createPartner(deps, { ...busInput, legalName: "Other" });
    if (!other.ok) throw new Error();
    await expect(upload(deps, { partnerId: p.id, slot: "ids", type: "text/html" })).rejects.toThrow(/PDF, JPG or PNG/);
    deps.files.files.set(`partners/${other.partner.id}/x.pdf`, { data: Buffer.alloc(5), contentType: "application/pdf" });
    const { recordDocument } = await import("@/lib/partners/service");
    await expect(
      recordDocument(deps, { partnerId: p.id, eventId: null, slot: "ids", source: "partner", pathname: `partners/${other.partner.id}/x.pdf`, fileName: "x.pdf", multiple: true }),
    ).rejects.toThrow(/not in your folder/);
  });

  it("keeps only the newest file in a single-file slot and deletes the old one", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    const first = await upload(deps, { partnerId: p.id, slot: "tax_clearance" });
    await upload(deps, { partnerId: p.id, slot: "tax_clearance" });
    expect(deps.files.files.has(first.pathname)).toBe(false);
    await upload(deps, { partnerId: p.id, slot: "ids", multiple: true });
    await upload(deps, { partnerId: p.id, slot: "ids", multiple: true });
    const { listDocuments } = await import("@/lib/partners/service");
    const docs = await listDocuments(deps.db, p.id);
    expect(docs.filter((d) => d.slot === "tax_clearance")).toHaveLength(1);
    expect(docs.filter((d) => d.slot === "ids")).toHaveLength(2);
  });
});

describe("event organisers", () => {
  const organiser = {
    company: { legalName: "Harare Live (Pvt) Ltd", tradingName: "", registrationNumber: "55/2018", organiserType: "promoter", noticeAddress: "Harare" },
    contacts: { main: { name: "Main", email: "x", phone: "0771234567" }, eventDay: { same: true }, finance: { same: true } },
    currencies: ["USD", "ZAR"],
    accounts: [
      { currency: "USD", bank: "B", branch: "C", accountName: "D", accountNumber: "1" },
      { currency: "ZAR", bank: "B", branch: "C", accountName: "D", accountNumber: "2" },
    ],
    signatories: [
      { name: "A", role: "Director", phone: "0771111111", email: "a@x.example" },
      { name: "B", role: "Director", phone: "0772222222", email: "b@x.example" },
    ],
    trackRecord: { events: [], depositInstead: true },
    expiry: { taxClearance: "2027-01-31" },
    declarations: { true: true, capacity: true },
  };
  const event = {
    name: "Jazz Night",
    type: "concert",
    startDate: "2026-12-12",
    gatesOpen: "17:00",
    venueName: "HICC",
    venueAddress: "Harare",
    licensedCapacity: "1000",
    salesOpen: "2026-11-01",
    salesClose: "2026-12-12",
    allocation: "all",
    currencies: ["USD"],
    ticketClasses: [{ name: "General", currency: "USD", faceValue: "20.00", quantity: "900" }],
    eventDayContact: { name: "Gate Lead", phone: "0775555555" },
    gateControl: "app",
    insurance: { insurer: "Old Mutual", coverAmount: "100000", expiry: "2027-01-01" },
  };

  async function approvedOrganiser(deps: TestPartnerDeps) {
    const created = await createPartner(deps, { ...busInput, type: "event_organiser", organiserType: "promoter", contactEmail: "main@live.example" });
    if (!created.ok) throw new Error();
    const p = created.partner;
    await upload(deps, { partnerId: null, slot: "master_terms_events", source: "bullion" });
    expect((await sendInvitation(deps, p.id)).ok).toBe(true);
    await saveKyc(deps, p.id, organiser);
    for (const slot of ["incorporation", "ids", "tax_clearance", "bank_letter:USD", "bank_letter:ZAR", "track_record", "signed_master_terms"]) {
      await upload(deps, { partnerId: p.id, slot });
    }
    expect(await submitKyc(deps, p.id)).toEqual({ ok: true });
    expect(deps.sent.some((m) => m.subject.includes("Integration Standard"))).toBe(false);
    await upload(deps, { partnerId: p.id, slot: "executed_agreement", source: "bullion" });
    await adminAction(deps, p.id, "approve");
    return p;
  }

  it("cannot submit events before approval", async () => {
    const deps = await makePartnerDeps();
    const created = await createPartner(deps, { ...busInput, type: "event_organiser", organiserType: "venue" });
    if (!created.ok) throw new Error();
    await expect(createEvent(deps, created.partner.id)).rejects.toThrow(/approved/);
  });

  it("runs an event from submission to approval with its own Order Form", async () => {
    const deps = await makePartnerDeps();
    const p = await approvedOrganiser(deps);
    const e = await createEvent(deps, p.id);
    await saveEvent(deps, p.id, e.id, event);
    const first = await submitEvent(deps, p.id, e.id);
    expect(!first.ok && first.problems.map((x) => x.path)).toContain("doc:venue_contract");
    for (const slot of ["venue_contract", "permits", "capacity_certificate", "gate_plan", "liability_insurance", "refund_policy"]) {
      await upload(deps, { partnerId: p.id, eventId: e.id, slot });
    }
    expect(await submitEvent(deps, p.id, e.id)).toEqual({ ok: true });
    await expect(adminEventAction(deps, p.id, e.id, "send_order_form")).rejects.toThrow(/Event Order Form first/);
    await upload(deps, { partnerId: p.id, eventId: e.id, slot: "event_order_form", source: "bullion" });
    await adminEventAction(deps, p.id, e.id, "send_order_form");
    await expect(adminEventAction(deps, p.id, e.id, "approve")).rejects.toThrow(/signed Event Order Form/);
    await upload(deps, { partnerId: p.id, eventId: e.id, slot: "signed_event_order_form" });
    await upload(deps, { partnerId: p.id, eventId: e.id, slot: "executed_event_order_form", source: "bullion" });
    const approved = await adminEventAction(deps, p.id, e.id, "approve");
    expect(approved.status).toBe("approved");
    expect(deps.sheetRows.at(-1)?.options).toEqual({ sheet: "Events", key: "Reference" });
    expect(Object.fromEntries(deps.sheetRows.at(-1)!.row).Reference).toBe("EO-0001-E01");
  });

  it("refuses ticket classes that add up to more than the licensed capacity", async () => {
    const deps = await makePartnerDeps();
    const p = await approvedOrganiser(deps);
    const e = await createEvent(deps, p.id);
    await saveEvent(deps, p.id, e.id, { ...event, ticketClasses: [{ name: "General", currency: "USD", faceValue: "20", quantity: "1200" }] });
    const result = await submitEvent(deps, p.id, e.id);
    expect(!result.ok && result.problems.some((x) => x.message.includes("licensed capacity"))).toBe(true);
  });
});

describe("reminders", () => {
  it("reminds twice, on day 2 and day 5, and stops once submitted", async () => {
    const deps = await makePartnerDeps();
    const p = await invitedBus(deps);
    const day = 24 * 3600 * 1000;
    const start = deps.clock.now.getTime();
    deps.clock.now = new Date(start + 1 * day);
    expect(await sendReminders(deps)).toBe(0);
    deps.clock.now = new Date(start + 2 * day);
    expect(await sendReminders(deps)).toBe(1);
    expect(await sendReminders(deps)).toBe(0);
    deps.clock.now = new Date(start + 5 * day);
    expect(await sendReminders(deps)).toBe(1);
    deps.clock.now = new Date(start + 9 * day);
    expect(await sendReminders(deps)).toBe(0);
    await deps.db.update(partners).set({ status: "submitted" }).where(eq(partners.id, p.id));
  });
});

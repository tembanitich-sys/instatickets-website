import { z } from "zod";
import {
  CURRENCY_CODES,
  busSlots,
  contractSlots,
  currencyShort,
  eventSlots,
  organiserSlots,
  type Currency,
  type PartnerType,
} from "@content/onboarding";
import { toE164 } from "../phone";

/*
 * The typed KYC data. Saving a draft keeps whatever the partner typed (trimmed and length
 * limited); submitting checks everything and returns a list of problems, each with the path
 * of the field it belongs to so the form can show it in place.
 */

const text = (max = 200) =>
  z
    .unknown()
    .transform((v) => (typeof v === "string" ? v.trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").slice(0, max) : ""));
const flag = z.unknown().transform((v) => v === true);
const currencies = z
  .unknown()
  .transform((v) => (Array.isArray(v) ? [...new Set(v.filter((c): c is Currency => CURRENCY_CODES.includes(c as Currency)))] : []));
const list = <T extends z.ZodTypeAny>(item: T, max: number) =>
  z.unknown().transform((v) => (Array.isArray(v) ? v.slice(0, max).map((x) => item.parse(x ?? {}) as z.output<T>) : []));
/** An object whose every field always parses (a missing field gets its default). */
const obj = <S extends Record<string, z.ZodTypeAny>>(shape: S) =>
  z.unknown().transform((v) => {
    const src = (v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(shape).map(([k, parser]) => [k, parser.parse(src[k])])) as {
      [K in keyof S]: z.output<S[K]>;
    };
  });

const contact = obj({ name: text(150), email: text(254), phone: text(40) });
const linkedContact = obj({ same: flag, name: text(150), email: text(254), phone: text(40) });
const account = obj({
  currency: text(3),
  bank: text(150),
  branch: text(150),
  accountName: text(200),
  accountNumber: text(60),
});
const signatory = obj({ name: text(150), role: text(100), phone: text(40), email: text(254) });

export const busKycSchema = obj({
  company: obj({
    legalName: text(200),
    tradingName: text(200),
    registrationNumber: text(60),
    noticeAddress: text(400),
    operatorLicenceNumber: text(100),
    segment: text(20),
    fleetSize: text(5),
  }),
  system: obj({ name: text(150), provider: text(150) }),
  contacts: obj({ finance: contact, operations: linkedContact, technical: linkedContact }),
  routes: list(
    obj({ origin: text(100), destination: text(100), kind: text(20), operatingSince: text(7), currencies }),
    40,
  ),
  accounts: list(account, 4),
  signatories: list(signatory, 2),
  customerService: obj({ complaintsPhone: text(40), complaintsEmail: text(254), refundPolicyUrl: text(300) }),
  expiry: obj({ taxClearance: text(10), insurance: text(10) }),
  declarations: obj({ true: flag, honour: flag }),
});
export type BusKyc = z.output<typeof busKycSchema>;

export const organiserKycSchema = obj({
  company: obj({
    legalName: text(200),
    tradingName: text(200),
    registrationNumber: text(60),
    organiserType: text(20),
    noticeAddress: text(400),
  }),
  contacts: obj({ main: contact, eventDay: linkedContact, finance: linkedContact }),
  currencies,
  accounts: list(account, 4),
  signatories: list(signatory, 2),
  trackRecord: obj({
    events: list(obj({ name: text(150), date: text(10), venue: text(150), attendance: text(10) }), 3),
    depositInstead: flag,
  }),
  expiry: obj({ taxClearance: text(10) }),
  declarations: obj({ true: flag, capacity: flag }),
});
export type OrganiserKyc = z.output<typeof organiserKycSchema>;

export const eventDataSchema = obj({
  name: text(200),
  type: text(20),
  startDate: text(10),
  endDate: text(10),
  gatesOpen: text(5),
  venueName: text(200),
  venueAddress: text(400),
  licensedCapacity: text(7),
  ageRestrictions: text(300),
  salesOpen: text(10),
  salesClose: text(10),
  allocation: text(10),
  allocationQuantity: text(7),
  currencies,
  ticketClasses: list(
    obj({ name: text(100), currency: text(3), faceValue: text(12), quantity: text(7), notes: text(200) }),
    20,
  ),
  sanctionBody: text(200),
  eventDayContact: obj({ name: text(150), phone: text(40) }),
  gateControl: text(20),
  gateSystemName: text(150),
  insurance: obj({ insurer: text(150), coverAmount: text(30), expiry: text(10) }),
});
export type EventData = z.output<typeof eventDataSchema>;

export const parseKyc = (type: PartnerType, raw: unknown) =>
  type === "bus_operator" ? busKycSchema.parse(raw ?? {}) : organiserKycSchema.parse(raw ?? {});

// --- Submission checks --------------------------------------------------------

export type Problem = { path: string; message: string };

const isEmail = (v: string) => z.email().safeParse(v).success;
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isMonth = (v: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
const isWhole = (v: string, min = 1) => /^\d+$/.test(v) && Number(v) >= min;
const isAmount = (v: string) => /^\d+(\.\d{1,2})?$/.test(v);
export const normalisePhone = (v: string) => (v ? toE164("ZW", v) : null);

class Checker {
  problems: Problem[] = [];
  need(path: string, value: string, label: string) {
    if (!value) this.problems.push({ path, message: `${label} is missing.` });
    return !!value;
  }
  check(ok: boolean, path: string, message: string) {
    if (!ok) this.problems.push({ path, message });
  }
  contact(path: string, c: { name: string; email: string; phone: string }, label: string) {
    this.need(`${path}.name`, c.name, `${label} name`);
    if (this.need(`${path}.email`, c.email, `${label} email`)) this.check(isEmail(c.email), `${path}.email`, `${label} email is not a valid email address.`);
    if (this.need(`${path}.phone`, c.phone, `${label} phone`)) this.check(!!normalisePhone(c.phone), `${path}.phone`, `${label} phone is not a valid phone number.`);
  }
  accounts(accounts: { currency: string; bank: string; branch: string; accountName: string; accountNumber: string }[], needed: Currency[]) {
    if (needed.length === 0) this.problems.push({ path: "accounts", message: "Choose at least one currency." });
    for (const cur of needed) {
      const i = accounts.findIndex((a) => a.currency === cur);
      const label = `${currencyShort(cur)} settlement account`;
      if (i < 0) {
        this.problems.push({ path: `accounts.${cur}`, message: `${label} is missing.` });
        continue;
      }
      const a = accounts[i];
      this.need(`accounts.${cur}.bank`, a.bank, `${label}: bank`);
      this.need(`accounts.${cur}.branch`, a.branch, `${label}: branch`);
      this.need(`accounts.${cur}.accountName`, a.accountName, `${label}: account name`);
      this.need(`accounts.${cur}.accountNumber`, a.accountNumber, `${label}: account number`);
    }
  }
  signatories(list: { name: string; role: string; phone: string; email: string }[]) {
    for (const i of [0, 1]) {
      const s = list[i] ?? { name: "", role: "", phone: "", email: "" };
      const label = `Signatory ${i + 1}`;
      this.need(`signatories.${i}.name`, s.name, `${label} name`);
      this.need(`signatories.${i}.role`, s.role, `${label} role`);
      if (this.need(`signatories.${i}.email`, s.email, `${label} email`)) this.check(isEmail(s.email), `signatories.${i}.email`, `${label} email is not valid.`);
      if (this.need(`signatories.${i}.phone`, s.phone, `${label} phone`)) this.check(!!normalisePhone(s.phone), `signatories.${i}.phone`, `${label} phone is not valid.`);
    }
  }
}

/** Every currency a bus operator prices at least one route in. */
export const busCurrencies = (k: BusKyc): Currency[] =>
  CURRENCY_CODES.filter((c) => k.routes.some((r) => r.currencies.includes(c)));

export function checkBusKyc(k: BusKyc): Problem[] {
  const c = new Checker();
  c.need("company.legalName", k.company.legalName, "Registered company name");
  c.need("company.registrationNumber", k.company.registrationNumber, "Company registration number");
  c.need("company.noticeAddress", k.company.noticeAddress, "Notice address");
  c.need("company.operatorLicenceNumber", k.company.operatorLicenceNumber, "Operator licence number");
  c.check(["local", "cross_border", "both"].includes(k.company.segment), "company.segment", "Choose which routes you run.");
  c.check(isWhole(k.company.fleetSize), "company.fleetSize", "Fleet size must be a whole number of buses.");
  c.need("system.name", k.system.name, "Ticketing system name");
  c.need("system.provider", k.system.provider, "Ticketing system provider");
  c.contact("contacts.finance", k.contacts.finance, "Finance contact");
  if (!k.contacts.operations.same) c.contact("contacts.operations", k.contacts.operations, "Operations contact");
  if (!k.contacts.technical.same) c.contact("contacts.technical", k.contacts.technical, "Technical contact");
  if (k.routes.length === 0) c.problems.push({ path: "routes", message: "Add at least one route." });
  k.routes.forEach((r, i) => {
    const label = `Route ${i + 1}`;
    c.need(`routes.${i}.origin`, r.origin, `${label}: from`);
    c.need(`routes.${i}.destination`, r.destination, `${label}: to`);
    c.check(["local", "cross_border"].includes(r.kind), `routes.${i}.kind`, `${label}: choose local or cross-border.`);
    c.check(isMonth(r.operatingSince), `routes.${i}.operatingSince`, `${label}: enter the month operations started.`);
    c.check(r.currencies.length > 0, `routes.${i}.currencies`, `${label}: choose at least one fare currency.`);
  });
  c.accounts(k.accounts, busCurrencies(k));
  c.signatories(k.signatories);
  if (c.need("customerService.complaintsPhone", k.customerService.complaintsPhone, "Complaints phone")) {
    c.check(!!normalisePhone(k.customerService.complaintsPhone), "customerService.complaintsPhone", "Complaints phone is not valid.");
  }
  if (c.need("customerService.complaintsEmail", k.customerService.complaintsEmail, "Complaints email")) {
    c.check(isEmail(k.customerService.complaintsEmail), "customerService.complaintsEmail", "Complaints email is not valid.");
  }
  c.check(isDate(k.expiry.taxClearance), "expiry.taxClearance", "Enter the tax clearance expiry date.");
  c.check(isDate(k.expiry.insurance), "expiry.insurance", "Enter the passenger insurance expiry date.");
  c.check(k.declarations.true, "declarations.true", "Confirm the information is true and complete.");
  c.check(k.declarations.honour, "declarations.honour", "Confirm you will honour every ticket sold.");
  return c.problems;
}

export function checkOrganiserKyc(k: OrganiserKyc): Problem[] {
  const c = new Checker();
  c.need("company.legalName", k.company.legalName, "Registered name");
  c.need("company.registrationNumber", k.company.registrationNumber, "Registration number");
  c.check(
    ["organiser", "promoter", "venue", "sports_body"].includes(k.company.organiserType),
    "company.organiserType",
    "Choose your organiser type.",
  );
  c.need("company.noticeAddress", k.company.noticeAddress, "Notice address");
  c.contact("contacts.main", k.contacts.main, "Main contact");
  if (!k.contacts.eventDay.same) c.contact("contacts.eventDay", k.contacts.eventDay, "Event-day contact");
  if (!k.contacts.finance.same) c.contact("contacts.finance", k.contacts.finance, "Finance contact");
  c.accounts(k.accounts, k.currencies);
  c.signatories(k.signatories);
  if (!k.trackRecord.depositInstead) {
    c.check(k.trackRecord.events.length > 0, "trackRecord", "Add a past event, or tick that you will provide a deposit or guarantee.");
    k.trackRecord.events.forEach((e, i) => {
      c.need(`trackRecord.events.${i}.name`, e.name, `Past event ${i + 1}: name`);
      c.check(isDate(e.date), `trackRecord.events.${i}.date`, `Past event ${i + 1}: enter the date.`);
      c.need(`trackRecord.events.${i}.venue`, e.venue, `Past event ${i + 1}: venue`);
    });
  }
  c.check(isDate(k.expiry.taxClearance), "expiry.taxClearance", "Enter the tax clearance expiry date.");
  c.check(k.declarations.true, "declarations.true", "Confirm the information is true and complete.");
  c.check(k.declarations.capacity, "declarations.capacity", "Confirm you will never sell beyond licensed capacity.");
  return c.problems;
}

const sports = (e: EventData) => e.type === "sports_fixture" || e.type === "season";

export function checkEvent(e: EventData): Problem[] {
  const c = new Checker();
  c.need("name", e.name, "Event name");
  c.check(["concert", "festival", "conference", "exhibition", "sports_fixture", "season"].includes(e.type), "type", "Choose the event type.");
  c.check(isDate(e.startDate), "startDate", "Enter the event date.");
  if (e.endDate) c.check(isDate(e.endDate) && e.endDate >= e.startDate, "endDate", "The end date must be on or after the start date.");
  c.check(/^\d{2}:\d{2}$/.test(e.gatesOpen), "gatesOpen", "Enter the gate opening time.");
  c.need("venueName", e.venueName, "Venue");
  c.need("venueAddress", e.venueAddress, "Venue address");
  c.check(isWhole(e.licensedCapacity), "licensedCapacity", "Enter the licensed capacity.");
  c.check(isDate(e.salesOpen), "salesOpen", "Enter the date sales open.");
  c.check(isDate(e.salesClose) && e.salesClose >= e.salesOpen, "salesClose", "Sales must close on or after they open.");
  c.check(["all", "fixed"].includes(e.allocation), "allocation", "Choose the InstaTickets allocation.");
  if (e.allocation === "fixed") c.check(isWhole(e.allocationQuantity), "allocationQuantity", "Enter how many tickets InstaTickets sells.");
  c.check(e.currencies.length > 0, "currencies", "Choose at least one currency.");
  if (e.ticketClasses.length === 0) c.problems.push({ path: "ticketClasses", message: "Add at least one ticket class." });
  let total = 0;
  e.ticketClasses.forEach((t, i) => {
    const label = `Ticket class ${i + 1}`;
    c.need(`ticketClasses.${i}.name`, t.name, `${label}: name`);
    c.check(e.currencies.includes(t.currency as Currency), `ticketClasses.${i}.currency`, `${label}: choose one of the event's currencies.`);
    c.check(isAmount(t.faceValue), `ticketClasses.${i}.faceValue`, `${label}: enter the face value, for example 25.00.`);
    c.check(isWhole(t.quantity), `ticketClasses.${i}.quantity`, `${label}: enter the quantity.`);
    total += Number(t.quantity) || 0;
  });
  if (isWhole(e.licensedCapacity)) {
    c.check(total <= Number(e.licensedCapacity), "ticketClasses", "Ticket quantities add up to more than the licensed capacity.");
  }
  if (sports(e)) c.need("sanctionBody", e.sanctionBody, "Sanctioning governing body, league or club");
  c.need("eventDayContact.name", e.eventDayContact.name, "Event-day contact name");
  if (c.need("eventDayContact.phone", e.eventDayContact.phone, "Event-day contact phone")) {
    c.check(!!normalisePhone(e.eventDayContact.phone), "eventDayContact.phone", "Event-day contact phone is not valid.");
  }
  c.check(["app", "approved_system"].includes(e.gateControl), "gateControl", "Choose how gate entry is validated.");
  if (e.gateControl === "approved_system") c.need("gateSystemName", e.gateSystemName, "Gate system name");
  c.need("insurance.insurer", e.insurance.insurer, "Insurer");
  c.need("insurance.coverAmount", e.insurance.coverAmount, "Cover amount");
  c.check(isDate(e.insurance.expiry), "insurance.expiry", "Enter the insurance expiry date.");
  return c.problems;
}

// --- Document checklists ------------------------------------------------------

export type RequiredSlot = { slot: string; label: string; multiple: boolean; optional?: boolean; hint?: string };

const expand = (defs: typeof busSlots, cur: Currency[]): RequiredSlot[] =>
  defs.flatMap((d): RequiredSlot[] =>
    d.perCurrency
      ? cur.map((c) => ({ slot: `${d.slot}:${c}`, label: `${d.label} (${currencyShort(c)} account)`, multiple: false }))
      : [{ slot: d.slot, label: d.label, multiple: !!d.multiple, hint: d.hint }],
  );

/** Documents the partner uploads, in checklist order. */
export function partnerChecklist(
  type: PartnerType,
  kyc: BusKyc | OrganiserKyc,
  opts: { anchorAddendum: boolean },
): RequiredSlot[] {
  if (type === "bus_operator") {
    const k = kyc as BusKyc;
    return expand(busSlots, busCurrencies(k)).map((s) =>
      s.slot === "refund_policy" ? { ...s, optional: !!k.customerService.refundPolicyUrl } : s,
    );
  }
  void opts;
  return expand(organiserSlots, (kyc as OrganiserKyc).currencies);
}

/** Signed copies the partner uploads with its submission. */
export function signedChecklist(type: PartnerType, opts: { anchorAddendum: boolean }): RequiredSlot[] {
  const s = contractSlots;
  if (type === "event_organiser") return [{ slot: s.signedMaster.slot, label: s.signedMaster.label, multiple: false }];
  return [
    { slot: s.signedMaster.slot, label: s.signedMaster.label, multiple: false },
    { slot: s.signedOrderForm.slot, label: s.signedOrderForm.label, multiple: false },
    ...(opts.anchorAddendum ? [{ slot: s.signedAddendum.slot, label: s.signedAddendum.label, multiple: false }] : []),
  ];
}

export function eventChecklist(e: EventData): RequiredSlot[] {
  return eventSlots
    .filter((d) => d.slot !== "fixture_confirmation" || sports(e))
    .map((d) => ({ slot: d.slot, label: d.label, multiple: !!d.multiple, optional: d.slot === "ticket_plan" }));
}

/** Problems for every required slot with no file. */
export function missingDocuments(slots: RequiredSlot[], uploaded: Set<string>): Problem[] {
  return slots
    .filter((s) => !s.optional && !uploaded.has(s.slot))
    .map((s) => ({ path: `doc:${s.slot}`, message: `Upload: ${s.label}.` }));
}

/** Slots a partner may upload into right now (anything on its checklists). */
export function allowedPartnerSlots(type: PartnerType, kyc: BusKyc | OrganiserKyc, anchorAddendum: boolean): Set<string> {
  const all = [
    ...expand(type === "bus_operator" ? busSlots : organiserSlots, [...CURRENCY_CODES]),
    ...signedChecklist(type, { anchorAddendum }),
  ];
  void kyc;
  return new Set(all.map((s) => s.slot));
}

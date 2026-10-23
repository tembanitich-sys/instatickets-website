import { contact, operators } from "@content/site";
import { OPERATOR_MAIL, type EmailMessage } from "../email";
import type { AgentInput, BusinessInput, ContactInput, OperatorInput } from "./schemas";

const yn = (v: boolean) => (v ? "Yes" : "No");
const list = (v: readonly string[]) => (v.length ? v.join(", ") : "-");
const or = (v: string | null | undefined) => v || "-";

function lines(rows: [string, string][]): string {
  return rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}

// Notification emails are plain text with fixed subjects, so nothing a visitor
// types can alter the subject line or inject markup.

/** Built from the stored record, so an update shows what is now on file. */
export type StoredCustomer = {
  id: string;
  isNew: boolean;
  firstName: string;
  lastName: string;
  phoneE164: string;
  email: string | null;
  interests: string[];
  marketingConsent: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

export function customerEmail(row: StoredCustomer): EmailMessage {
  return {
    to: contact.registrationsEmail,
    subject: row.isNew ? "New customer pre-registration" : "Customer pre-registration updated",
    replyTo: row.email ?? undefined,
    text: lines([
      ["Name", `${row.firstName} ${row.lastName}`],
      ["Mobile", row.phoneE164],
      ["Email", or(row.email)],
      ["Interested in", list(row.interests)],
      ["Marketing consent", yn(row.marketingConsent)],
      ["Source", `${or(row.utmSource)} / ${or(row.utmMedium)} / ${or(row.utmCampaign)}`],
      ["Record", row.id],
    ]),
  };
}

export function businessEmail(input: BusinessInput, meta: { id: string }): EmailMessage {
  return {
    to: contact.registrationsEmail,
    subject: "New business registration",
    replyTo: input.email,
    text: lines([
      ["Organisation", input.organisationName],
      ["Contact person", input.contactPerson],
      ["Mobile", input.phoneE164 ?? "-"],
      ["Email", input.email],
      ["Business type", input.businessType],
      ["Offering", list(input.offerings)],
      ["Has a ticketing system", or(input.hasTicketingSystem)],
      ["Ticketing system", or(input.ticketingSystemName)],
      ["Website", or(input.website)],
      ["Marketing consent (email)", yn(input.marketingConsent)],
      ["Source", `${or(input.utmSource)} / ${or(input.utmMedium)} / ${or(input.utmCampaign)}`],
      ["Record", meta.id],
      ["Details", `\n${or(input.details)}`],
    ]),
  };
}

export function agentEmail(input: AgentInput, meta: { id: string }): EmailMessage {
  return {
    to: contact.registrationsEmail,
    subject: "New InstaTickets Agent application",
    replyTo: input.email ?? undefined,
    text: lines([
      ["Name", input.fullName],
      ["Mobile", input.phoneE164 ?? "-"],
      ["Email", or(input.email)],
      ["Applying as", input.applicantType],
      ["Business or trading name", or(input.businessName)],
      ["Province", input.province],
      ["Town or city", input.town],
      ["Would sell at", input.sellingLocation],
      ["Has smartphone or tablet", yn(input.hasDevice)],
      ["Marketing consent", yn(input.marketingConsent)],
      ["Source", `${or(input.utmSource)} / ${or(input.utmMedium)} / ${or(input.utmCampaign)}`],
      ["Record", meta.id],
      ["Details", `\n${or(input.details)}`],
    ]),
  };
}

export function contactEmail(input: ContactInput, meta: { id: string }): EmailMessage {
  return {
    to: contact.email,
    subject: "New website enquiry",
    replyTo: input.email,
    text: lines([
      ["Name", input.name],
      ["Email", input.email],
      ["Phone", or(input.phoneE164)],
      ["Enquiry type", input.enquiryType],
      ["Record", meta.id],
      ["Message", `\n${input.message}`],
    ]),
  };
}

const label = (options: readonly { value: string; label: string }[], value: string | null) =>
  options.find((o) => o.value === value)?.label ?? value ?? "-";

/** Readable labels for one operator registration, shared by the email and the Google Sheet. */
export function operatorFields(input: OperatorInput, meta: { ref: string; createdAt: Date }): [string, string][] {
  const t = operators.form;
  return [
    ["Reference", meta.ref],
    ["Received", meta.createdAt.toISOString()],
    ["Company", input.companyName],
    ["Trading name", or(input.tradingName)],
    ["Contact person", input.contactPerson],
    ["Role", or(input.contactRole)],
    ["Mobile", input.phoneE164 ?? "-"],
    ["Email", input.email],
    ["Fleet size", String(input.fleetSize)],
    ["Route type", label(t.routeTypes, input.routeType)],
    ["Main routes", input.mainRoutes],
    ["Has ticketing system", label(t.ticketingOptions, input.hasTicketingSystem)],
    ["Ticketing system", or(input.ticketingSystemName)],
    ["Currencies", list(input.currencies)],
    ["Heard from", label(t.heardFromOptions, input.heardFrom)],
    ["Marketing consent", yn(input.marketingConsent)],
    ["Source", `${or(input.utmSource)} / ${or(input.utmMedium)} / ${or(input.utmCampaign)}`],
    ["Details", or(input.details)],
  ];
}

/** To the onboarding team (accounts@ and tich@). Replying goes straight to the operator. */
export function operatorEmail(input: OperatorInput, meta: { id: string; ref: string; createdAt: Date }): EmailMessage {
  const rows = operatorFields(input, meta);
  const details = rows.pop()!;
  return {
    to: OPERATOR_MAIL.notify,
    // The reference is generated by us, so it is safe in the subject; nothing the visitor typed is.
    subject: `New bus operator registration ${meta.ref}`,
    replyTo: input.email,
    text: lines([...rows, ["Record", meta.id], [details[0], `\n${details[1]}`]]),
  };
}

/** Confirmation to the operator, sent from accounts@ so their reply reaches the onboarding team. */
export function operatorAutoReply(input: OperatorInput, meta: { ref: string }): EmailMessage {
  const a = operators.autoReply;
  return {
    to: input.email,
    from: OPERATOR_MAIL.from,
    replyTo: OPERATOR_MAIL.replyTo,
    subject: a.subject(meta.ref),
    text: a.body({ contactPerson: input.contactPerson, companyName: input.companyName, ref: meta.ref }),
  };
}

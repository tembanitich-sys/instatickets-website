import { contact } from "@content/site";
import type { EmailMessage } from "../email";
import type { BusinessInput, ContactInput } from "./schemas";

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

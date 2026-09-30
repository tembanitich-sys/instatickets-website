import { sql } from "drizzle-orm";
import { PRIVACY_NOTICE_VERSION } from "@content/site";
import type { Db } from "../db/client";
import { businessRegistrations, contactEnquiries, customerPreregistrations } from "../db/schema";
import type { BusinessInput, ContactInput, CustomerInput } from "./schemas";

/** Consent is recorded with its moment; withdrawing it clears both. */
const consent = (given: boolean, now: Date) => ({
  marketingConsent: given,
  marketingConsentAt: given ? now : null,
});

/**
 * Inserts a pre-registration, or, if the phone number (E.164) is already on
 * file, updates that record. The latest submission wins for interests and
 * marketing consent; a blank email never erases one already given. Name and
 * first-touch campaign values stay as first recorded.
 */
export async function saveCustomer(db: Db, input: CustomerInput, now: Date) {
  const c = customerPreregistrations;
  const [row] = await db
    .insert(c)
    .values({
      firstName: input.firstName,
      lastName: input.lastName,
      phoneE164: input.phoneE164!,
      email: input.email,
      interests: input.interests,
      ...consent(input.marketingConsent, now),
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: c.phoneE164,
      set: {
        email: sql`coalesce(excluded.email, ${c.email})`,
        interests: input.interests,
        ...consent(input.marketingConsent, now),
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        utmSource: sql`coalesce(${c.utmSource}, excluded.utm_source)`,
        utmMedium: sql`coalesce(${c.utmMedium}, excluded.utm_medium)`,
        utmCampaign: sql`coalesce(${c.utmCampaign}, excluded.utm_campaign)`,
        updatedAt: now,
      },
    })
    // Return the row as stored (an update keeps the original name and email), so
    // the notification shows the record, not just the latest submission.
    // xmax is 0 only for a freshly inserted row.
    .returning({
      id: c.id,
      isNew: sql<boolean>`(xmax = 0)`,
      firstName: c.firstName,
      lastName: c.lastName,
      phoneE164: c.phoneE164,
      email: c.email,
      interests: c.interests,
      marketingConsent: c.marketingConsent,
      utmSource: c.utmSource,
      utmMedium: c.utmMedium,
      utmCampaign: c.utmCampaign,
    });
  return row;
}

export async function saveBusiness(db: Db, input: BusinessInput, now: Date) {
  const [row] = await db
    .insert(businessRegistrations)
    .values({
      organisationName: input.organisationName,
      contactPerson: input.contactPerson,
      phoneE164: input.phoneE164!,
      email: input.email,
      businessType: input.businessType,
      offerings: input.offerings,
      hasTicketingSystem: input.hasTicketingSystem,
      ticketingSystemName: input.ticketingSystemName,
      website: input.website,
      details: input.details,
      ...consent(input.marketingConsent, now),
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      createdAt: now,
    })
    .returning({ id: businessRegistrations.id });
  return row;
}

export async function saveContact(db: Db, input: ContactInput, now: Date) {
  const [row] = await db
    .insert(contactEnquiries)
    .values({
      name: input.name,
      email: input.email,
      phoneE164: input.phoneE164,
      enquiryType: input.enquiryType,
      message: input.message,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      createdAt: now,
    })
    .returning({ id: contactEnquiries.id });
  return row;
}

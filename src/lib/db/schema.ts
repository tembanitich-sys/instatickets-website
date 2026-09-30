import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** Key/value settings editable from the admin page (Phase 4). */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

/**
 * Customer pre-registrations. `phone_e164` is unique: a repeat registration with
 * the same number updates this row instead of adding another.
 */
export const customerPreregistrations = pgTable(
  "customer_preregistrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phoneE164: text("phone_e164").notNull().unique(),
    email: text("email"),
    /** Any of "bus", "events", "sports". */
    interests: text("interests").array().notNull().default([]),
    marketingConsent: boolean("marketing_consent").notNull().default(false),
    marketingConsentAt: timestamp("marketing_consent_at", { withTimezone: true }),
    privacyNoticeVersion: text("privacy_notice_version").notNull(),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("customer_preregistrations_created_at_idx").on(t.createdAt)],
);

/** Business expressions of interest. Every submission is a new row. */
export const businessRegistrations = pgTable(
  "business_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationName: text("organisation_name").notNull(),
    contactPerson: text("contact_person").notNull(),
    phoneE164: text("phone_e164").notNull(),
    email: text("email").notNull(),
    businessType: text("business_type").notNull(),
    /** Any of "bus", "events", "sports", "other". */
    offerings: text("offerings").array().notNull().default([]),
    /** "yes", "no" or "not_sure"; null if not answered. */
    hasTicketingSystem: text("has_ticketing_system"),
    ticketingSystemName: text("ticketing_system_name"),
    website: text("website"),
    details: text("details"),
    marketingConsent: boolean("marketing_consent").notNull().default(false),
    marketingConsentAt: timestamp("marketing_consent_at", { withTimezone: true }),
    privacyNoticeVersion: text("privacy_notice_version").notNull(),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    createdAt: createdAt(),
  },
  (t) => [index("business_registrations_created_at_idx").on(t.createdAt)],
);

export const contactEnquiries = pgTable(
  "contact_enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    /** Optional on the contact form. */
    phoneE164: text("phone_e164"),
    enquiryType: text("enquiry_type").notNull(),
    message: text("message").notNull(),
    privacyNoticeVersion: text("privacy_notice_version").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("contact_enquiries_created_at_idx").on(t.createdAt)],
);

import { count, desc, or, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import type { Db } from "../db/client";
import {
  adminAudit,
  businessRegistrations as b,
  contactEnquiries as e,
  customerPreregistrations as c,
  siteSettings,
} from "../db/schema";

export const PAGE_SIZE = 50;

export type Column = {
  /** Property name on the Drizzle row. */
  key: string;
  /** Column heading in the admin list. */
  label: string;
  /** Header in the CSV export: the database column name, for easy import later. */
  header: string;
  /** Long free text: shown collapsed in the list. */
  long?: boolean;
};

export type TableDef = {
  slug: "customers" | "businesses" | "enquiries" | "settings" | "audit";
  title: string;
  table: PgTable;
  /** Newest first. */
  order: AnyPgColumn;
  search: AnyPgColumn[];
  /** Phone columns, searched by their digits so "077 123 4567" finds "+263771234567". */
  phoneSearch: AnyPgColumn[];
  columns: Column[];
};

const col = (key: string, label: string, header: string, long = false): Column => ({ key, label, header, long });

export const TABLES: Record<TableDef["slug"], TableDef> = {
  customers: {
    slug: "customers",
    title: "Customer pre-registrations",
    table: c,
    order: c.createdAt,
    search: [c.firstName, c.lastName, c.phoneE164, c.email, c.interests],
    phoneSearch: [c.phoneE164],
    columns: [
      col("createdAt", "Registered", "created_at"),
      col("firstName", "First name", "first_name"),
      col("lastName", "Last name", "last_name"),
      col("phoneE164", "Mobile", "phone_e164"),
      col("email", "Email", "email"),
      col("interests", "Interested in", "interests"),
      col("marketingConsent", "Marketing consent", "marketing_consent"),
      col("marketingConsentAt", "Consent given", "marketing_consent_at"),
      col("privacyNoticeVersion", "Notice version", "privacy_notice_version"),
      col("utmSource", "utm source", "utm_source"),
      col("utmMedium", "utm medium", "utm_medium"),
      col("utmCampaign", "utm campaign", "utm_campaign"),
      col("updatedAt", "Last updated", "updated_at"),
      col("id", "ID", "id"),
    ],
  },
  businesses: {
    slug: "businesses",
    title: "Business registrations",
    table: b,
    order: b.createdAt,
    search: [
      b.organisationName,
      b.contactPerson,
      b.phoneE164,
      b.email,
      b.businessType,
      b.ticketingSystemName,
      b.website,
      b.details,
    ],
    phoneSearch: [b.phoneE164],
    columns: [
      col("createdAt", "Received", "created_at"),
      col("organisationName", "Organisation", "organisation_name"),
      col("contactPerson", "Contact person", "contact_person"),
      col("phoneE164", "Mobile", "phone_e164"),
      col("email", "Email", "email"),
      col("businessType", "Business type", "business_type"),
      col("offerings", "Offering", "offerings"),
      col("hasTicketingSystem", "Has ticketing system", "has_ticketing_system"),
      col("ticketingSystemName", "Ticketing system", "ticketing_system_name"),
      col("website", "Website", "website"),
      col("details", "Details", "details", true),
      col("marketingConsent", "Marketing consent", "marketing_consent"),
      col("marketingConsentAt", "Consent given", "marketing_consent_at"),
      col("privacyNoticeVersion", "Notice version", "privacy_notice_version"),
      col("utmSource", "utm source", "utm_source"),
      col("utmMedium", "utm medium", "utm_medium"),
      col("utmCampaign", "utm campaign", "utm_campaign"),
      col("id", "ID", "id"),
    ],
  },
  enquiries: {
    slug: "enquiries",
    title: "Contact enquiries",
    table: e,
    order: e.createdAt,
    search: [e.name, e.email, e.phoneE164, e.enquiryType, e.message],
    phoneSearch: [e.phoneE164],
    columns: [
      col("createdAt", "Received", "created_at"),
      col("name", "Name", "name"),
      col("email", "Email", "email"),
      col("phoneE164", "Phone", "phone_e164"),
      col("enquiryType", "Enquiry type", "enquiry_type"),
      col("message", "Message", "message", true),
      col("privacyNoticeVersion", "Notice version", "privacy_notice_version"),
      col("id", "ID", "id"),
    ],
  },
  settings: {
    slug: "settings",
    title: "Site settings",
    table: siteSettings,
    order: siteSettings.updatedAt,
    search: [siteSettings.key, siteSettings.value],
    phoneSearch: [],
    columns: [
      col("key", "Setting", "key"),
      col("value", "Value", "value"),
      col("updatedAt", "Updated", "updated_at"),
      col("updatedBy", "Updated by", "updated_by"),
    ],
  },
  audit: {
    slug: "audit",
    title: "Audit log",
    table: adminAudit,
    order: adminAudit.createdAt,
    search: [adminAudit.action, adminAudit.details],
    phoneSearch: [],
    columns: [
      col("createdAt", "When", "created_at"),
      col("action", "Action", "action"),
      col("details", "Details", "details", true),
      col("id", "ID", "id"),
    ],
  },
};

export function getTableDef(slug: string): TableDef | undefined {
  return Object.hasOwn(TABLES, slug) ? TABLES[slug as TableDef["slug"]] : undefined;
}

/** Makes %, _ and \ in the search text match literally instead of acting as wildcards. */
const escapeLike = (text: string) => text.replace(/[\\%_]/g, "\\$&");

const contains = (column: AnyPgColumn, fragment: string): SQL =>
  sql`${column}::text ilike ${`%${escapeLike(fragment)}%`} escape '\\'`;

/** Search text to SQL, or undefined for no filter. */
export function searchCondition(def: TableDef, query: string): SQL | undefined {
  const q = query.trim().slice(0, 100);
  if (!q) return undefined;
  const conditions = def.search.map((column) => contains(column, q));

  // Phone numbers are stored as +263771234567; people search "0771234567" or "077 123 4567".
  const digits = q.replace(/[\s()-]/g, "").replace(/^\+/, "").replace(/^0+/, "");
  if (/^\d{4,}$/.test(digits)) for (const column of def.phoneSearch) conditions.push(contains(column, digits));

  return or(...conditions);
}

export async function listRows(db: Db, def: TableDef, opts: { q?: string; page?: number }) {
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const where = searchCondition(def, opts.q ?? "");
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(def.table)
      .where(where)
      .orderBy(desc(def.order))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE) as Promise<Record<string, unknown>[]>,
    db.select({ total: count() }).from(def.table).where(where),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function allRows(db: Db, def: TableDef) {
  return (await db.select().from(def.table).orderBy(desc(def.order))) as Record<string, unknown>[];
}

export async function countRows(db: Db, def: TableDef): Promise<number> {
  const [{ total }] = await db.select({ total: count() }).from(def.table);
  return total;
}

/** One value as plain text, for the list and the CSV alike. */
export function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

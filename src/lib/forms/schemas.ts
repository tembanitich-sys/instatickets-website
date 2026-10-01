import { z } from "zod";
import { formMessages as m } from "@content/site";
import { toE164 } from "../phone";

export type FieldErrors = Record<string, string>;
/** Raw submitted values, echoed back to the form when it has errors. */
export type Values = Record<string, string | string[]>;

export type Parsed<T> =
  | { ok: true; data: T; values: Values }
  | { ok: false; fieldErrors: FieldErrors; values: Values };

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const MULTILINE_CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

const line = (max: number, required: string) =>
  z
    .string()
    .trim()
    .min(1, required)
    .max(max, m.tooLong)
    .refine((v) => !CONTROL_CHARS.test(v), required);

const optionalLine = (max: number) =>
  z
    .string()
    .trim()
    .max(max, m.tooLong)
    .refine((v) => !CONTROL_CHARS.test(v), m.tooLong)
    .transform((v) => v || null);

const isEmail = (v: string) => z.email().safeParse(v).success;

const email = (required: string) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .min(1, required)
    .max(254, m.email)
    .refine(isEmail, m.email);

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, m.email)
  .refine((v) => v === "" || isEmail(v), m.email)
  .transform((v) => v || null);

const utm = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().slice(0, 100) : ""),
  z.string().transform((v) => v || null),
);

/** "example.com" is accepted and becomes "https://example.com". */
const optionalWebsite = z
  .string()
  .trim()
  .max(300, m.tooLong)
  .transform((v, ctx) => {
    if (!v) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`;
    try {
      const url = new URL(withScheme);
      if ((url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".")) return url.toString();
    } catch {
      // falls through to the issue below
    }
    ctx.addIssue({ code: "custom", message: m.website });
    return z.NEVER;
  });

const phone = { phoneCountry: z.string(), phoneNational: z.string() };

const privacy = z.literal(true, { error: m.privacy });

const customerSchema = z.object({
    firstName: line(100, m.firstName),
    lastName: line(100, m.lastName),
    ...phone,
    email: optionalEmail,
    interests: z.array(z.enum(["bus", "events", "sports"], { error: m.invalidChoice })),
    marketingConsent: z.boolean(),
    privacyAccepted: privacy,
    utmSource: utm,
    utmMedium: utm,
    utmCampaign: utm,
});

const OFFERINGS = ["bus", "events", "sports", "other"] as const;
const BUSINESS_TYPES = [
  "bus_operator",
  "event_organiser",
  "sports_organisation",
  "venue",
  "ticketing_platform",
  "other",
] as const;

const businessSchema = z.object({
    organisationName: line(200, m.organisationName),
    contactPerson: line(150, m.contactPerson),
    ...phone,
    email: email(m.emailRequired),
    businessType: z.enum(BUSINESS_TYPES, { error: m.businessType }),
    offerings: z.array(z.enum(OFFERINGS, { error: m.invalidChoice })),
    hasTicketingSystem: z
      .enum(["yes", "no", "not_sure", ""], { error: m.invalidChoice })
      .transform((v) => v || null),
    ticketingSystemName: optionalLine(200),
    website: optionalWebsite,
    details: z
      .string()
      .trim()
      .max(2000, m.tooLong)
      .refine((v) => !MULTILINE_CONTROL_CHARS.test(v), m.tooLong)
      .transform((v) => v || null),
    marketingConsent: z.boolean(),
    privacyAccepted: privacy,
    utmSource: utm,
    utmMedium: utm,
    utmCampaign: utm,
});

const ENQUIRY_TYPES = [
  "general",
  "business_partnership",
  "bus_operator",
  "event",
  "sports",
  "ticketing_integration",
  "technical",
  "other",
] as const;

const contactSchema = z.object({
    name: line(150, m.name),
    email: email(m.emailRequired),
    ...phone,
    enquiryType: z.enum(ENQUIRY_TYPES, { error: m.enquiryType }),
    message: z
      .string()
      .trim()
      .min(1, m.message)
      .max(3000, m.tooLong)
      .refine((v) => !MULTILINE_CONTROL_CHARS.test(v), m.message),
    privacyAccepted: privacy,
});

const APPLICANT_TYPES = [
  "individual",
  "registered_business",
  "shop_or_supermarket",
  "existing_agent",
  "bus_operator_office",
  "other",
] as const;
const PROVINCES = [
  "Bulawayo",
  "Harare",
  "Manicaland",
  "Mashonaland Central",
  "Mashonaland East",
  "Mashonaland West",
  "Masvingo",
  "Matabeleland North",
  "Matabeleland South",
  "Midlands",
] as const;
const SELLING_LOCATIONS = ["shop_or_premises", "market_stall", "office", "no_fixed_premises", "other"] as const;

const agentSchema = z.object({
    fullName: line(150, m.name),
    ...phone,
    email: optionalEmail,
    applicantType: z.enum(APPLICANT_TYPES, { error: m.applicantType }),
    businessName: optionalLine(200),
    province: z.enum(PROVINCES, { error: m.province }),
    town: line(100, m.town),
    sellingLocation: z.enum(SELLING_LOCATIONS, { error: m.sellingLocation }),
    hasDevice: z.enum(["yes", "no"], { error: m.hasDevice }).transform((v) => v === "yes"),
    details: z
      .string()
      .trim()
      .max(2000, m.tooLong)
      .refine((v) => !MULTILINE_CONTROL_CHARS.test(v), m.tooLong)
      .transform((v) => v || null),
    marketingConsent: z.boolean(),
    privacyAccepted: privacy,
    utmSource: utm,
    utmMedium: utm,
    utmCampaign: utm,
});

// --- FormData helpers -------------------------------------------------------

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};
const all = (fd: FormData, key: string) =>
  [...new Set(fd.getAll(key).filter((v): v is string => typeof v === "string"))];
/** A checkbox is ticked only if the browser sent it. Never ticked by default. */
const checked = (fd: FormData, key: string) => fd.get(key) !== null;

/**
 * Validates with the schema and, separately, the phone number, so every field
 * error is reported at once (a schema refinement would be skipped whenever
 * another field had already failed).
 */
function run<S extends z.ZodType<{ phoneCountry: string; phoneNational: string }>>(
  schema: S,
  input: { phoneCountry: string; phoneNational: string } & Record<string, unknown>,
  values: Values,
  phoneRequired: boolean,
): Parsed<z.output<S> & { phoneE164: string | null }> {
  const result = schema.safeParse(input);
  const fieldErrors: FieldErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (key === "phoneNational" || key === "phoneCountry") continue;
      fieldErrors[key] ??= issue.message;
    }
  }

  const national = input.phoneNational.trim();
  const phoneE164 = national ? toE164(input.phoneCountry, national) : null;
  if (national ? !phoneE164 : phoneRequired) {
    fieldErrors.phone = phoneRequired ? m.phone : m.phoneOptional;
  }

  if (!result.success || Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors, values };
  return { ok: true, data: { ...result.data, phoneE164 }, values };
}

const echo = (fd: FormData, singles: string[], multis: string[], checks: string[]): Values => {
  const values: Values = {};
  for (const k of singles) values[k] = str(fd, k);
  for (const k of multis) values[k] = all(fd, k);
  for (const k of checks) if (checked(fd, k)) values[k] = "on";
  return values;
};

export function parseCustomer(fd: FormData) {
  const singles = ["firstName", "lastName", "phoneCountry", "phoneNational", "email"];
  const values = echo(fd, singles, ["interests"], ["marketingConsent", "privacyAccepted"]);
  return run(
    customerSchema,
    {
      firstName: str(fd, "firstName"),
      lastName: str(fd, "lastName"),
      phoneCountry: str(fd, "phoneCountry"),
      phoneNational: str(fd, "phoneNational"),
      email: str(fd, "email"),
      interests: all(fd, "interests"),
      marketingConsent: checked(fd, "marketingConsent"),
      privacyAccepted: checked(fd, "privacyAccepted"),
      utmSource: fd.get("utm_source"),
      utmMedium: fd.get("utm_medium"),
      utmCampaign: fd.get("utm_campaign"),
    },
    values,
    true,
  );
}

export function parseBusiness(fd: FormData) {
  const singles = [
    "organisationName",
    "contactPerson",
    "phoneCountry",
    "phoneNational",
    "email",
    "businessType",
    "hasTicketingSystem",
    "ticketingSystemName",
    "website",
    "details",
  ];
  const values = echo(fd, singles, ["offerings"], ["marketingConsent", "privacyAccepted"]);
  return run(
    businessSchema,
    {
      organisationName: str(fd, "organisationName"),
      contactPerson: str(fd, "contactPerson"),
      phoneCountry: str(fd, "phoneCountry"),
      phoneNational: str(fd, "phoneNational"),
      email: str(fd, "email"),
      businessType: str(fd, "businessType"),
      offerings: all(fd, "offerings"),
      hasTicketingSystem: str(fd, "hasTicketingSystem"),
      ticketingSystemName: str(fd, "ticketingSystemName"),
      website: str(fd, "website"),
      details: str(fd, "details"),
      marketingConsent: checked(fd, "marketingConsent"),
      privacyAccepted: checked(fd, "privacyAccepted"),
      utmSource: fd.get("utm_source"),
      utmMedium: fd.get("utm_medium"),
      utmCampaign: fd.get("utm_campaign"),
    },
    values,
    true,
  );
}

export function parseContact(fd: FormData) {
  const values = echo(
    fd,
    ["name", "email", "phoneCountry", "phoneNational", "enquiryType", "message"],
    [],
    ["privacyAccepted"],
  );
  return run(
    contactSchema,
    {
      name: str(fd, "name"),
      email: str(fd, "email"),
      phoneCountry: str(fd, "phoneCountry"),
      phoneNational: str(fd, "phoneNational"),
      enquiryType: str(fd, "enquiryType"),
      message: str(fd, "message"),
      privacyAccepted: checked(fd, "privacyAccepted"),
    },
    values,
    false,
  );
}

export function parseAgent(fd: FormData) {
  const singles = [
    "fullName",
    "phoneCountry",
    "phoneNational",
    "email",
    "applicantType",
    "businessName",
    "province",
    "town",
    "sellingLocation",
    "hasDevice",
    "details",
  ];
  const values = echo(fd, singles, [], ["marketingConsent", "privacyAccepted"]);
  return run(
    agentSchema,
    {
      fullName: str(fd, "fullName"),
      phoneCountry: str(fd, "phoneCountry"),
      phoneNational: str(fd, "phoneNational"),
      email: str(fd, "email"),
      applicantType: str(fd, "applicantType"),
      businessName: str(fd, "businessName"),
      province: str(fd, "province"),
      town: str(fd, "town"),
      sellingLocation: str(fd, "sellingLocation"),
      hasDevice: str(fd, "hasDevice"),
      details: str(fd, "details"),
      marketingConsent: checked(fd, "marketingConsent"),
      privacyAccepted: checked(fd, "privacyAccepted"),
      utmSource: fd.get("utm_source"),
      utmMedium: fd.get("utm_medium"),
      utmCampaign: fd.get("utm_campaign"),
    },
    values,
    true,
  );
}

export type CustomerInput = Extract<ReturnType<typeof parseCustomer>, { ok: true }>["data"];
export type BusinessInput = Extract<ReturnType<typeof parseBusiness>, { ok: true }>["data"];
export type AgentInput = Extract<ReturnType<typeof parseAgent>, { ok: true }>["data"];
export type ContactInput = Extract<ReturnType<typeof parseContact>, { ok: true }>["data"];

import { vi } from "vitest";
import type { Db } from "@/lib/db/client";
import type { EmailMessage } from "@/lib/email";
import type { Deps } from "@/lib/forms/submit";
import { createMemoryLimiter } from "@/lib/ratelimit";
import { TURNSTILE_FIELD } from "@/lib/turnstile";
import { createTestDb } from "./test-db";

export type TestDeps = Omit<Deps, "db"> &
  Pick<Deps, "notify"> & {
    sent: EmailMessage[];
    errors: unknown[][];
    db: Db;
  };

/** Real migrations on an in-memory Postgres; everything external is a fake. */
export async function makeDeps(overrides: Partial<Deps> = {}): Promise<TestDeps> {
  const sent: EmailMessage[] = [];
  const errors: unknown[][] = [];
  const db = await createTestDb();
  const deps: Deps = {
    db,
    notify: async (m) => {
      sent.push(m);
    },
    verifyTurnstile: async (token) => token === "valid-token",
    rateLimiter: createMemoryLimiter({ limit: 5, windowMs: 600_000 }),
    ipSalt: "test-salt",
    log: { error: (...args: unknown[]) => void errors.push(args) },
    now: () => new Date(),
    ...overrides,
  };
  return Object.assign(deps, { sent, errors }) as TestDeps;
}

export function form(fields: Record<string, string | string[] | true | undefined>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (value === true) fd.append(key, "on");
    else if (Array.isArray(value)) for (const v of value) fd.append(key, v);
    else fd.append(key, value);
  }
  return fd;
}

export const validCustomer = {
  firstName: "Tendai",
  lastName: "Moyo",
  phoneCountry: "ZW",
  phoneNational: "771234567",
  email: "",
  interests: ["bus"],
  privacyAccepted: true as const,
  [TURNSTILE_FIELD]: "valid-token",
};

export const validBusiness = {
  organisationName: "Example Coaches",
  contactPerson: "A Contact",
  phoneCountry: "ZW",
  phoneNational: "771234567",
  email: "ops@example.com",
  businessType: "bus_operator",
  offerings: ["bus"],
  hasTicketingSystem: "no",
  privacyAccepted: true as const,
  [TURNSTILE_FIELD]: "valid-token",
};

export const validAgent = {
  fullName: "Rudo Chikwanha",
  phoneCountry: "ZW",
  phoneNational: "771234567",
  email: "",
  applicantType: "shop_or_supermarket",
  businessName: "",
  province: "Harare",
  town: "Chitungwiza",
  sellingLocation: "shop_or_premises",
  hasDevice: "yes",
  privacyAccepted: true as const,
  [TURNSTILE_FIELD]: "valid-token",
};

export const validContact = {
  name: "A Visitor",
  email: "visitor@example.com",
  phoneCountry: "ZW",
  phoneNational: "",
  enquiryType: "general",
  message: "Hello there",
  privacyAccepted: true as const,
  [TURNSTILE_FIELD]: "valid-token",
};

export const ctx = { ip: "203.0.113.7" };
export { vi };

import type { EmailMessage } from "@/lib/email";
import { createMemoryFileStore } from "@/lib/partners/files";
import { recordDocument, type PartnerDeps } from "@/lib/partners/service";
import type { SheetOptions, SheetRow } from "@/lib/sheets";
import { createTestDb } from "./test-db";

export type TestPartnerDeps = PartnerDeps & {
  sent: EmailMessage[];
  errors: unknown[][];
  sheetRows: { row: SheetRow; options?: SheetOptions }[];
  files: ReturnType<typeof createMemoryFileStore>;
  clock: { now: Date };
};

export async function makePartnerDeps(overrides: Partial<PartnerDeps> = {}): Promise<TestPartnerDeps> {
  const sent: EmailMessage[] = [];
  const errors: unknown[][] = [];
  const sheetRows: { row: SheetRow; options?: SheetOptions }[] = [];
  const clock = { now: new Date("2026-10-26T08:00:00Z") };
  const deps = {
    db: await createTestDb(),
    files: createMemoryFileStore(),
    notify: async (m: EmailMessage) => void sent.push(m),
    sheet: async (row: SheetRow, options?: SheetOptions) => void sheetRows.push({ row, options }),
    log: { error: (...args: unknown[]) => void errors.push(args) },
    now: () => clock.now,
    portalUrl: "https://operators.example.test",
    adminUrl: "https://www.example.test/admin",
    ...overrides,
  };
  return Object.assign(deps, { sent, errors, sheetRows, clock }) as TestPartnerDeps;
}

/** Puts a file in the fake storage and records it, as the browser upload would. */
export async function upload(
  deps: TestPartnerDeps,
  opts: { partnerId: string | null; slot: string; eventId?: string | null; source?: "partner" | "bullion"; multiple?: boolean; type?: string; size?: number },
) {
  const prefix = opts.partnerId ? `partners/${opts.partnerId}/` : "library/";
  const pathname = `${prefix}${opts.slot.replace(":", "-")}/${Math.random().toString(36).slice(2)}.pdf`;
  deps.files.files.set(pathname, { data: Buffer.alloc(opts.size ?? 100, 1), contentType: opts.type ?? "application/pdf" });
  return recordDocument(deps, {
    partnerId: opts.partnerId,
    eventId: opts.eventId ?? null,
    slot: opts.slot,
    source: opts.source ?? "partner",
    pathname,
    fileName: `${opts.slot}.pdf`,
    multiple: opts.multiple ?? false,
  });
}

export const fullBusKyc = (financeEmail: string) => ({
  company: {
    legalName: "Tamuka Coaches (Pvt) Ltd",
    tradingName: "Tamuka Coaches",
    registrationNumber: "1234/2015",
    noticeAddress: "1 Road Port, Harare",
    operatorLicenceNumber: "OL-778",
    segment: "both",
    fleetSize: "18",
  },
  system: { name: "TicketMaster Pro", provider: "Acme Systems" },
  contacts: {
    finance: { name: "Rudo Finance", email: financeEmail, phone: "0771234567" },
    operations: { same: true, name: "", email: "", phone: "" },
    technical: { same: false, name: "Tafadzwa Tech", email: "tech@tamuka.example", phone: "+263772000111" },
  },
  routes: [
    { origin: "Harare", destination: "Johannesburg", kind: "cross_border", operatingSince: "2020-01", currencies: ["USD", "ZAR"] },
    { origin: "Harare", destination: "Bulawayo", kind: "local", operatingSince: "2019-05", currencies: ["USD", "ZWG"] },
    { origin: "Bulawayo", destination: "Gaborone", kind: "cross_border", operatingSince: "2021-03", currencies: ["BWP"] },
  ],
  accounts: ["USD", "ZAR", "ZWG", "BWP", "XXX"].map((c) => ({
    currency: c,
    bank: "TN CyberTech Bank",
    branch: "Harare",
    accountName: "Tamuka Coaches",
    accountNumber: `ACC-${c}-998877`,
  })),
  signatories: [
    { name: "Director One", role: "Director", phone: "0771111111", email: "d1@tamuka.example" },
    { name: "Director Two", role: "Director", phone: "0772222222", email: "d2@tamuka.example" },
  ],
  customerService: { complaintsPhone: "0773333333", complaintsEmail: "care@tamuka.example", refundPolicyUrl: "https://tamuka.example/refunds" },
  expiry: { taxClearance: "2027-03-31", insurance: "2027-06-30" },
  declarations: { true: true, honour: true },
});

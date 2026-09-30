import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { adminAudit, businessRegistrations, contactEnquiries, customerPreregistrations, siteSettings } from "@/lib/db/schema";
import { writeAudit } from "@/lib/admin/audit";
import { adminConfigProblem, getAdminConfig } from "@/lib/admin/config";
import { csvField, toCsv } from "@/lib/admin/csv";
import { exportTable } from "@/lib/admin/export";
import { attemptLogin, type LoginDeps } from "@/lib/admin/login";
import { LOCKOUT_WINDOW_MS, MAX_FAILED_ATTEMPTS, createMemoryLockoutStore } from "@/lib/admin/lockout";
import { SESSION_TTL_SECONDS, createSessionToken, safeEqual, verifySessionToken } from "@/lib/admin/session";
import { INVALID_URL_MESSAGE, saveGetStartedLink } from "@/lib/admin/settings";
import { PAGE_SIZE, TABLES, getTableDef, listRows, searchCondition } from "@/lib/admin/tables";
import { DEFAULT_GET_STARTED_URL, GET_STARTED_KEY, readGetStartedUrl } from "@/lib/settings";
import { createTestDb } from "./helpers/test-db";

const config = { password: "correct horse battery staple", sessionSecret: "s".repeat(40) };

describe("admin configuration", () => {
  it("is unavailable unless a strong password and secret are set", () => {
    expect(getAdminConfig({})).toBeNull();
    expect(getAdminConfig({ ADMIN_PASSWORD: "short", ADMIN_SESSION_SECRET: "s".repeat(40) })).toBeNull();
    expect(getAdminConfig({ ADMIN_PASSWORD: "long enough password", ADMIN_SESSION_SECRET: "tooshort" })).toBeNull();
    expect(adminConfigProblem({ ADMIN_PASSWORD: "long enough password" })).toMatch(/SESSION_SECRET/);
    expect(getAdminConfig({ ADMIN_PASSWORD: config.password, ADMIN_SESSION_SECRET: config.sessionSecret })).toEqual(config);
  });
});

describe("session cookie", () => {
  const now = Date.UTC(2026, 9, 1, 8, 0, 0);

  it("accepts a fresh token", () => {
    expect(verifySessionToken(config, createSessionToken(config, now), now + 1000)).toBe(true);
  });

  it("expires after its lifetime", () => {
    const token = createSessionToken(config, now);
    expect(verifySessionToken(config, token, now + (SESSION_TTL_SECONDS - 1) * 1000)).toBe(true);
    expect(verifySessionToken(config, token, now + (SESSION_TTL_SECONDS + 1) * 1000)).toBe(false);
  });

  it("rejects tampered, forged, malformed and empty tokens", () => {
    const token = createSessionToken(config, now);
    const [payload, sig] = token.split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ exp: 9_999_999_999 })).toString("base64url");
    for (const bad of [
      `${forgedPayload}.${sig}`, // valid signature, different payload
      `${payload}.${sig.slice(0, -2)}xx`,
      `${payload}`,
      `${payload}.${sig}.extra`,
      "",
      "garbage",
    ]) {
      expect(verifySessionToken(config, bad, now)).toBe(false);
    }
    expect(verifySessionToken(config, undefined, now)).toBe(false);
  });

  it("is invalidated when the password or the secret changes", () => {
    const token = createSessionToken(config, now);
    expect(verifySessionToken({ ...config, password: "a different long password" }, token, now)).toBe(false);
    expect(verifySessionToken({ ...config, sessionSecret: "t".repeat(40) }, token, now)).toBe(false);
  });

  it("compares secrets without leaking length", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "x")).toBe(false);
  });
});

function loginDeps(overrides: Partial<LoginDeps> = {}) {
  const warnings: unknown[][] = [];
  const clock = { now: Date.UTC(2026, 9, 1, 8, 0, 0) };
  const deps: LoginDeps = {
    config,
    lockout: createMemoryLockoutStore(() => clock.now),
    verifyTurnstile: async (t) => t === "valid-token",
    db: null,
    ipSalt: "salt",
    log: { error: () => {}, warn: (...a: unknown[]) => void warnings.push(a) },
    now: () => clock.now,
    ...overrides,
  };
  return { deps, warnings, clock };
}
const attempt = (deps: LoginDeps, password: string, extra: { turnstileToken?: string; ip?: string | null } = {}) =>
  attemptLogin(deps, {
    password,
    turnstileToken: extra.turnstileToken ?? "valid-token",
    ip: extra.ip === undefined ? "203.0.113.7" : extra.ip,
  });

describe("admin sign-in", () => {
  it("signs in with the right password and returns a valid session", async () => {
    const { deps, clock } = loginDeps();
    const result = await attempt(deps, config.password);
    expect(result.ok).toBe(true);
    if (result.ok) expect(verifySessionToken(config, result.token, clock.now)).toBe(true);
  });

  it("refuses a wrong password, and the log does not contain it", async () => {
    const { deps, warnings } = loginDeps();
    expect(await attempt(deps, "wrong password entirely")).toEqual({ ok: false, reason: "invalid" });
    expect(JSON.stringify(warnings)).not.toContain("wrong password");
  });

  it("is unavailable when the admin area is not configured", async () => {
    const { deps } = loginDeps({ config: null });
    expect(await attempt(deps, config.password)).toEqual({ ok: false, reason: "unavailable" });
  });

  it("requires Turnstile, and a failed check does not count as a wrong password", async () => {
    const { deps } = loginDeps();
    expect(await attempt(deps, config.password, { turnstileToken: "" })).toEqual({ ok: false, reason: "captcha" });
    expect(await attempt(deps, config.password, { turnstileToken: "forged" })).toEqual({ ok: false, reason: "captcha" });
    for (let i = 0; i < 10; i++) await attempt(deps, config.password, { turnstileToken: "forged" });
    expect((await attempt(deps, config.password)).ok).toBe(true);
  });

  it("locks out after repeated failures, even for the correct password", async () => {
    const { deps } = loginDeps();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      expect(await attempt(deps, `guess ${i}`)).toEqual({ ok: false, reason: "invalid" });
    }
    expect(await attempt(deps, config.password)).toEqual({ ok: false, reason: "locked" });
    expect(await attempt(deps, "another guess")).toEqual({ ok: false, reason: "locked" });
  });

  it("lifts the lockout when the window passes, and only affects that visitor", async () => {
    const { deps, clock } = loginDeps();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await attempt(deps, "nope");
    expect((await attempt(deps, config.password)).ok).toBe(false);
    expect((await attempt(deps, config.password, { ip: "198.51.100.9" })).ok).toBe(true);
    clock.now += LOCKOUT_WINDOW_MS + 1;
    expect((await attempt(deps, config.password)).ok).toBe(true);
  });

  it("resets the failure count after a successful sign-in", async () => {
    const { deps } = loginDeps();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i++) await attempt(deps, "nope");
    expect((await attempt(deps, config.password)).ok).toBe(true);
    for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i++) await attempt(deps, "nope");
    expect((await attempt(deps, config.password)).ok).toBe(true);
  });

  it("records the sign-in in the audit log, but does not fail if that cannot be written", async () => {
    const db = await createTestDb();
    const { deps } = loginDeps({ db });
    await attempt(deps, config.password);
    expect((await db.select().from(adminAudit)).map((r) => r.action)).toEqual(["login"]);

    const broken = { insert: () => { throw new Error("db down"); } } as never;
    const { deps: deps2 } = loginDeps({ db: broken });
    expect((await attempt(deps2, config.password)).ok).toBe(true);
  });
});

describe("CSV", () => {
  it("quotes commas, quotes and line breaks", () => {
    expect(csvField("plain")).toBe("plain");
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("neutralises formulas from form entries but leaves E.164 phone numbers exact", () => {
    for (const evil of ["=HYPERLINK(\"http://x\")", "+cmd|' /C calc'!A0", "-2+3", "@SUM(A1)", "\tTAB", "\rCR"]) {
      expect(csvField(evil).replace(/^"/, "").startsWith("'")).toBe(true);
    }
    expect(csvField("+263771234567")).toBe("+263771234567");
    expect(csvField("+27821234567")).toBe("+27821234567");
    expect(csvField("+263 77 123")).toBe("'+263 77 123");
    expect(csvField("+1")).toBe("'+1");
  });

  it("joins rows with CRLF and a trailing newline", () => {
    expect(toCsv(["a", "b"], [["1", "2"], ["3", "4"]])).toBe("a,b\r\n1,2\r\n3,4\r\n");
  });
});

async function seed() {
  const db = await createTestDb();
  const base = { privacyNoticeVersion: "2026-10-pre-launch" };
  await db.insert(customerPreregistrations).values([
    { ...base, firstName: "Tendai", lastName: "Moyo", phoneE164: "+263771234567", email: "tendai@example.com", interests: ["bus", "events"], createdAt: new Date("2026-10-01T08:00:00Z") },
    { ...base, firstName: "Chipo", lastName: "Ncube", phoneE164: "+263712345678", email: null, interests: ["sports"], createdAt: new Date("2026-10-03T08:00:00Z") },
    { ...base, firstName: "=EVIL()", lastName: "100%", phoneE164: "+27821234567", email: "x@example.com", interests: [], createdAt: new Date("2026-10-02T08:00:00Z") },
  ]);
  await db.insert(businessRegistrations).values({ ...base, organisationName: "Example Coaches", contactPerson: "A Contact", phoneE164: "+263771111111", email: "ops@example.com", businessType: "bus_operator", offerings: ["bus"], details: "Harare to Bulawayo, 60 seats" });
  await db.insert(contactEnquiries).values({ ...base, name: "A Visitor", email: "v@example.com", phoneE164: null, enquiryType: "general", message: "Hello, is there a route to Mutare?" });
  return db;
}

describe("admin lists", () => {
  it("show newest first", async () => {
    const db = await seed();
    const { rows, total } = await listRows(db, TABLES.customers, {});
    expect(total).toBe(3);
    expect(rows.map((r) => r.firstName)).toEqual(["Chipo", "=EVIL()", "Tendai"]);
  });

  it("search names, emails and other columns, ignoring case", async () => {
    const db = await seed();
    const names = async (q: string) => (await listRows(db, TABLES.customers, { q })).rows.map((r) => r.firstName);
    expect(await names("tendai")).toEqual(["Tendai"]);
    expect(await names("NCUBE")).toEqual(["Chipo"]);
    expect(await names("x@example")).toEqual(["=EVIL()"]);
    expect(await names("sports")).toEqual(["Chipo"]);
    expect(await names("nobody")).toEqual([]);
  });

  it("find a phone number however it is typed", async () => {
    const db = await seed();
    const names = async (q: string) => (await listRows(db, TABLES.customers, { q })).rows.map((r) => r.firstName);
    for (const q of ["0771234567", "077 123 4567", "+263771234567", "771234567", "(077) 123-4567"]) {
      expect(await names(q)).toEqual(["Tendai"]);
    }
  });

  it("treat % and _ as ordinary characters, not wildcards", async () => {
    const db = await seed();
    expect((await listRows(db, TABLES.customers, { q: "%" })).rows.map((r) => r.lastName)).toEqual(["100%"]);
    expect((await listRows(db, TABLES.customers, { q: "_" })).rows).toHaveLength(0);
    expect((await listRows(db, TABLES.customers, { q: "\\" })).rows).toHaveLength(0);
  });

  it("search the other tables too", async () => {
    const db = await seed();
    expect((await listRows(db, TABLES.businesses, { q: "bulawayo" })).total).toBe(1);
    expect((await listRows(db, TABLES.enquiries, { q: "mutare" })).total).toBe(1);
    expect((await listRows(db, TABLES.enquiries, { q: "0771234567" })).total).toBe(0);
  });

  it("paginate", async () => {
    const db = await createTestDb();
    const base = { privacyNoticeVersion: "v", firstName: "N", lastName: "N", interests: [] as string[] };
    await db.insert(customerPreregistrations).values(
      Array.from({ length: PAGE_SIZE + 5 }, (_, i) => ({
        ...base,
        phoneE164: `+2637712${String(i).padStart(5, "0")}`,
        createdAt: new Date(Date.UTC(2026, 9, 1, 0, 0, i)),
      })),
    );
    const p1 = await listRows(db, TABLES.customers, { page: 1 });
    const p2 = await listRows(db, TABLES.customers, { page: 2 });
    expect([p1.rows.length, p2.rows.length, p1.pages, p1.total]).toEqual([PAGE_SIZE, 5, 2, PAGE_SIZE + 5]);
    expect(p1.rows[0].phoneE164).toBe(`+2637712${String(PAGE_SIZE + 4).padStart(5, "0")}`);
  });

  it("only knows the listed tables", () => {
    expect(getTableDef("customers")).toBeDefined();
    expect(getTableDef("users")).toBeUndefined();
    expect(getTableDef("__proto__")).toBeUndefined();
    expect(getTableDef("constructor")).toBeUndefined();
    expect(searchCondition(TABLES.customers, "   ")).toBeUndefined();
  });
});

describe("CSV export", () => {
  it("exports every row with E.164 phone numbers, database headers and safe cells", async () => {
    const db = await seed();
    const { csv, rows, filename } = await exportTable(db, TABLES.customers, new Date("2026-10-05T10:00:00Z"));
    expect(rows).toBe(3);
    expect(filename).toBe("instatickets-customers-2026-10-05.csv");
    const lines = csv.trimEnd().split("\r\n");
    expect(lines[0]).toBe(
      "created_at,first_name,last_name,phone_e164,email,interests,marketing_consent,marketing_consent_at,privacy_notice_version,utm_source,utm_medium,utm_campaign,updated_at,id",
    );
    expect(lines).toHaveLength(4);
    expect(lines[1]).toContain(",+263712345678,"); // newest first, phone exactly as stored
    expect(lines[3]).toContain(",+263771234567,tendai@example.com,bus; events,false,");
    expect(lines[2]).toContain("'=EVIL()"); // formula neutralised
    expect(lines[2]).toContain(",+27821234567,");
  });

  it("records the export in the audit log with the table and row count only", async () => {
    const db = await seed();
    await exportTable(db, TABLES.customers, new Date());
    await exportTable(db, TABLES.enquiries, new Date());
    const audit = await db.select().from(adminAudit);
    expect(audit.map((a) => [a.action, a.details])).toEqual(
      expect.arrayContaining([
        ["export", { table: "customers", rows: 3 }],
        ["export", { table: "enquiries", rows: 1 }],
      ]),
    );
    expect(JSON.stringify(audit)).not.toContain("tendai");
    expect(JSON.stringify(audit)).not.toContain("+263");
  });

  it("does not export anything if the audit row cannot be written", async () => {
    const db = await seed();
    // Reads work, but every insert (the audit row) fails.
    const failingAudit = new Proxy(db, {
      get: (target, prop, receiver) =>
        prop === "insert"
          ? () => {
              throw new Error("audit log unavailable");
            }
          : Reflect.get(target, prop, receiver),
    });
    await expect(exportTable(failingAudit, TABLES.customers, new Date())).rejects.toThrow("audit log unavailable");
  });

  it("exports all five tables", async () => {
    const db = await seed();
    await writeAudit(db, "login");
    for (const def of Object.values(TABLES)) {
      const { csv } = await exportTable(db, def, new Date());
      expect(csv.split("\r\n")[0]).toBe(def.columns.map((c) => c.header).join(","));
    }
  });
});

describe("GET STARTED setting editor", () => {
  it("saves a link, makes it live for the site, and audits old and new values", async () => {
    const db = await createTestDb();
    expect(await saveGetStartedLink(db, "  https://app.instatickets.co.zw/start  ")).toEqual({
      ok: true,
      value: "https://app.instatickets.co.zw/start",
    });
    expect(await readGetStartedUrl(db)).toBe("https://app.instatickets.co.zw/start");
    await saveGetStartedLink(db, "https://app.instatickets.co.zw/welcome");
    expect(await readGetStartedUrl(db)).toBe("https://app.instatickets.co.zw/welcome");

    const audit = (await db.select().from(adminAudit)).filter((a) => a.action === "settings.update");
    expect(audit.map((a) => a.details)).toEqual(
      expect.arrayContaining([
        { key: GET_STARTED_KEY, from: null, to: "https://app.instatickets.co.zw/start" },
        { key: GET_STARTED_KEY, from: "https://app.instatickets.co.zw/start", to: "https://app.instatickets.co.zw/welcome" },
      ]),
    );
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, GET_STARTED_KEY));
    expect(row.updatedBy).toBe("admin");
  });

  it("rejects anything that is not an https link, and records nothing", async () => {
    const db = await createTestDb();
    for (const bad of ["http://example.com", "javascript:alert(1)", "example.com", "//evil.example", "https://" + "a".repeat(2100)]) {
      expect(await saveGetStartedLink(db, bad)).toEqual({ ok: false, error: INVALID_URL_MESSAGE });
    }
    expect(await db.select().from(siteSettings)).toHaveLength(0);
    expect(await db.select().from(adminAudit)).toHaveLength(0);
  });

  it("resets to the WhatsApp default when left empty", async () => {
    const db = await createTestDb();
    await saveGetStartedLink(db, "https://example.com/go");
    expect(await saveGetStartedLink(db, "   ")).toEqual({ ok: true, value: null });
    expect(await readGetStartedUrl(db)).toBe(DEFAULT_GET_STARTED_URL);
    const audit = (await db.select().from(adminAudit)).map((a) => a.details);
    expect(audit).toContainEqual({ key: GET_STARTED_KEY, from: "https://example.com/go", to: null });
  });
});

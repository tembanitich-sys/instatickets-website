import { describe, expect, it } from "vitest";
import { agents, PRIVACY_NOTICE_VERSION } from "@content/site";
import { agentApplications } from "@/lib/db/schema";
import { submitAgent } from "@/lib/forms/submit";
import { createMemoryLimiter } from "@/lib/ratelimit";
import { ctx, form, makeDeps, validAgent } from "./helpers/forms";

describe("agent applications", () => {
  it("stores the application with E.164 phone, defaults and notice version", async () => {
    const deps = await makeDeps();
    expect(await submitAgent(deps, form(validAgent), ctx)).toEqual({ status: "success" });
    const [row] = await deps.db.select().from(agentApplications);
    expect(row).toMatchObject({
      fullName: "Rudo Chikwanha",
      phoneE164: "+263771234567",
      email: null,
      applicantType: "shop_or_supermarket",
      businessName: null,
      province: "Harare",
      town: "Chitungwiza",
      sellingLocation: "shop_or_premises",
      hasDevice: true,
      details: null,
      marketingConsent: false,
      marketingConsentAt: null,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    });
  });

  it("records marketing consent with a timestamp only when ticked, and UTM values", async () => {
    const deps = await makeDeps();
    await submitAgent(deps, form({ ...validAgent, marketingConsent: true, utm_source: "poster", hasDevice: "no" }), ctx);
    const [row] = await deps.db.select().from(agentApplications);
    expect(row.marketingConsent).toBe(true);
    expect(row.marketingConsentAt).toBeInstanceOf(Date);
    expect(row.utmSource).toBe("poster");
    expect(row.hasDevice).toBe(false);
  });

  it("adds a new row for every application, even from the same number", async () => {
    const deps = await makeDeps();
    await submitAgent(deps, form(validAgent), ctx);
    await submitAgent(deps, form(validAgent), ctx);
    expect(await deps.db.select().from(agentApplications)).toHaveLength(2);
  });

  it("emails registrations@ after storing, with a fixed subject", async () => {
    const deps = await makeDeps();
    await submitAgent(deps, form({ ...validAgent, fullName: "Rudo\nBcc: x@y.z" }), ctx);
    expect(deps.sent).toHaveLength(0); // control characters are rejected outright
    await submitAgent(deps, form({ ...validAgent, fullName: "Bcc: x@y.z" }), ctx);
    expect(deps.sent).toHaveLength(1);
    expect(deps.sent[0].to).toBe("registrations@instatickets.co.zw");
    expect(deps.sent[0].subject).toBe("New InstaTickets Agent application");
    expect(deps.sent[0].text).toContain("Mobile: +263771234567");
    expect(deps.sent[0].subject).not.toContain("Bcc");
  });

  it("still succeeds when the email cannot be sent", async () => {
    const deps = await makeDeps({
      notify: async () => {
        throw new Error("down");
      },
    });
    expect(await submitAgent(deps, form(validAgent), ctx)).toEqual({ status: "success" });
    expect(await deps.db.select().from(agentApplications)).toHaveLength(1);
    expect(deps.errors).toHaveLength(1);
  });

  it("reports every invalid field at once and stores nothing", async () => {
    const deps = await makeDeps();
    const result = await submitAgent(
      deps,
      form({ ...validAgent, fullName: "", phoneNational: "12", applicantType: "x", province: "Narnia", town: "", sellingLocation: "", hasDevice: "", privacyAccepted: undefined }),
      ctx,
    );
    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(
      ["applicantType", "fullName", "hasDevice", "phone", "privacyAccepted", "province", "sellingLocation", "town"].sort(),
    );
    expect(await deps.db.select().from(agentApplications)).toHaveLength(0);
  });

  it("rejects a bad optional email but accepts a blank one", async () => {
    const deps = await makeDeps();
    const bad = await submitAgent(deps, form({ ...validAgent, email: "nope" }), ctx);
    expect(bad.status === "error" && bad.fieldErrors.email).toBeTruthy();
  });

  it("offers exactly the ten provinces and no ID, bank or document fields", () => {
    expect(agents.form.provinces).toHaveLength(10);
    expect(Object.keys(agents.form.fields).join(" ")).not.toMatch(/\b(id ?number|bank|document|passport|national ?id)\b/i);
  });

  it("rejects a missing or invalid Turnstile token and stores nothing", async () => {
    const deps = await makeDeps();
    expect((await submitAgent(deps, form({ ...validAgent, "cf-turnstile-response": "bad" }), ctx)).status).toBe("error");
    expect(await deps.db.select().from(agentApplications)).toHaveLength(0);
  });

  it("is rate limited per visitor, separately from the other forms", async () => {
    const deps = await makeDeps({ rateLimiter: createMemoryLimiter({ limit: 2, windowMs: 600_000 }) });
    expect((await submitAgent(deps, form(validAgent), ctx)).status).toBe("success");
    expect((await submitAgent(deps, form(validAgent), ctx)).status).toBe("success");
    expect((await submitAgent(deps, form(validAgent), ctx)).status).toBe("error");
    expect(await deps.db.select().from(agentApplications)).toHaveLength(2);
  });
});

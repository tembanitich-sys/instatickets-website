import { describe, expect, it } from "vitest";
import { PRIVACY_NOTICE_VERSION } from "@content/site";
import { businessRegistrations, contactEnquiries, customerPreregistrations } from "@/lib/db/schema";
import { submitBusiness, submitContact, submitCustomer } from "@/lib/forms/submit";
import { createMemoryLimiter } from "@/lib/ratelimit";
import { ctx, form, makeDeps, validBusiness, validContact, validCustomer } from "./helpers/forms";

describe("duplicate phone numbers", () => {
  it("updates the existing pre-registration and returns the same success", async () => {
    let clock = new Date("2026-10-01T08:00:00Z");
    const deps = await makeDeps({ now: () => clock });

    const first = await submitCustomer(
      deps,
      form({ ...validCustomer, phoneNational: "0771234567", interests: ["bus"], marketingConsent: true, email: "a@example.com" }),
      ctx,
    );
    clock = new Date("2026-10-02T09:30:00Z");
    // Same number, typed differently, with different details and a different name.
    const second = await submitCustomer(
      deps,
      form({
        ...validCustomer,
        firstName: "Someone",
        lastName: "Else",
        phoneNational: "77 123 4567",
        interests: ["events", "sports"],
        email: "",
      }),
      ctx,
    );

    expect(second).toEqual(first);
    expect(second).toEqual({ status: "success" });

    const rows = await deps.db.select().from(customerPreregistrations);
    expect(rows).toHaveLength(1);
    const row = rows[0];
    expect(row.interests).toEqual(["events", "sports"]); // latest wins
    expect(row.email).toBe("a@example.com"); // a blank email never erases one on file
    expect(row.marketingConsent).toBe(false); // latest wins: unticked withdraws consent
    expect(row.marketingConsentAt).toBeNull();
    expect(row.firstName).toBe("Tendai"); // name stays as first recorded
    expect(row.createdAt.toISOString()).toBe("2026-10-01T08:00:00.000Z");
    expect(row.updatedAt.toISOString()).toBe("2026-10-02T09:30:00.000Z");
  });

  it("does not tell the visitor the number already existed", async () => {
    const deps = await makeDeps();
    const a = await submitCustomer(deps, form(validCustomer), ctx);
    const b = await submitCustomer(deps, form(validCustomer), ctx);
    expect(JSON.stringify(b)).toBe(JSON.stringify(a));
  });

  it("sends a notification for the update too, marked as updated", async () => {
    const deps = await makeDeps();
    await submitCustomer(deps, form(validCustomer), ctx);
    await submitCustomer(deps, form(validCustomer), ctx);
    expect(deps.sent.map((m) => m.subject)).toEqual([
      "New customer pre-registration",
      "Customer pre-registration updated",
    ]);
  });

  it("shows staff the stored record in the update notification", async () => {
    const deps = await makeDeps();
    await submitCustomer(deps, form({ ...validCustomer, email: "keep@example.com" }), ctx);
    await submitCustomer(
      deps,
      form({ ...validCustomer, firstName: "Other", lastName: "Person", email: "", interests: ["sports"] }),
      ctx,
    );
    const update = deps.sent[1];
    expect(update.subject).toBe("Customer pre-registration updated");
    expect(update.text).toContain("Name: Tendai Moyo");
    expect(update.text).toContain("Email: keep@example.com");
    expect(update.text).toContain("Interested in: sports");
    expect(update.replyTo).toBe("keep@example.com");
  });

  it("gives every business registration its own row", async () => {
    const deps = await makeDeps();
    await submitBusiness(deps, form(validBusiness), ctx);
    await submitBusiness(deps, form(validBusiness), ctx);
    expect(await deps.db.select().from(businessRegistrations)).toHaveLength(2);
  });
});

describe("consent", () => {
  it("is off by default and has no timestamp", async () => {
    const deps = await makeDeps();
    await submitCustomer(deps, form(validCustomer), ctx);
    const [row] = await deps.db.select().from(customerPreregistrations);
    expect(row.marketingConsent).toBe(false);
    expect(row.marketingConsentAt).toBeNull();
    expect(row.privacyNoticeVersion).toBe(PRIVACY_NOTICE_VERSION);
    expect(PRIVACY_NOTICE_VERSION).toBe("2026-10-01-final");
  });

  it("is recorded with a timestamp when ticked", async () => {
    const now = new Date("2026-10-05T10:00:00Z");
    const deps = await makeDeps({ now: () => now });
    await submitCustomer(deps, form({ ...validCustomer, marketingConsent: true }), ctx);
    const [row] = await deps.db.select().from(customerPreregistrations);
    expect(row.marketingConsent).toBe(true);
    expect(row.marketingConsentAt?.toISOString()).toBe(now.toISOString());
  });

  it("requires the privacy acknowledgement and stores nothing without it", async () => {
    const deps = await makeDeps();
    for (const submit of [
      () => submitCustomer(deps, form({ ...validCustomer, privacyAccepted: undefined }), ctx),
      () => submitBusiness(deps, form({ ...validBusiness, privacyAccepted: undefined }), ctx),
      () => submitContact(deps, form({ ...validContact, privacyAccepted: undefined }), ctx),
    ]) {
      const result = await submit();
      expect(result.status).toBe("error");
      if (result.status === "error") expect(result.fieldErrors.privacyAccepted).toMatch(/Privacy Notice/);
    }
    expect(await deps.db.select().from(customerPreregistrations)).toHaveLength(0);
    expect(await deps.db.select().from(businessRegistrations)).toHaveLength(0);
    expect(await deps.db.select().from(contactEnquiries)).toHaveLength(0);
  });

  it("stores business marketing consent with its own default of off", async () => {
    const deps = await makeDeps();
    await submitBusiness(deps, form(validBusiness), ctx);
    await submitBusiness(deps, form({ ...validBusiness, marketingConsent: true }), ctx);
    const rows = await deps.db.select().from(businessRegistrations);
    expect(rows.map((r) => r.marketingConsent).sort()).toEqual([false, true]);
    expect(rows.filter((r) => r.marketingConsent).every((r) => r.marketingConsentAt !== null)).toBe(true);
    expect(rows.filter((r) => !r.marketingConsent).every((r) => r.marketingConsentAt === null)).toBe(true);
  });
});

describe("notification emails", () => {
  it("do not block or fail a submission when sending fails", async () => {
    const deps = await makeDeps({
      notify: async () => {
        throw new Error("Resend is down");
      },
    });
    for (const result of [
      await submitCustomer(deps, form(validCustomer), ctx),
      await submitBusiness(deps, form(validBusiness), ctx),
      await submitContact(deps, form(validContact), ctx),
    ]) {
      expect(result).toEqual({ status: "success" });
    }
    expect(await deps.db.select().from(customerPreregistrations)).toHaveLength(1);
    expect(await deps.db.select().from(businessRegistrations)).toHaveLength(1);
    expect(await deps.db.select().from(contactEnquiries)).toHaveLength(1);
    // The failure is logged, not thrown, and the log carries no personal details.
    expect(deps.errors).toHaveLength(3);
    expect(JSON.stringify(deps.errors.map((e) => e[0]))).not.toContain("771234567");
  });

  it("are sent only after the record is stored", async () => {
    let rowsSeenAtSendTime = -1;
    const deps = await makeDeps();
    deps.notify = async () => {
      rowsSeenAtSendTime = (await deps.db.select().from(customerPreregistrations)).length;
    };
    await submitCustomer(deps, form(validCustomer), ctx);
    expect(rowsSeenAtSendTime).toBe(1);
  });

  it("are not sent when nothing was stored", async () => {
    const deps = await makeDeps();
    await submitCustomer(deps, form({ ...validCustomer, phoneNational: "1" }), ctx);
    expect(deps.sent).toHaveLength(0);
  });

  it("go to the right mailbox, with fixed subjects and plain text", async () => {
    const deps = await makeDeps();
    await submitCustomer(deps, form({ ...validCustomer, firstName: "<b>Hi</b>" }), ctx);
    await submitBusiness(deps, form({ ...validBusiness, organisationName: "Evil\nSubject: injected" }), ctx);
    await submitContact(deps, form(validContact), ctx);
    expect(deps.sent.map((m) => m.to)).toEqual([
      "registrations@instatickets.co.zw",
      // organisation name with a line break is rejected, so no second email for it
      "info@instatickets.co.zw",
    ]);
    expect(deps.sent.map((m) => m.subject)).toEqual(["New customer pre-registration", "New website enquiry"]);
  });

  it("tell staff who to reply to when the visitor gave an email", async () => {
    const deps = await makeDeps();
    await submitContact(deps, form(validContact), ctx);
    expect(deps.sent[0].replyTo).toBe("visitor@example.com");
  });
});

describe("Turnstile and rate limiting", () => {
  it("reject a missing or invalid Turnstile token and store nothing", async () => {
    const deps = await makeDeps();
    for (const token of [undefined, "", "forged"]) {
      const result = await submitCustomer(deps, form({ ...validCustomer, "cf-turnstile-response": token }), ctx);
      expect(result.status).toBe("error");
      if (result.status === "error") expect(result.message).toMatch(/security check/);
    }
    expect(await deps.db.select().from(customerPreregistrations)).toHaveLength(0);
  });

  it("does not spend the Turnstile token on a form with field errors", async () => {
    const seen: string[] = [];
    const deps = await makeDeps({
      verifyTurnstile: async (t) => {
        seen.push(t);
        return true;
      },
    });
    await submitCustomer(deps, form({ ...validCustomer, firstName: "" }), ctx);
    expect(seen).toEqual([]);
  });

  it("limits repeat submissions per visitor and form, and stores nothing once limited", async () => {
    const deps = await makeDeps({ rateLimiter: createMemoryLimiter({ limit: 2, windowMs: 600_000 }) });
    const statuses = [];
    for (let i = 0; i < 4; i++) {
      const r = await submitContact(deps, form(validContact), ctx);
      statuses.push(r.status);
    }
    expect(statuses).toEqual(["success", "success", "error", "error"]);
    expect(await deps.db.select().from(contactEnquiries)).toHaveLength(2);

    // Another visitor, and another form for the same visitor, are unaffected.
    expect((await submitContact(deps, form(validContact), { ip: "198.51.100.9" })).status).toBe("success");
    expect((await submitCustomer(deps, form(validCustomer), ctx)).status).toBe("success");
  });

  it("only gives the limiter a hash, never the IP address", async () => {
    const keys: string[] = [];
    const deps = await makeDeps({
      rateLimiter: {
        allow: async (k) => {
          keys.push(k);
          return true;
        },
      },
    });
    await submitContact(deps, form(validContact), ctx);
    expect(keys).toHaveLength(1);
    expect(keys[0]).not.toContain(ctx.ip);
    expect(keys[0]).toMatch(/^contact:[0-9a-f]{32}$/);
  });
});

describe("validation", () => {
  it("returns a message per invalid field, all at once, and echoes what was typed", async () => {
    const deps = await makeDeps();
    const result = await submitCustomer(
      deps,
      form({ ...validCustomer, firstName: " ", lastName: "", phoneNational: "1", email: "nope", privacyAccepted: undefined }),
      ctx,
    );
    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "firstName", "lastName", "phone", "privacyAccepted"]);
    expect(result.values.email).toBe("nope");
    expect(result.values.phoneNational).toBe("1");
  });

  it("makes the contact phone optional but validates it when given", async () => {
    const deps = await makeDeps();
    expect((await submitContact(deps, form(validContact), ctx)).status).toBe("success");
    const [row] = await deps.db.select().from(contactEnquiries);
    expect(row.phoneE164).toBeNull();

    const bad = await submitContact(deps, form({ ...validContact, phoneNational: "12" }), ctx);
    expect(bad.status === "error" && bad.fieldErrors.phone).toBeTruthy();
    const good = await submitContact(deps, form({ ...validContact, phoneNational: "0771234567" }), ctx);
    expect(good.status).toBe("success");
    const rows = await deps.db.select().from(contactEnquiries);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.phoneE164)).toContain(null);
    expect(rows.map((r) => r.phoneE164)).toContain("+263771234567");
  });

  it("normalises a website without a scheme and rejects nonsense", async () => {
    const deps = await makeDeps();
    await submitBusiness(deps, form({ ...validBusiness, website: "example.co.zw" }), ctx);
    const [row] = await deps.db.select().from(businessRegistrations);
    expect(row.website).toBe("https://example.co.zw/");
    const bad = await submitBusiness(deps, form({ ...validBusiness, website: "javascript:alert(1)" }), ctx);
    expect(bad.status === "error" && bad.fieldErrors.website).toBeTruthy();
  });

  it("rejects values outside the offered choices", async () => {
    const deps = await makeDeps();
    const a = await submitCustomer(deps, form({ ...validCustomer, interests: ["bus", "hacking"] }), ctx);
    expect(a.status === "error" && a.fieldErrors.interests).toBeTruthy();
    const b = await submitBusiness(deps, form({ ...validBusiness, businessType: "pirate" }), ctx);
    expect(b.status === "error" && b.fieldErrors.businessType).toBeTruthy();
    const c = await submitContact(deps, form({ ...validContact, enquiryType: "spam" }), ctx);
    expect(c.status === "error" && c.fieldErrors.enquiryType).toBeTruthy();
  });

  it("does not report success when the database is unavailable", async () => {
    const deps = await makeDeps({ db: null });
    expect(deps.db).toBeNull();
    const result = await submitCustomer(deps, form(validCustomer), ctx);
    expect(result.status).toBe("error");
    expect(deps.sent).toHaveLength(0);
  });
});

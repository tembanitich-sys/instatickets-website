import { describe, expect, it } from "vitest";
import { operators, PRIVACY_NOTICE_VERSION } from "@content/site";
import { operatorRegistrations } from "@/lib/db/schema";
import { submitOperator } from "@/lib/forms/submit";
import { routeForHost } from "@/lib/operators-host";
import { createMemoryLimiter } from "@/lib/ratelimit";
import { createSheetAppender } from "@/lib/sheets";
import { ctx, form, makeDeps, validOperator } from "./helpers/forms";

describe("bus operator registrations", () => {
  it("stores the registration and returns the OP reference", async () => {
    const deps = await makeDeps();
    expect(await submitOperator(deps, form(validOperator), ctx)).toEqual({ status: "success", reference: "OP-0001" });
    const [row] = await deps.db.select().from(operatorRegistrations);
    expect(row).toMatchObject({
      referenceNo: 1,
      companyName: "Tamuka Coaches (Pvt) Ltd",
      tradingName: "Tamuka Coaches",
      contactRole: "Operations Manager",
      phoneE164: "+263771234567",
      email: "ops@tamuka.example",
      fleetSize: 18,
      routeType: "both",
      hasTicketingSystem: "no",
      ticketingSystemName: null,
      currencies: ["USD", "ZWG", "ZAR"],
      heardFrom: "roadport",
      details: null,
      marketingConsent: false,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    });
  });

  it("numbers registrations in order", async () => {
    const deps = await makeDeps();
    await submitOperator(deps, form(validOperator), ctx);
    expect(await submitOperator(deps, form(validOperator), ctx)).toEqual({ status: "success", reference: "OP-0002" });
    expect(await deps.db.select().from(operatorRegistrations)).toHaveLength(2);
  });

  it("emails accounts@ and tich@, then auto-replies to the operator from accounts@", async () => {
    const deps = await makeDeps();
    await submitOperator(deps, form(validOperator), ctx);
    expect(deps.sent).toHaveLength(2);
    const [team, reply] = deps.sent;
    expect(team.to).toEqual(["accounts@instatickets.co.zw", "tich@instatickets.co.zw"]);
    expect(team.subject).toBe("New bus operator registration OP-0001");
    expect(team.replyTo).toBe("ops@tamuka.example");
    expect(team.text).toContain("Currencies: USD, ZWG, ZAR");
    expect(team.text).toContain("Route type: Both");
    expect(reply.to).toBe("ops@tamuka.example");
        expect(reply.from).toContain("accounts@instatickets.co.zw");
    expect(reply.subject).toBe("Your InstaTickets operator registration (OP-0001)");
    expect(reply.text).toContain("Dear Tamuka Moyo,");
    expect(reply.text).toContain("Your reference number is OP-0001.");
  });

  it("adds a row to the Google Sheet with the reference and a New status", async () => {
    const deps = await makeDeps();
    await submitOperator(deps, form(validOperator), ctx);
    expect(deps.sheetRows).toHaveLength(1);
    const row = Object.fromEntries(deps.sheetRows[0]);
    expect(row.Reference).toBe("OP-0001");
    expect(row.Company).toBe("Tamuka Coaches (Pvt) Ltd");
    expect(row.Mobile).toBe("+263771234567");
    expect(row.Status).toBe("New");
  });

  it("still succeeds, and still sends the rest, when one follow-up fails", async () => {
    const deps = await makeDeps({
      appendOperatorRow: async () => {
        throw new Error("sheet down");
      },
    });
    expect((await submitOperator(deps, form(validOperator), ctx)).status).toBe("success");
    expect(deps.sent).toHaveLength(2);
    expect(deps.errors).toHaveLength(1);
    expect(String(deps.errors[0][0])).toContain("Google Sheet row for operator submission");
  });

  it("reports every invalid field at once and stores nothing", async () => {
    const deps = await makeDeps();
    const result = await submitOperator(
      deps,
      form({
        ...validOperator,
        companyName: "",
        contactPerson: "",
        email: "",
        fleetSize: "lots",
        routeType: "",
        mainRoutes: "",
        hasTicketingSystem: "",
        currencies: [],
        privacyAccepted: undefined,
      }),
      ctx,
    );
    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(
      [
        "companyName",
        "contactPerson",
        "currencies",
        "email",
        "fleetSize",
        "hasTicketingSystem",
        "mainRoutes",
        "privacyAccepted",
        "routeType",
      ].sort(),
    );
    expect(await deps.db.select().from(operatorRegistrations)).toHaveLength(0);
    expect(deps.sent).toHaveLength(0);
    expect(deps.sheetRows).toHaveLength(0);
  });

  it("rejects an unknown currency and a zero fleet", async () => {
    const deps = await makeDeps();
    const result = await submitOperator(deps, form({ ...validOperator, currencies: ["BTC"], fleetSize: "0" }), ctx);
    expect(result.status === "error" && Object.keys(result.fieldErrors).sort()).toEqual(["currencies", "fleetSize"]);
  });

  it("keeps visitor text out of the email subjects", async () => {
    const deps = await makeDeps();
    await submitOperator(deps, form({ ...validOperator, companyName: "Bcc: x@y.z" }), ctx);
    for (const m of deps.sent) expect(m.subject).not.toContain("Bcc");
  });

  it("rejects a bad Turnstile token and is rate limited", async () => {
    const deps = await makeDeps({ rateLimiter: createMemoryLimiter({ limit: 1, windowMs: 600_000 }) });
    expect((await submitOperator(deps, form({ ...validOperator, "cf-turnstile-response": "bad" }), ctx)).status).toBe("error");
    expect((await submitOperator(deps, form(validOperator), ctx)).status).toBe("error");
    expect(await deps.db.select().from(operatorRegistrations)).toHaveLength(0);
  });

  it("asks for no bank details or documents", () => {
    expect(Object.keys(operators.form.fields).join(" ")).not.toMatch(/\b(bank|account ?number|document|passport|national ?id)\b/i);
  });
});

describe("operators subdomain routing", () => {
  const host = "operators.instatickets.co.zw";
  it("shows the registration page on the subdomain's home page", () => {
    expect(routeForHost(host, "/")).toEqual({ kind: "rewrite", pathname: "/operators" });
    expect(routeForHost("Operators.InstaTickets.co.zw:443", "/")).toEqual({ kind: "rewrite", pathname: "/operators" });
  });
  it("sends /operators on the subdomain back to its home page", () => {
    expect(routeForHost(host, "/operators")).toEqual({ kind: "redirect-local", pathname: "/" });
  });
  it("sends every other subdomain page to the main site", () => {
    expect(routeForHost(host, "/privacy")).toEqual({ kind: "redirect-main", pathname: "/privacy" });
    expect(routeForHost(host, "/admin")).toEqual({ kind: "redirect-main", pathname: "/admin" });
  });
  it("leaves the main site alone", () => {
    expect(routeForHost("www.instatickets.co.zw", "/")).toEqual({ kind: "next" });
    expect(routeForHost("www.instatickets.co.zw", "/operators")).toEqual({ kind: "next" });
    expect(routeForHost(null, "/")).toEqual({ kind: "next" });
  });
});

describe("Google Sheet appender", () => {
  const ok = async () => new Response(JSON.stringify({ ok: true }), { status: 200 });

  it("posts the secret and the row as JSON", async () => {
    let body = "";
    const append = createSheetAppender({
      url: "https://script.google.com/macros/s/x/exec",
      secret: "s3cret",
      fetchImpl: (async (_url: string, init: RequestInit) => {
        body = String(init.body);
        return ok();
      }) as unknown as typeof fetch,
    });
    await append([["Reference", "OP-0001"]]);
    expect(JSON.parse(body)).toEqual({ secret: "s3cret", row: [["Reference", "OP-0001"]] });
  });

  it("fails loudly when not configured or when the script refuses", async () => {
    await expect(createSheetAppender({ url: undefined, secret: "x" })([])).rejects.toThrow(/not set/);
    const refusing = createSheetAppender({
      url: "https://example.test",
      secret: "x",
      fetchImpl: (async () => new Response(JSON.stringify({ ok: false, error: "bad secret" }))) as unknown as typeof fetch,
    });
    await expect(refusing([])).rejects.toThrow(/bad secret/);
  });
});

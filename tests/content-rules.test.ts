import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as site from "@content/site";

/** Every string the public site can show: the copy file plus text written in components and pages. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}
const copy = strings(site);

/** Comments are for developers, not visitors, so they are not checked. */
const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.(tsx?|css)$/.test(f) ? [p] : [];
  });
// The admin area is internal and not public copy.
const publicSource = ["src/app", "src/components", "src/lib"]
  .flatMap(sourceFiles)
  .filter((f) => !f.includes("/admin/") && !f.includes("/components/admin/") && !f.includes("/lib/admin/"))
  .map((f) => ({ file: f, text: stripComments(readFileSync(f, "utf8")) }));

const everything = [...copy.map((text) => ({ file: "content/site.ts", text })), ...publicSource];
const hits = (pattern: RegExp) => everything.filter(({ text }) => pattern.test(text)).map((e) => e.file);

describe("brief section 11: content rules", () => {
  it("names no payment provider or mobile wallet", () => {
    expect(hits(/ecocash|onemoney|telecash|innbucks|paynow|zipit|omari|mukuru|paypal|stripe|mastercard|\bvisa\b|apple pay|google pay|m-?pesa|flutterwave|pesepay/i)).toEqual([]);
  });

  it("makes no claim of market leadership or of owning ticket inventory", () => {
    expect(hits(/market leader|leading (ticket|platform|provider)|\b(largest|biggest|number one|no\.? ?1|#1|best)\b|\bunrivalled\b|\bunmatched\b/i)).toEqual([]);
    expect(hits(/\bour (ticket )?inventory|\bwe own\b|\bowns? (the )?ticket|\bour own tickets/i)).toEqual([]);
  });

  it("does not claim a ticketing system can integrate automatically or instantly", () => {
    expect(hits(/(automatic(ally)?|instant(ly)?|seamless(ly)?|plug[- ]and[- ]play|one[- ]click)\W+(\w+\W+){0,4}(integrat|connect)/i)).toEqual([]);
    expect(hits(/(integrat\w*|connect\w*)\W+(\w+\W+){0,4}(automatic(ally)?|instant(ly)?|seamless(ly)?)/i)).toEqual([]);
  });

  it("does not describe Events or Sports as coming soon", () => {
    const { home } = site;
    const eventsAndSports = strings([home.find.cards, home.events, home.sports]);
    for (const text of eventsAndSports) expect(text).not.toMatch(/coming soon/i);
    // COMING SOON is only for the terms and cookie placeholder pages.
    expect(site.comingSoonPages.terms.label).toBe("COMING SOON");
    expect(site.comingSoonPages.cookies.label).toBe("COMING SOON");
  });

  it("does not claim specific events or sports are on sale, or invent prices, discounts or partners", () => {
    expect(hits(/\bon sale now\b|tickets? (are )?now on sale|book now|buy now|sold out|limited (time )?offer/i)).toEqual([]);
    expect(hits(/\b(US\$|USD|ZWL|ZiG|\$)\s?\d|\b\d+\s?%\s?(off|discount)|\bfree tickets?\b/i)).toEqual([]);
    expect(hits(/testimonial|trusted by|as seen (on|in)|our partners include|\b\d[\d,]*\+? (customers|users|operators|transactions)/i)).toEqual([]);
  });

  it("names no person and shows no personal email address", () => {
    // src/lib/email.ts holds the system "from" address, which visitors never see.
    const emails = new Set(
      everything.filter(({ file }) => !file.endsWith("lib/email.ts")).flatMap(({ text }) => text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? []).filter((e) => !e.startsWith("@")),
    );
    // Only the company mailboxes from the brief may appear on the public site.
    for (const email of emails) {
      expect(["info@instatickets.co.zw", "registrations@instatickets.co.zw"], `unexpected email ${email}`).toContain(email);
    }
  });

  it("invents no social media accounts", () => {
    expect(hits(/facebook\.com|instagram\.com|twitter\.com|x\.com\/|linkedin\.com|tiktok\.com|youtube\.com|t\.me\//i)).toEqual([]);
  });

  it("never displays the raw WhatsApp address", () => {
    // wa.me may appear only as an href/data value, never as visible text.
    for (const { file, text } of copy.map((t) => ({ file: "content/site.ts", text: t }))) {
      if (text.startsWith("https://wa.me/")) continue; // the link target itself
      expect(text, file).not.toMatch(/wa\.me/i);
    }
    const visible = publicSource.filter(({ text }) => />[^<{]*wa\.me[^<]*</.test(text)).map((e) => e.file);
    expect(visible).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { getAdminConfig } from "@/lib/admin/config";
import { base32Encode, totpCode, verifyTotp } from "@/lib/admin/totp";
import { routeForHost } from "@/lib/operators-host";
import { adminMayUpload } from "@/lib/partners/admin-slots";
import { safeFileName } from "@/lib/partners/files";

describe("authenticator codes", () => {
  // RFC 6238 test vector: ASCII secret "12345678901234567890", T = 59 s, SHA-1 -> 94287082.
  const secret = Buffer.from("12345678901234567890");
  it("matches the RFC 6238 test vector", () => {
    expect(totpCode(secret, 59_000)).toBe("287082");
  });
  it("accepts the current code and one step either side, nothing else", () => {
    const b32 = base32Encode(secret);
    const now = 1_800_000_000_000;
    expect(verifyTotp(b32, totpCode(secret, now), now)).toBe(true);
    expect(verifyTotp(b32, totpCode(secret, now - 30_000), now)).toBe(true);
    expect(verifyTotp(b32, totpCode(secret, now - 90_000), now)).toBe(false);
    expect(verifyTotp(b32, "abc", now)).toBe(false);
  });
  it("is required by the admin config only when ADMIN_TOTP_SECRET is set, and must be valid base32", () => {
    const base = { ADMIN_PASSWORD: "a-long-password-1", ADMIN_SESSION_SECRET: "s".repeat(40) };
    expect(getAdminConfig(base)?.totpSecret).toBeUndefined();
    expect(getAdminConfig({ ...base, ADMIN_TOTP_SECRET: "JBSWY3DPEHPK3PXP" })?.totpSecret).toBe("JBSWY3DPEHPK3PXP");
    expect(getAdminConfig({ ...base, ADMIN_TOTP_SECRET: "not base32!" })).toBeNull();
  });
});

describe("Partner Portal on the operators subdomain", () => {
  it("serves /partner pages there", () => {
    expect(routeForHost("operators.instatickets.co.zw", "/partner")).toEqual({ kind: "next" });
    expect(routeForHost("operators.instatickets.co.zw", "/partner/sign-in")).toEqual({ kind: "next" });
    expect(routeForHost("operators.instatickets.co.zw", "/partners")).toEqual({ kind: "redirect-main", pathname: "/partners" });
  });
});

describe("admin uploads", () => {
  it("allows contract, library and checklist slots only", () => {
    expect(adminMayUpload({ partnerId: null, eventId: null, slot: "integration_standard" }).ok).toBe(true);
    expect(adminMayUpload({ partnerId: null, eventId: null, slot: "order_form" }).ok).toBe(false);
    expect(adminMayUpload({ partnerId: "p", eventId: null, slot: "order_form", partnerType: "bus_operator" }).ok).toBe(true);
    expect(adminMayUpload({ partnerId: "p", eventId: null, slot: "bank_letter:BWP", partnerType: "bus_operator" }).ok).toBe(true);
    expect(adminMayUpload({ partnerId: "p", eventId: null, slot: "bank_letter:XYZ", partnerType: "bus_operator" }).ok).toBe(false);
    expect(adminMayUpload({ partnerId: "p", eventId: "e", slot: "event_order_form" }).ok).toBe(true);
    expect(adminMayUpload({ partnerId: "p", eventId: null, slot: "../../etc", partnerType: "bus_operator" }).ok).toBe(false);
  });
  it("cleans file names so they cannot change the storage path", () => {
    expect(safeFileName("../../My CR14 (final).pdf")).toBe("My_CR14_final_.pdf");
  });
});

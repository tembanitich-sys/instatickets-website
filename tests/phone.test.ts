import { describe, expect, it } from "vitest";
import { customerPreregistrations } from "@/lib/db/schema";
import { submitCustomer } from "@/lib/forms/submit";
import { toE164 } from "@/lib/phone";
import { ctx, form, makeDeps, validCustomer } from "./helpers/forms";

describe("toE164", () => {
  it("normalises Zimbabwean numbers however they are typed", () => {
    for (const typed of ["771234567", "0771234567", "077 123 4567", "077-123-4567", "+263 77 123 4567"]) {
      expect(toE164("ZW", typed)).toBe("+263771234567");
    }
  });

  it("handles other countries with their own code", () => {
    expect(toE164("ZA", "82 123 4567")).toBe("+27821234567");
    expect(toE164("GB", "07911 123456")).toBe("+447911123456");
  });

  it("rejects invalid numbers", () => {
    for (const bad of ["", "abc", "123", "77123", "0000000000", "+263 12"]) {
      expect(toE164("ZW", bad)).toBeNull();
    }
    expect(toE164("XX", "771234567")).toBeNull();
    expect(toE164("", "771234567")).toBeNull();
  });
});

describe("phone numbers are stored in E.164", () => {
  it("stores +263771234567 for a number typed with a leading zero and spaces", async () => {
    const deps = await makeDeps();
    const result = await submitCustomer(deps, form({ ...validCustomer, phoneNational: "077 123 4567" }), ctx);
    expect(result.status).toBe("success");
    const rows = await deps.db.select().from(customerPreregistrations);
    expect(rows.map((r) => r.phoneE164)).toEqual(["+263771234567"]);
  });

  it("rejects an invalid number with a field message and stores nothing", async () => {
    const deps = await makeDeps();
    const result = await submitCustomer(deps, form({ ...validCustomer, phoneNational: "12345" }), ctx);
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.fieldErrors.phone).toMatch(/valid mobile number/);
    expect(await deps.db.select().from(customerPreregistrations)).toHaveLength(0);
  });

  it("uses the selected country code", async () => {
    const deps = await makeDeps();
    await submitCustomer(deps, form({ ...validCustomer, phoneCountry: "ZA", phoneNational: "821234567" }), ctx);
    const rows = await deps.db.select().from(customerPreregistrations);
    expect(rows[0].phoneE164).toBe("+27821234567");
  });
});

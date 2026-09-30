import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { describe, expect, it } from "vitest";
import { COUNTRY_CALLING_CODES } from "@/lib/countries.generated";
import { isKnownCountry } from "@/lib/phone";

describe("country code list", () => {
  it("matches libphonenumber-js exactly (run scripts/generate-countries.mjs if this fails)", () => {
    const expected = new Set(getCountries().map((c) => `${c}:${getCountryCallingCode(c)}`));
    const actual = new Set(COUNTRY_CALLING_CODES.map(([c, code]) => `${c}:${code}`));
    expect(actual).toEqual(expected);
    expect(COUNTRY_CALLING_CODES).toHaveLength(getCountries().length);
  });

  it("starts with Zimbabwe (+263) and only offers countries the server accepts", () => {
    expect(COUNTRY_CALLING_CODES[0]).toEqual(["ZW", "263"]);
    for (const [iso] of COUNTRY_CALLING_CODES) expect(isKnownCountry(iso)).toBe(true);
  });
});

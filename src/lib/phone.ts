import { getCountries, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";

export const DEFAULT_COUNTRY: CountryCode = "ZW";

const countries = new Set<string>(getCountries());

export function isKnownCountry(value: string): value is CountryCode {
  return countries.has(value);
}

/**
 * Parses a national number for the chosen country and returns it in E.164
 * (for example "+263771234567"), or null if it is not a valid number.
 * A leading trunk zero ("077...") and spaces or dashes are accepted.
 */
export function toE164(country: string, national: string): string | null {
  if (!isKnownCountry(country)) return null;
  const digits = national.trim();
  if (!digits) return null;
  // Someone who types a full international number ("+27...") is taken at their word.
  const parsed = parsePhoneNumberFromString(digits, digits.startsWith("+") ? undefined : country);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

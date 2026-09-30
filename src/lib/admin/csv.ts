/** A phone number in E.164 form, which must be exported exactly as stored. */
const E164 = /^\+[0-9]{6,15}$/;

/**
 * One CSV field. Text a spreadsheet would run as a formula (starts with = + - @
 * or a control character) is prefixed with an apostrophe so a hostile form
 * entry cannot execute when staff open the export. E.164 phone numbers start
 * with "+" but are safe, and are left untouched.
 */
export function csvField(text: string): string {
  let t = text;
  if (/^[=+\-@\t\r]/.test(t) && !E164.test(t)) t = `'${t}`;
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

export function toCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((r) => r.map(csvField).join(",")).join("\r\n") + "\r\n";
}

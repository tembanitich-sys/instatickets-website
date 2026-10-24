/**
 * Adds one row to a Google Sheet through a small Google Apps Script web app that
 * lives inside the sheet (see docs/OPERATOR_PORTAL.md and scripts/operator-sheet.gs).
 *
 * The script checks a shared secret, so only this website can add rows. The row is a
 * list of [column heading, value] pairs; the script creates the headings on first use
 * and matches values to headings after that, so a new field never shifts columns.
 */
export type SheetRow = [string, string][];
/**
 * `sheet` picks the tab (created on first use). With `key`, the row whose value in that
 * column matches is updated in place instead of a new row being added, so a partner keeps
 * one row as its stage changes.
 */
export type SheetOptions = { sheet?: string; key?: string };
export type SheetAppender = (row: SheetRow, options?: SheetOptions) => Promise<void>;

export function createSheetAppender(options: {
  url: string | undefined;
  secret: string | undefined;
  fetchImpl?: typeof fetch;
}): SheetAppender {
  const { url, secret, fetchImpl = fetch } = options;
  return async (row, options = {}) => {
    if (!url || !secret) throw new Error("OPERATOR_SHEET_URL or OPERATOR_SHEET_SECRET is not set; row not added.");
    // Apps Script answers a POST with a redirect to the result; fetch follows it.
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, row, ...options }),
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Google Sheet responded with HTTP ${res.status}.`);
    let json: { ok?: boolean; error?: string } = {};
    try {
      json = (await res.json()) as typeof json;
    } catch {
      throw new Error("Google Sheet did not return JSON; check the web app is deployed for 'Anyone'.");
    }
    if (!json.ok) throw new Error(`Google Sheet refused the row: ${json.error ?? "unknown error"}.`);
  };
}

export const defaultSheetAppender = (): SheetAppender =>
  createSheetAppender({ url: process.env.OPERATOR_SHEET_URL, secret: process.env.OPERATOR_SHEET_SECRET });

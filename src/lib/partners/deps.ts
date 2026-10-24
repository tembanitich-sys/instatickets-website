import { operators } from "@content/site";
import { getDb } from "../db/client";
import { sendEmail } from "../email";
import { defaultSheetAppender } from "../sheets";
import { blobFileStore } from "./files";
import type { PartnerDeps } from "./service";

/** Address of the partner portal used in emailed links. Set PORTAL_URL on preview deployments. */
export const PORTAL_URL = (process.env.PORTAL_URL ?? operators.url).replace(/\/+$/, "");

/** Production wiring, or null when the database is not configured. */
export function partnerDeps(): PartnerDeps | null {
  const db = getDb();
  if (!db) return null;
  return {
    db,
    files: blobFileStore,
    notify: sendEmail,
    sheet: defaultSheetAppender(),
    log: console,
    now: () => new Date(),
    portalUrl: PORTAL_URL,
    // Same host as the portal, so links in team emails work before www moves to Vercel.
    adminUrl: `${PORTAL_URL}/admin`,
  };
}

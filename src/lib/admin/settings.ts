import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { siteSettings } from "../db/schema";
import { GET_STARTED_KEY, isSafeGetStartedUrl } from "../settings";
import { writeAudit } from "./audit";

export type SaveResult = { ok: true; value: string | null } | { ok: false; error: string };

export const INVALID_URL_MESSAGE = "Enter a full web address starting with https://";

/**
 * Sets the GET STARTED link, or resets it to the default (WhatsApp) when the
 * text is empty. The change and its audit row are one transaction, so a change
 * is never made without being recorded.
 */
export async function saveGetStartedLink(db: Db, raw: string): Promise<SaveResult> {
  const value = raw.trim();
  if (value && (value.length > 2000 || !isSafeGetStartedUrl(value))) {
    return { ok: false, error: INVALID_URL_MESSAGE };
  }

  await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(siteSettings).where(eq(siteSettings.key, GET_STARTED_KEY)).limit(1);
    if (value) {
      await tx
        .insert(siteSettings)
        .values({ key: GET_STARTED_KEY, value, updatedBy: "admin" })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy: "admin", updatedAt: new Date() } });
    } else {
      await tx.delete(siteSettings).where(eq(siteSettings.key, GET_STARTED_KEY));
    }
    await writeAudit(tx as unknown as Db, "settings.update", {
      key: GET_STARTED_KEY,
      from: existing?.value ?? null,
      to: value || null,
    });
  });
  return { ok: true, value: value || null };
}

import { eq } from "drizzle-orm";
import { contact } from "@content/site";
import type { Db } from "./db/client";
import { siteSettings } from "./db/schema";

export const GET_STARTED_KEY = "get_started_url";
export const SETTINGS_CACHE_TAG = "site-settings";

/** Default GET STARTED link: the WhatsApp chat. */
export const DEFAULT_GET_STARTED_URL = contact.whatsapp.href;

/** Only https links are accepted, so a bad setting can never become a script or plain-http link. */
export function isSafeGetStartedUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function readGetStartedUrl(db: Db): Promise<string> {
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, GET_STARTED_KEY)).limit(1);
  const value = rows[0]?.value;
  return value && isSafeGetStartedUrl(value) ? value : DEFAULT_GET_STARTED_URL;
}

export async function writeGetStartedUrl(db: Db, value: string, updatedBy: string): Promise<void> {
  if (!isSafeGetStartedUrl(value)) throw new Error("GET STARTED link must be a valid https URL");
  await db
    .insert(siteSettings)
    .values({ key: GET_STARTED_KEY, value, updatedBy })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedBy, updatedAt: new Date() },
    });
}

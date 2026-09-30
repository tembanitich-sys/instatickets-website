import { unstable_cache } from "next/cache";
import { getDb } from "./db/client";
import { DEFAULT_GET_STARTED_URL, SETTINGS_CACHE_TAG, readGetStartedUrl } from "./settings";

async function loadGetStartedUrl(): Promise<string> {
  const db = getDb();
  if (!db) return DEFAULT_GET_STARTED_URL;
  try {
    return await readGetStartedUrl(db);
  } catch (error) {
    console.error("Could not read the GET STARTED link; using the default.", error);
    return DEFAULT_GET_STARTED_URL;
  }
}

/** Cached for a minute, and invalidated by the admin page through SETTINGS_CACHE_TAG. */
export const getGetStartedUrl = unstable_cache(loadGetStartedUrl, ["get-started-url"], {
  tags: [SETTINGS_CACHE_TAG],
  revalidate: 60,
});

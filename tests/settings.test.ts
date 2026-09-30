import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import {
  DEFAULT_GET_STARTED_URL,
  GET_STARTED_KEY,
  isSafeGetStartedUrl,
  readGetStartedUrl,
  writeGetStartedUrl,
} from "@/lib/settings";
import { createTestDb } from "./helpers/test-db";

describe("GET STARTED link setting", () => {
  let db: Db;
  beforeEach(async () => {
    db = await createTestDb();
  });

  it("defaults to the WhatsApp link when nothing is stored", async () => {
    expect(DEFAULT_GET_STARTED_URL).toBe("https://wa.me/263772270533");
    expect(await readGetStartedUrl(db)).toBe(DEFAULT_GET_STARTED_URL);
  });

  it("returns the stored link and lets it be changed without a redeploy", async () => {
    await writeGetStartedUrl(db, "https://app.instatickets.co.zw/start", "admin");
    expect(await readGetStartedUrl(db)).toBe("https://app.instatickets.co.zw/start");

    await writeGetStartedUrl(db, "https://app.instatickets.co.zw/welcome", "admin");
    expect(await readGetStartedUrl(db)).toBe("https://app.instatickets.co.zw/welcome");

    const rows = await db.select().from(siteSettings);
    expect(rows).toHaveLength(1);
    expect(rows[0].key).toBe(GET_STARTED_KEY);
    expect(rows[0].updatedBy).toBe("admin");
  });

  it("refuses to store anything but an https URL", async () => {
    for (const bad of ["http://example.com", "javascript:alert(1)", "not a url", ""]) {
      await expect(writeGetStartedUrl(db, bad, "admin")).rejects.toThrow();
    }
    expect(await db.select().from(siteSettings)).toHaveLength(0);
  });

  it("falls back to the default if a bad value is already in the database", async () => {
    await db.insert(siteSettings).values({ key: GET_STARTED_KEY, value: "javascript:alert(1)" });
    expect(await readGetStartedUrl(db)).toBe(DEFAULT_GET_STARTED_URL);
  });

  it("validates URLs", () => {
    expect(isSafeGetStartedUrl("https://wa.me/263772270533")).toBe(true);
    expect(isSafeGetStartedUrl("http://wa.me/263772270533")).toBe(false);
    expect(isSafeGetStartedUrl("//evil.example")).toBe(false);
  });
});

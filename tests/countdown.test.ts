import { describe, expect, it } from "vitest";
import {
  LAUNCH_AT_ISO,
  LAUNCH_AT_MS,
  estimateClockOffset,
  getTimeLeft,
  isPreviewAllowed,
  parsePreviewNow,
} from "@/lib/countdown";

describe("launch instant", () => {
  it("is 2026-11-14T22:00:00Z", () => {
    expect(LAUNCH_AT_ISO).toBe("2026-11-14T22:00:00Z");
    expect(new Date(LAUNCH_AT_MS).toISOString()).toBe("2026-11-14T22:00:00.000Z");
  });

  it("is midnight on 15 November 2026 in Harare", () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Harare",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date(LAUNCH_AT_MS));
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    expect([get("year"), get("month"), get("day"), get("hour"), get("minute")]).toEqual([2026, 11, 15, 0, 0]);
  });
});

describe("getTimeLeft", () => {
  it("is not launched one millisecond before the launch instant", () => {
    expect(getTimeLeft(LAUNCH_AT_MS - 1)).toEqual({
      launched: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
  });

  it("switches to launched exactly at 2026-11-14T22:00:00Z", () => {
    expect(getTimeLeft(Date.parse("2026-11-14T21:59:59.999Z")).launched).toBe(false);
    expect(getTimeLeft(Date.parse("2026-11-14T22:00:00.000Z")).launched).toBe(true);
    expect(getTimeLeft(Date.parse("2026-11-14T22:00:00.001Z")).launched).toBe(true);
    expect(getTimeLeft(Date.parse("2027-01-01T00:00:00Z")).launched).toBe(true);
  });

  it("breaks the remaining time into days, hours, minutes and seconds", () => {
    const now = LAUNCH_AT_MS - ((1 * 86400 + 2 * 3600 + 3 * 60 + 4) * 1000);
    expect(getTimeLeft(now)).toEqual({ launched: false, days: 1, hours: 2, minutes: 3, seconds: 4 });
  });

  it("does not depend on the process time zone", () => {
    const original = process.env.TZ;
    try {
      for (const tz of ["UTC", "Africa/Harare", "America/Los_Angeles", "Pacific/Kiritimati"]) {
        process.env.TZ = tz;
        expect(getTimeLeft(Date.parse("2026-11-14T21:59:59Z")).launched).toBe(false);
        expect(getTimeLeft(Date.parse("2026-11-14T22:00:00Z")).launched).toBe(true);
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });
});

describe("preview of the after-launch state", () => {
  it("is allowed in development and on Vercel previews only", () => {
    expect(isPreviewAllowed({ nodeEnv: "development" })).toBe(true);
    expect(isPreviewAllowed({ nodeEnv: "production", vercelEnv: "preview" })).toBe(true);
    expect(isPreviewAllowed({ nodeEnv: "production", vercelEnv: "production" })).toBe(false);
    expect(isPreviewAllowed({ nodeEnv: "production" })).toBe(false);
    expect(isPreviewAllowed({})).toBe(false);
  });

  it("reads ?launched=1 and ?now=", () => {
    expect(parsePreviewNow("?launched=1")).toBe(LAUNCH_AT_MS);
    expect(parsePreviewNow("?now=2026-11-14T21:59:50Z")).toBe(Date.parse("2026-11-14T21:59:50Z"));
    expect(parsePreviewNow("?launched=0")).toBeNull();
    expect(parsePreviewNow("?now=nonsense")).toBeNull();
    expect(parsePreviewNow("")).toBeNull();
  });
});

describe("estimateClockOffset", () => {
  it("returns how far the device clock is behind the server", () => {
    // Device clock is 5 minutes slow; the round trip takes 200 ms.
    const skew = 5 * 60 * 1000;
    const serverAtMidpoint = 1_000_000_000_000;
    const sent = serverAtMidpoint - skew - 100;
    const received = serverAtMidpoint - skew + 100;
    expect(estimateClockOffset(sent, serverAtMidpoint, received)).toBe(skew);
  });
});

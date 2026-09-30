/**
 * Launch instant: 00:00 on 15 November 2026 in Harare (CAT, UTC+2).
 * Hard-coded on purpose; never derive it from the visitor's time zone.
 */
export const LAUNCH_AT_ISO = "2026-11-14T22:00:00Z";
export const LAUNCH_AT_MS = Date.parse(LAUNCH_AT_ISO);

/** Current server time in ms, read once per render and passed to the countdown. */
export function serverNowMs(): number {
  return Date.now();
}

export type TimeLeft =
  | { launched: true }
  | { launched: false; days: number; hours: number; minutes: number; seconds: number };

/** Time remaining at `nowMs`. From the launch instant onwards the site is live. */
export function getTimeLeft(nowMs: number): TimeLeft {
  if (nowMs >= LAUNCH_AT_MS) return { launched: true };
  // Round up so a fraction of a second left still shows as 1, never as 0 before launch.
  const total = Math.ceil((LAUNCH_AT_MS - nowMs) / 1000);
  return {
    launched: false,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/**
 * Previewing the after-launch state is only allowed in local development and on
 * Vercel preview deployments, never in production.
 */
export function isPreviewAllowed(env: { nodeEnv?: string; vercelEnv?: string }): boolean {
  return env.nodeEnv === "development" || env.vercelEnv === "preview";
}

/**
 * Reads the preview query string. `?launched=1` jumps to the launch instant;
 * `?now=<ISO date-time>` simulates that moment, then keeps ticking.
 */
export function parsePreviewNow(search: string): number | null {
  const params = new URLSearchParams(search);
  if (params.get("launched") === "1") return LAUNCH_AT_MS;
  const now = params.get("now");
  if (now) {
    const ms = Date.parse(now);
    if (!Number.isNaN(ms)) return ms;
  }
  return null;
}

/**
 * Offset to add to the visitor's clock to get server time, so a wrong device
 * clock cannot show the wrong countdown or switch to "live" early. Assumes the
 * server stamped its time halfway through the round trip.
 */
export function estimateClockOffset(sentAtMs: number, serverMs: number, receivedAtMs: number): number {
  return serverMs - (sentAtMs + receivedAtMs) / 2;
}

import { getDb } from "../db/client";
import { sendEmail } from "../email";
import { getRateLimiter } from "../ratelimit";
import { defaultTurnstileVerifier } from "../turnstile";
import type { Deps } from "./submit";

/** Production wiring, read from the environment for each request. */
export function defaultDeps(): Deps {
  return {
    db: getDb(),
    notify: sendEmail,
    verifyTurnstile: defaultTurnstileVerifier(),
    rateLimiter: getRateLimiter(),
    ipSalt: process.env.RATE_LIMIT_SALT ?? process.env.ADMIN_SESSION_SECRET ?? "instatickets-dev-salt",
    log: console,
    now: () => new Date(),
  };
}

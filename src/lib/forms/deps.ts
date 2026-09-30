import { getDb } from "../db/client";
import { sendEmail } from "../email";
import { getRateLimiter } from "../ratelimit";
import { defaultTurnstileVerifier } from "../turnstile";
import type { Deps } from "./submit";

/** Secret used to hash visitor IPs before they reach the rate limiter or lockout store. */
export function ipSalt(): string {
  return process.env.RATE_LIMIT_SALT ?? process.env.ADMIN_SESSION_SECRET ?? "instatickets-dev-salt";
}

/** Production wiring, read from the environment for each request. */
export function defaultDeps(): Deps {
  return {
    db: getDb(),
    notify: sendEmail,
    verifyTurnstile: defaultTurnstileVerifier(),
    rateLimiter: getRateLimiter(),
    ipSalt: ipSalt(),
    log: console,
    now: () => new Date(),
  };
}

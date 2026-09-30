import type { Db } from "../db/client";
import { hashIp } from "../ratelimit";
import type { VerifyTurnstile } from "../turnstile";
import { writeAudit } from "./audit";
import type { AdminConfig } from "./config";
import { LOCKOUT_WINDOW_MS, MAX_FAILED_ATTEMPTS, type LockoutStore } from "./lockout";
import { createSessionToken, safeEqual } from "./session";

export type LoginDeps = {
  /** null when ADMIN_PASSWORD / ADMIN_SESSION_SECRET are missing or too weak. */
  config: AdminConfig | null;
  lockout: LockoutStore;
  verifyTurnstile: VerifyTurnstile;
  db: Db | null;
  ipSalt: string;
  log: Pick<Console, "error" | "warn">;
  now: () => number;
};

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; reason: "unavailable" | "locked" | "captcha" | "invalid" };

/**
 * The order matters:
 * 1. a locked-out visitor is refused before the password is looked at, so a
 *    correct guess after the lockout tells them nothing;
 * 2. Turnstile, so scripts cannot guess passwords without solving it;
 * 3. the password, in constant time; only a wrong password counts as a failure.
 */
export async function attemptLogin(
  deps: LoginDeps,
  input: { password: string; turnstileToken: string; ip: string | null },
): Promise<LoginResult> {
  const { config } = deps;
  if (!config) return { ok: false, reason: "unavailable" };

  const key = `ip:${input.ip ? hashIp(input.ip, deps.ipSalt) : "unknown"}`;
  if ((await deps.lockout.count(key)) >= MAX_FAILED_ATTEMPTS) return { ok: false, reason: "locked" };

  if (!input.turnstileToken || !(await deps.verifyTurnstile(input.turnstileToken, input.ip))) {
    return { ok: false, reason: "captcha" };
  }

  if (!safeEqual(input.password, config.password)) {
    const failures = await deps.lockout.increment(key, LOCKOUT_WINDOW_MS);
    deps.log.warn(`Admin sign-in failed (${failures} of ${MAX_FAILED_ATTEMPTS} before lockout).`);
    return { ok: false, reason: "invalid" };
  }

  await deps.lockout.clear(key);
  if (deps.db) {
    try {
      await writeAudit(deps.db, "login");
    } catch (error) {
      // A sign-in should not fail because the audit row could not be written.
      deps.log.error("Could not record the admin sign-in.", error);
    }
  }
  return { ok: true, token: createSessionToken(config, deps.now()) };
}

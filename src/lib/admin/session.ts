import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { AdminConfig } from "./config";

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

/** Constant-time string comparison (both sides are hashed, so length does not leak). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Changing either the password or the secret signs everyone out. */
function signingKey(config: AdminConfig): Buffer {
  return createHmac("sha256", config.sessionSecret).update(`admin-session:${config.password}`).digest();
}

const sign = (config: AdminConfig, payload: string) =>
  createHmac("sha256", signingKey(config)).update(payload).digest("base64url");

/** A signed, expiring session value for the cookie: "<payload>.<signature>". */
export function createSessionToken(config: AdminConfig, nowMs: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS })).toString(
    "base64url",
  );
  return `${payload}.${sign(config, payload)}`;
}

export function verifySessionToken(config: AdminConfig, token: string | undefined, nowMs: number): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!safeEqual(signature, sign(config, payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof exp === "number" && exp * 1000 > nowMs;
  } catch {
    return false;
  }
}

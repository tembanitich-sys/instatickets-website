import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SIGN_IN_TTL_MS = 30 * 60 * 1000;
export const PARTNER_SESSION_COOKIE = "partner_session";
export const PARTNER_SESSION_TTL_SECONDS = 12 * 60 * 60;

/** A random one-time token for a sign-in link, and the hash that is stored instead of it. */
export function newSignInToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Secret that signs partner session cookies. PARTNER_SESSION_SECRET if set, otherwise derived
 * from ADMIN_SESSION_SECRET with a different label, so the two cookies can never be swapped.
 */
export function partnerSessionSecret(env: Record<string, string | undefined> = process.env): string | null {
  const base = env.PARTNER_SESSION_SECRET || env.ADMIN_SESSION_SECRET;
  if (!base || base.length < 32) return null;
  return createHmac("sha256", base).update("partner-session").digest("hex");
}

const sign = (secret: string, payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export type PartnerSession = { partnerId: string; exp: number };

export function createPartnerSession(secret: string, partnerId: string, nowMs: number): string {
  const payload = Buffer.from(
    JSON.stringify({ pid: partnerId, exp: Math.floor(nowMs / 1000) + PARTNER_SESSION_TTL_SECONDS }),
  ).toString("base64url");
  return `${payload}.${sign(secret, payload)}`;
}

export function readPartnerSession(secret: string, token: string | undefined, nowMs: number): PartnerSession | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!safeEqual(signature, sign(secret, payload))) return null;
  try {
    const { pid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { pid?: unknown; exp?: unknown };
    if (typeof pid !== "string" || typeof exp !== "number" || exp * 1000 <= nowMs) return null;
    return { partnerId: pid, exp };
  } catch {
    return null;
  }
}

import { headers } from "next/headers";

/** The visitor's IP, used only (hashed) by rate limiting and lockout, and passed to Turnstile. */
export async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

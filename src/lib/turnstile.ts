/** Cloudflare's published test keys: the widget always passes. Placeholders until real keys exist. */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export const TURNSTILE_FIELD = "cf-turnstile-response";
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type VerifyTurnstile = (token: string, ip: string | null) => Promise<boolean>;

/** Site key for the browser widget. Falls back to the test key outside production only. */
export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? (process.env.NODE_ENV === "production" ? undefined : TURNSTILE_TEST_SITE_KEY);
}

/**
 * Verifies a Turnstile token server-side. Fails closed: a missing secret, a
 * network error or a bad response all count as "not verified".
 */
export function createTurnstileVerifier(options: {
  secret: string | undefined;
  fetchImpl?: typeof fetch;
  log?: Pick<Console, "error">;
}): VerifyTurnstile {
  const { secret, fetchImpl = fetch, log = console } = options;
  return async (token, ip) => {
    if (!secret) {
      log.error("Turnstile secret key is not configured; rejecting submission.");
      return false;
    }
    if (!token || token.length > 2048) return false;
    try {
      const body = new URLSearchParams({ secret, response: token });
      if (ip) body.set("remoteip", ip);
      const res = await fetchImpl(VERIFY_URL, {
        method: "POST",
        body,
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return false;
      const json = (await res.json()) as { success?: boolean };
      return json.success === true;
    } catch (error) {
      log.error("Turnstile verification request failed.", error);
      return false;
    }
  };
}

export function defaultTurnstileVerifier(): VerifyTurnstile {
  const secret =
    process.env.TURNSTILE_SECRET_KEY ?? (process.env.NODE_ENV === "production" ? undefined : TURNSTILE_TEST_SECRET_KEY);
  return createTurnstileVerifier({ secret });
}

import { describe, expect, it, vi } from "vitest";
import { createMemoryLimiter, hashIp } from "@/lib/ratelimit";
import { createTurnstileVerifier } from "@/lib/turnstile";

describe("createTurnstileVerifier", () => {
  const quiet = { error: () => {} };

  it("accepts a token Cloudflare approves and sends the secret, token and IP", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ success: true }));
    const verify = createTurnstileVerifier({ secret: "s3cret", fetchImpl: fetchImpl as never, log: quiet });
    expect(await verify("tok", "203.0.113.7")).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = init.body as URLSearchParams;
    expect(body.get("secret")).toBe("s3cret");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("203.0.113.7");
  });

  it("fails closed: rejected token, HTTP error, network error, missing secret or token", async () => {
    const reject = createTurnstileVerifier({
      secret: "s",
      fetchImpl: (async () => Response.json({ success: false })) as never,
      log: quiet,
    });
    expect(await reject("tok", null)).toBe(false);

    const httpError = createTurnstileVerifier({
      secret: "s",
      fetchImpl: (async () => new Response("no", { status: 500 })) as never,
      log: quiet,
    });
    expect(await httpError("tok", null)).toBe(false);

    const network = createTurnstileVerifier({
      secret: "s",
      fetchImpl: (async () => {
        throw new Error("offline");
      }) as never,
      log: quiet,
    });
    expect(await network("tok", null)).toBe(false);

    const noSecret = createTurnstileVerifier({ secret: undefined, log: quiet });
    expect(await noSecret("tok", null)).toBe(false);
    expect(await reject("", null)).toBe(false);
  });
});

describe("rate limiter", () => {
  it("allows the limit, blocks after it, and recovers when the window passes", async () => {
    let t = 0;
    const limiter = createMemoryLimiter({ limit: 3, windowMs: 1000, now: () => t });
    expect([await limiter.allow("k"), await limiter.allow("k"), await limiter.allow("k")]).toEqual([true, true, true]);
    expect(await limiter.allow("k")).toBe(false);
    expect(await limiter.allow("other")).toBe(true);
    t = 1001;
    expect(await limiter.allow("k")).toBe(true);
  });

  it("hashes IPs with a salt", () => {
    const a = hashIp("203.0.113.7", "salt-1");
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toContain("203");
    expect(hashIp("203.0.113.7", "salt-1")).toBe(a);
    expect(hashIp("203.0.113.7", "salt-2")).not.toBe(a);
    expect(hashIp("203.0.113.8", "salt-1")).not.toBe(a);
  });
});

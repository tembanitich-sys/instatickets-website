import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Returns true if the request may go ahead. */
export interface RateLimiter {
  allow(key: string): Promise<boolean>;
}

/**
 * IP addresses are never stored or logged in the clear. They are only used as
 * a keyed hash, and only inside the rate limiter.
 */
export function hashIp(ip: string, salt: string): string {
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}

/** In-process fallback and test double. Per server instance only. */
export function createMemoryLimiter(options: {
  limit: number;
  windowMs: number;
  now?: () => number;
}): RateLimiter {
  const { limit, windowMs, now = Date.now } = options;
  const hits = new Map<string, number[]>();
  return {
    async allow(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((h) => t - h < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.every((h) => t - h >= windowMs)) hits.delete(k);
      }
      return true;
    },
  };
}

/** Five submissions per ten minutes, per visitor, per form. */
export const SUBMISSION_LIMIT = 5;
export const SUBMISSION_WINDOW_MS = 10 * 60 * 1000;

let cached: RateLimiter | undefined;

/**
 * Upstash Redis when its env vars are set (shared across serverless instances),
 * otherwise an in-memory limiter. If Redis errors, the in-memory limiter is used
 * for that request rather than blocking real visitors.
 */
export function getRateLimiter(): RateLimiter {
  if (cached) return cached;
  const memory = createMemoryLimiter({ limit: SUBMISSION_LIMIT, windowMs: SUBMISSION_WINDOW_MS });
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cached = memory;
    return cached;
  }
  const upstash = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(SUBMISSION_LIMIT, "10 m"),
    prefix: "instatickets:forms",
  });
  cached = {
    async allow(key) {
      try {
        return (await upstash.limit(key)).success;
      } catch (error) {
        console.error("Rate limiter unavailable; using the in-memory limiter.", error);
        return memory.allow(key);
      }
    },
  };
  return cached;
}

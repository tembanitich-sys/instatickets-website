import { Redis } from "@upstash/redis";

/** Counts failed sign-ins per (hashed) visitor within a window. */
export interface LockoutStore {
  count(key: string): Promise<number>;
  /** Adds one failure; the window starts at the first failure. Returns the new count. */
  increment(key: string, windowMs: number): Promise<number>;
  clear(key: string): Promise<void>;
}

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export function createMemoryLockoutStore(now: () => number = Date.now): LockoutStore {
  const entries = new Map<string, { count: number; expiresAt: number }>();
  const live = (key: string) => {
    const e = entries.get(key);
    if (e && e.expiresAt > now()) return e;
    entries.delete(key);
    return undefined;
  };
  return {
    async count(key) {
      return live(key)?.count ?? 0;
    },
    async increment(key, windowMs) {
      const e = live(key) ?? { count: 0, expiresAt: now() + windowMs };
      e.count += 1;
      entries.set(key, e);
      return e.count;
    },
    async clear(key) {
      entries.delete(key);
    },
  };
}

function createUpstashLockoutStore(redis: Redis): LockoutStore {
  const k = (key: string) => `instatickets:admin-lockout:${key}`;
  return {
    async count(key) {
      return Number((await redis.get<number>(k(key))) ?? 0);
    },
    async increment(key, windowMs) {
      const n = await redis.incr(k(key));
      if (n === 1) await redis.pexpire(k(key), windowMs);
      return n;
    },
    async clear(key) {
      await redis.del(k(key));
    },
  };
}

let cached: LockoutStore | undefined;

/**
 * Upstash Redis when configured (shared across serverless instances), otherwise
 * in memory (per instance only, so a determined attacker gets more tries).
 */
export function getLockoutStore(): LockoutStore {
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  cached = url && token ? createUpstashLockoutStore(new Redis({ url, token })) : createMemoryLockoutStore();
  return cached;
}

import { createHash } from 'crypto';

/**
 * Fixed-window rate limiter kept in process memory.
 *
 * Nothing is persisted or logged, and keys are hashed, so no IP address is stored.
 * Limitation: on Vercel each serverless instance has its own memory, so an attacker
 * spread across instances gets a multiple of the limit. It still stops the cheap,
 * single-client scripted abuse; add Vercel Firewall rate-limit rules for a hard cap.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();
const MAX_KEYS = 10_000;

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('base64url').slice(0, 22);
}

function sweep(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [k, w] of buckets) if (w.resetAt <= now) buckets.delete(k);
  // Still full (under attack): drop oldest entries rather than grow unbounded.
  if (buckets.size >= MAX_KEYS) {
    const excess = buckets.size - MAX_KEYS / 2;
    let i = 0;
    for (const k of buckets.keys()) {
      if (i++ >= excess) break;
      buckets.delete(k);
    }
  }
}

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

/** Count one hit for `key` in `scope`; returns ok=false once `limit` hits occur within `windowMs`. */
export function rateLimit(scope: string, key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const k = `${scope}:${hashKey(key)}`;
  const w = buckets.get(k);
  if (!w || w.resetAt <= now) {
    buckets.set(k, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  w.count += 1;
  return { ok: w.count <= limit, retryAfterSeconds: Math.ceil((w.resetAt - now) / 1000) };
}

/** Best-effort client IP. On Vercel, x-forwarded-for is set by the platform. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}

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

/**
 * Check `key` without counting a hit: ok=false once `limit` hits have already been counted
 * in the current window. Pair it with `rateLimit` in the same synchronous step (no `await`
 * in between) to count only some outcomes, e.g. failed logins.
 */
export function peekRateLimit(scope: string, key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const w = buckets.get(`${scope}:${hashKey(key)}`);
  if (!w || w.resetAt <= now) return { ok: true, retryAfterSeconds: 0 };
  return { ok: w.count < limit, retryAfterSeconds: Math.ceil((w.resetAt - now) / 1000) };
}

/** Take back one hit counted by `rateLimit` (e.g. the request turned out not to count). */
export function refundRateLimit(scope: string, key: string): void {
  const w = buckets.get(`${scope}:${hashKey(key)}`);
  if (w && w.count > 0) w.count -= 1;
}

/** Forget every hit for `key` in `scope` (e.g. failed logins after a successful one). */
export function resetRateLimit(scope: string, key: string): void {
  buckets.delete(`${scope}:${hashKey(key)}`);
}

/** Whole minutes to wait (at least 1), for user-facing "thử lại sau N phút" messages. */
export function retryAfterMinutes(retryAfterSeconds: number): number {
  return Math.max(1, Math.ceil(retryAfterSeconds / 60));
}

/**
 * Best-effort client IP, used only (hashed, in memory) as a rate-limit key.
 *
 * Production: tepup.space is proxied by Cloudflare in front of Vercel, so the connection Vercel
 * sees comes from a Cloudflare edge server. Vercel's `x-real-ip` / `x-forwarded-for` therefore hold
 * that edge IP, which thousands of unrelated visitors share. Cloudflare puts the real visitor IP
 * in `cf-connecting-ip`, so that header wins when present.
 *
 * ⚠️ Spoofing caveat: anyone who reaches the origin directly (the `*.vercel.app` URL) can send
 * their own `cf-connecting-ip` and pick a fresh value per request, which escapes the per-IP limits.
 * That's why login also has a per-username cap that doesn't depend on the IP. To close the hole,
 * block direct origin access (Vercel deployment protection on the vercel.app domain) or have a
 * Cloudflare Transform Rule add a secret header and trust `cf-connecting-ip` only alongside it.
 *
 * Locally (no Cloudflare) it falls back to `x-real-ip`, then the first `x-forwarded-for` hop.
 */
export function clientIp(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf;
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  const first = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return first || 'unknown';
}

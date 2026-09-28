/**
 * Deterministic shuffle for exercise blocks.
 *
 * Matching and sorting exercises have to scramble the authored order, otherwise
 * the answers line up row by row and the exercise is free. `Math.random()` can't
 * do it: block components are `'use client'` but still render on the server, so
 * a random order server-side and a different one client-side is a hydration
 * mismatch. Seeding from the block's own content gives both sides the same
 * result — no mismatch, no post-mount reshuffle flash.
 *
 * The trade-off is that every learner sees the same order, which is fine here:
 * these are practice blocks inside a lesson, not a graded test.
 */

/** FNV-1a — small, dependency-free, and good enough to spread similar strings apart. */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32 — one seed in, a repeatable stream of [0, 1) out. */
function makeRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates driven by `seed`. Same seed and same input always give the same
 * output, so this is safe to call during render.
 */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const random = makeRandom(hashString(seed));
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

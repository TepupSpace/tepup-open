/**
 * Sequence alignment by longest common subsequence (pure, no deps).
 *
 * Common prefix and suffix are stripped first (cheap, and usually most of a lesson).
 * The middle is aligned with a full LCS table only while it stays under `maxCells`
 * (rows × columns); above that the middle is paired by position and the result is
 * flagged `approximate`, so a huge lesson can't stall the server or the browser.
 */

export type AlignOp =
  | { op: 'eq'; a: number; b: number }
  | { op: 'del'; a: number }
  | { op: 'ins'; b: number };

export interface AlignResult {
  ops: AlignOp[];
  /** True when the middle part was too large for LCS and was paired by position. */
  approximate: boolean;
}

/** About 400 × 400 blocks. */
export const BLOCK_MAX_CELLS = 400 * 400;

export function align(a: readonly string[], b: readonly string[], maxCells = BLOCK_MAX_CELLS): AlignResult {
  const ops: AlignOp[] = [];
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) {
    ops.push({ op: 'eq', a: start, b: start });
    start++;
  }
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const n = endA - start;
  const m = endB - start;
  let approximate = false;

  if (n === 0) {
    for (let j = start; j < endB; j++) ops.push({ op: 'ins', b: j });
  } else if (m === 0) {
    for (let i = start; i < endA; i++) ops.push({ op: 'del', a: i });
  } else if (n * m <= maxCells) {
    // dp[i][j] = LCS length of a[start+i..endA) and b[start+j..endB).
    const w = m + 1;
    const dp = new Uint32Array((n + 1) * w);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i * w + j] =
          a[start + i] === b[start + j]
            ? dp[(i + 1) * w + j + 1] + 1
            : Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[start + i] === b[start + j]) {
        ops.push({ op: 'eq', a: start + i, b: start + j });
        i++;
        j++;
      } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
        ops.push({ op: 'del', a: start + i });
        i++;
      } else {
        ops.push({ op: 'ins', b: start + j });
        j++;
      }
    }
    for (; i < n; i++) ops.push({ op: 'del', a: start + i });
    for (; j < m; j++) ops.push({ op: 'ins', b: start + j });
  } else {
    approximate = true;
    const k = Math.max(n, m);
    for (let p = 0; p < k; p++) {
      const ai = start + p;
      const bi = start + p;
      if (p < n && p < m && a[ai] === b[bi]) {
        ops.push({ op: 'eq', a: ai, b: bi });
        continue;
      }
      if (p < n) ops.push({ op: 'del', a: ai });
      if (p < m) ops.push({ op: 'ins', b: bi });
    }
  }

  for (let i = endA, j = endB; i < a.length; i++, j++) ops.push({ op: 'eq', a: i, b: j });
  return { ops, approximate };
}

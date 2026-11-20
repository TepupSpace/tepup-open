import { describe, expect, it } from 'vitest';
import {
  SHELF_GAP,
  SHELF_S,
  chapterStates,
  createWheelGate,
  dragSnap,
  shelfBase,
  shelfPose,
  shelfResting,
  shelfXs,
  stepShelf,
  type ShelfMotion,
} from '@/lib/paper/useShelfRunner';

describe('shelf pose', () => {
  const base = shelfBase(1200);
  const xs = shelfXs(base);

  it('picks 85% / 68% shelf size', () => {
    expect(shelfBase(1200)).toBe(0.85);
    expect(shelfBase(390)).toBe(0.68);
  });

  it('centre folder is straight, full size, opaque', () => {
    const p = shelfPose(0, base, xs);
    expect(p.x).toBe(0);
    expect(Math.abs(p.ry)).toBe(0);
    expect(p.s).toBeCloseTo(base);
    expect(p.op).toBe(1);
  });

  it('steps tilt 25/45/62 deg and shrink 80/66/54%, mirrored', () => {
    [25, 45, 62].forEach((deg, i) => {
      expect(shelfPose(i + 1, base, xs).ry).toBeCloseTo(-deg);
      expect(shelfPose(-(i + 1), base, xs).ry).toBeCloseTo(deg);
      expect(shelfPose(i + 1, base, xs).s).toBeCloseTo(base * SHELF_S[i + 1]);
    });
    expect(shelfPose(-2, base, xs).x).toBeCloseTo(-shelfPose(2, base, xs).x);
  });

  it('first step leaves at least the screen gap after the centre folder edge', () => {
    expect(xs[1]).toBeGreaterThan(150 * base + SHELF_GAP);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it('fades out completely at step 4', () => {
    expect(shelfPose(4, base, xs).op).toBe(0);
    expect(shelfPose(-5, base, xs).op).toBe(0);
  });
});

describe('shelf motion', () => {
  function run(m: ShelfMotion, seconds: number) {
    let peak = 0;
    let overshoot = false;
    for (let t = 0; t < seconds; t += 1 / 60) {
      const s = stepShelf(m, 1 / 60);
      m.pos = s.pos;
      m.vel = s.vel;
      peak = Math.max(peak, Math.abs(m.vel));
      if ((m.target - m.pos) * Math.sign(m.target) < -1e-6) overshoot = true;
    }
    return { peak, overshoot };
  }

  it('normal glide caps at 1.2 folder/s, settles without bounce', () => {
    const m: ShelfMotion = { pos: 0, vel: 0, target: 3, held: false, fast: false };
    const r = run(m, 5);
    expect(r.peak).toBeLessThanOrEqual(1.2 + 1e-9);
    expect(r.overshoot).toBe(false);
    expect(shelfResting(m)).toBe(true);
  });

  it('fast glide can reach up to 6 folder/s', () => {
    const m: ShelfMotion = { pos: 0, vel: 0, target: 6, held: false, fast: true };
    const r = run(m, 4);
    expect(r.peak).toBeGreaterThan(1.2);
    expect(r.peak).toBeLessThanOrEqual(6 + 1e-9);
    expect(r.overshoot).toBe(false);
  });

  it('drag follows the finger with ~0.1s lag', () => {
    const m: ShelfMotion = { pos: 0, vel: 0, target: 1, held: true, fast: false };
    run(m, 0.1);
    expect(m.pos).toBeGreaterThan(0.55);
    expect(m.pos).toBeLessThan(0.7);
  });

  it('release snaps to nearest, a >1/10 step nudge moves one folder', () => {
    expect(dragSnap(2, 2.05)).toBe(2);
    expect(dragSnap(2, 2.15)).toBe(3);
    expect(dragSnap(2, 1.85)).toBe(1);
    expect(dragSnap(2, 3.7)).toBe(4);
  });
});

describe('wheel gate', () => {
  it('one folder per swipe, ignores inertia tail', () => {
    const gate = createWheelGate();
    const steps: number[] = [];
    let t = 0;
    for (const mag of [10, 30, 40, 30, 20, 12, 8, 5, 3, 2, 1]) {
      steps.push(gate(mag, (t += 16)));
    }
    expect(steps.filter((s) => s !== 0)).toEqual([1]);
    // pause > 160ms → new swipe
    expect(gate(5, t + 200)).toBe(1);
    // direction change → new swipe
    expect(gate(-5, t + 216)).toBe(-1);
  });
});

describe('chapter states', () => {
  it('done / first not-done is go / later not-done is skip', () => {
    expect(chapterStates([false, false, false])).toEqual(['go', 'skip', 'skip']);
    expect(chapterStates([true, false, true, false])).toEqual(['done', 'go', 'done', 'skip']);
    expect(chapterStates([true, true])).toEqual(['done', 'done']);
  });
});

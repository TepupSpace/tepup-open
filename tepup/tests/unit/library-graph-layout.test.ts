import { describe, it, expect } from 'vitest';
import { ForceSim, layoutGraph, nodeRadius, REHEAT } from '@/lib/library/graph-layout';

// Hai cụm (0–4 quanh 0, 5–9 quanh 5) nối nhau bằng một cạnh, cộng hai mục lẻ.
const clusterEdges = [
  ...[1, 2, 3, 4].map((t) => ({ s: 0, t })),
  ...[6, 7, 8, 9].map((t) => ({ s: 5, t })),
  { s: 0, t: 5 },
];
const N = 12;
const degrees = () => {
  const deg = new Array<number>(N).fill(0);
  for (const e of clusterEdges) {
    deg[e.s]++;
    deg[e.t]++;
  }
  return deg;
};
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe('library graph layout', () => {
  it('is deterministic', () => {
    expect(layoutGraph(N, clusterEdges)).toEqual(layoutGraph(N, clusterEdges));
  });

  it('gives finite positions, also for no edges and a single node', () => {
    for (const p of [...layoutGraph(N, clusterEdges), ...layoutGraph(5, []), ...layoutGraph(1, [])]) {
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
  });

  it('keeps each entry nearer the hub it links to than the other hub', () => {
    const p = layoutGraph(N, clusterEdges);
    for (const t of [1, 2, 3, 4]) expect(dist(p[t], p[0])).toBeLessThan(dist(p[t], p[5]));
    for (const t of [6, 7, 8, 9]) expect(dist(p[t], p[5])).toBeLessThan(dist(p[t], p[0]));
  });

  it('does not let dots overlap', () => {
    const p = layoutGraph(N, clusterEdges);
    const deg = degrees();
    for (let i = 0; i < N; i++)
      for (let j = i + 1; j < N; j++) expect(dist(p[i], p[j])).toBeGreaterThan(nodeRadius(deg[i]) + nodeRadius(deg[j]));
  });

  it('settles from given positions without moving far when nothing changed', () => {
    const p = layoutGraph(N, clusterEdges);
    const deg = degrees();
    const sim = new ForceSim(p, clusterEdges, deg.map(nodeRadius));
    sim.alpha = 0;
    sim.reheat(REHEAT);
    sim.settle();
    sim.nodes.forEach((q, i) => expect(dist(q, p[i])).toBeLessThan(15));
  });

  it('holds a pinned (dragged) dot where it is put, and its neighbours follow', () => {
    const p = layoutGraph(N, clusterEdges);
    const deg = degrees();
    const sim = new ForceSim(p, clusterEdges, deg.map(nodeRadius));
    const leafBefore = dist(p[1], { x: 400, y: 400 });
    sim.nodes[0].fx = 400;
    sim.nodes[0].fy = 400;
    sim.alphaTarget = REHEAT;
    for (let i = 0; i < 200; i++) sim.tick();
    expect(sim.nodes[0]).toMatchObject({ x: 400, y: 400 });
    expect(dist(sim.nodes[1], { x: 400, y: 400 })).toBeLessThan(leafBefore / 2);
    expect(sim.running).toBe(true);
    sim.alphaTarget = 0;
    sim.nodes[0].fx = sim.nodes[0].fy = null;
    sim.settle();
    expect(sim.running).toBe(false);
  });
});

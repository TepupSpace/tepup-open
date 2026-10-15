'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import type { GraphData } from '@/lib/library/entry-service';
import { ENTRY_TYPES, TYPE_LABELS, type EntryType } from '@/lib/library/schemas';
import { tvHref } from '@/lib/library/refs';
import { ForceSim, REHEAT, nodeRadius, type Pos } from '@/lib/library/graph-layout';

/**
 * Bản đồ thư viện: mọi mục và liên kết giữa chúng, như graph view của Obsidian
 * (docs/design-reference-library.md §7.5). Mỗi chấm là một link /tv/ thường, nên rê chuột
 * hiện xem nhanh và bấm mở bảng bên như ở mọi nơi khác. Danh sách bên dưới là cách đọc tương
 * đương cho bàn phím và trình đọc màn hình.
 *
 * Cách làm theo Obsidian (xem lib/library/graph-layout.ts):
 * - Bố cục đầu tính ở server (cache cùng dữ liệu). Lọc không xếp lại từ đầu: các chấm còn lại
 *   giữ chỗ và trôi tới chỗ mới khi mô phỏng được hâm lại.
 * - Kéo một chấm thì ghim nó dưới con trỏ và các chấm nối với nó đi theo; thả ra thì nguội dần.
 *   Chỉ tính là kéo khi con trỏ đi quá 5 điểm ảnh, nên bấm vẫn là bấm.
 * - Phóng quanh con trỏ (Ctrl/⌘ + cuộn, hoặc chụm hai ngón), chuyển cảnh mượt.
 * - Rê chuột làm mờ dần mọi thứ không nối với chấm đó; nhãn hiện thêm khi phóng to, và không
 *   bao giờ đè lên nhau (ưu tiên chấm đang nổi, hàng xóm của nó, rồi chấm nhiều liên kết).
 * Người dùng bật "giảm chuyển động" thì không có hoạt cảnh: mọi thứ nhảy thẳng tới chỗ mới.
 */

const TYPE_FILL: Record<EntryType, string> = {
  CONCEPT: 'fill-purple-500',
  SOURCE: 'fill-amber-500',
  ACRONYM: 'fill-sky-500',
  TOOL: 'fill-emerald-500',
};
const TYPE_DOT: Record<EntryType, string> = {
  CONCEPT: 'bg-purple-500',
  SOURCE: 'bg-amber-500',
  ACRONYM: 'bg-sky-500',
  TOOL: 'bg-emerald-500',
};

type View = { k: number; x: number; y: number };
type Side = 'below' | 'above' | 'right' | 'left';

let canvasCtx: CanvasRenderingContext2D | null = null;
const measureCtx = () => (canvasCtx ??= document.createElement('canvas').getContext('2d'));

const PAD = 36;
/** Độ mờ của phần không liên quan khi một chấm đang nổi (Obsidian: 0.2). */
const DIM = 0.2;
/** Con trỏ đi quá ngần này (điểm ảnh) thì là kéo, không phải bấm. */
const DRAG_PX = 5;
const K_MIN = 0.3;
const K_MAX = 8;
const MAX_LABEL_CHARS = 34;
/** Vùng bấm tối thiểu quanh chấm (bán kính, điểm ảnh): 24×24 theo WCAG 2.5.8. */
const MIN_HIT = 12;

const clampK = (k: number) => Math.min(K_MAX, Math.max(K_MIN, k));
const shortTitle = (t: string) => (t.length > MAX_LABEL_CHARS ? `${t.slice(0, MAX_LABEL_CHARS - 1)}…` : t);

export default function LibraryGraph({ data, focus }: { data: GraphData; focus?: string }) {
  const [types, setTypes] = useState<Set<EntryType>>(() => new Set(ENTRY_TYPES));
  const [orphans, setOrphans] = useState(true);
  // Như "local graph" của Obsidian: chỉ các mục cách ?muc= tối đa `depth` bước. 0 = toàn bộ.
  const [depth, setDepth] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  // Phóng (k) và kéo (x, y, điểm ảnh). null = mặc định (vừa khung, hoặc quanh ?muc=).
  const [view, setView] = useState<View | null>(null);
  // Kích thước khung: đo sau khi gắn; giá trị đầu dùng chung cho server và lần render đầu.
  const [size, setSize] = useState({ w: 800, h: 480 });
  // Cỡ nhãn = text-xs (0,75rem), theo cỡ chữ người đọc chọn.
  const [labelPx, setLabelPx] = useState(12);
  // Tăng mỗi khi mô phỏng chạy một nhịp, để vẽ lại.
  const [, setFrame] = useState(0);
  // Tăng khi các chấm đã nằm yên: lúc đó mới tính lại nhãn nào hiện (tránh nhấp nháy khi đang trôi).
  const [settled, setSettled] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  // Vị trí sống của mọi mục (kể cả mục đang ẩn), giữ qua mọi lần lọc.
  const [pos] = useState<Pos[]>(() => data.nodes.map((nd) => ({ x: nd.x, y: nd.y })));
  const sim = useRef<{ sim: ForceSim; idx: number[] } | null>(null);
  const target = useRef<View | null>(null);
  const raf = useRef<number | null>(null);
  const reduced = useRef(false);
  const pan = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const nodeDrag = useRef<{ i: number; id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const ticks = useRef(0);
  // Đổi phạm vi (đồ thị cục bộ) là xem một đồ thị khác: vừa khung lại khi các chấm đã yên.
  const fitOnSettle = useRef(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const readFont = () => setLabelPx(0.75 * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16));
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setSize({ w: Math.round(width), h: Math.round(height) });
      readFont();
    });
    ro.observe(el);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
    const onMq = () => (reduced.current = mq.matches);
    mq.addEventListener('change', onMq);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', onMq);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  // Bậc và hàng xóm trên toàn bộ dữ liệu.
  const { degree, adj } = useMemo(() => {
    const deg = new Array<number>(data.nodes.length).fill(0);
    const adj = data.nodes.map(() => [] as number[]);
    for (const e of data.edges) {
      deg[e.s]++;
      deg[e.t]++;
      adj[e.s].push(e.t);
      adj[e.t].push(e.s);
    }
    return { degree: deg, adj };
  }, [data]);

  const focusIdx = useMemo(() => {
    const i = focus ? data.nodes.findIndex((nd) => nd.slug === focus) : -1;
    return i < 0 ? undefined : i;
  }, [data, focus]);

  // Mục hiện ra theo bộ lọc (chỉ số trong data.nodes); liên kết chỉ giữa các mục đang hiện.
  const graph = useMemo(() => {
    let near: Set<number> | null = null;
    if (depth > 0 && focusIdx !== undefined) {
      near = new Set([focusIdx]);
      let ring = [focusIdx];
      for (let d = 0; d < depth; d++) {
        const next: number[] = [];
        for (const i of ring)
          for (const j of adj[i])
            if (!near.has(j)) {
              near.add(j);
              next.push(j);
            }
        ring = next;
      }
    }
    const keep = data.nodes.map(
      (nd, i) => i === focusIdx || (types.has(nd.type) && (orphans || degree[i] > 0) && (!near || near.has(i))),
    );
    const idx = data.nodes.flatMap((_, i) => (keep[i] ? [i] : []));
    const edges = data.edges.filter((e) => keep[e.s] && keep[e.t]);
    const neighbors = data.nodes.map(() => new Set<number>());
    for (const e of edges) {
      neighbors[e.s].add(e.t);
      neighbors[e.t].add(e.s);
    }
    return { keep, idx, edges, neighbors };
  }, [data, types, orphans, depth, focusIdx, adj, degree]);

  // Khung ban đầu: bao trọn cả thư viện. Không đổi khi lọc, để các chấm trôi chứ không nhảy.
  const box = useMemo(() => {
    if (!data.nodes.length) return { cx: 0, cy: 0, w: 1, h: 1 };
    const xs = data.nodes.map((nd) => nd.x);
    const ys = data.nodes.map((nd) => nd.y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0 || 1, h: y1 - y0 || 1 };
  }, [data]);
  // Tỉ lệ "vừa khung": toàn bộ hình nằm trong khung, chừa lề cho nhãn.
  const fit = Math.min((size.w - PAD * 2) / box.w, (size.h - PAD * 2) / box.h, 2.5);

  const v: View =
    view ??
    (focusIdx === undefined
      ? { k: 1, x: 0, y: 0 }
      : // Đặt mục được chọn vào giữa khung, phóng to một chút. Lấy vị trí ban đầu (data), không phải
        // vị trí sống: nếu không, kéo mục đó thì khung chạy theo nó và chấm như đứng yên.
        { k: 1.6, x: -(data.nodes[focusIdx].x - box.cx) * fit * 1.6, y: -(data.nodes[focusIdx].y - box.cy) * fit * 1.6 });
  const vRef = useRef(v);
  vRef.current = v;

  /** Toạ độ mô phỏng → điểm ảnh trong khung, và ngược lại. */
  const sx = (p: Pos) => (p.x - box.cx) * fit * v.k + size.w / 2 + v.x;
  const sy = (p: Pos) => (p.y - box.cy) * fit * v.k + size.h / 2 + v.y;
  const toWorld = (px: number, py: number): Pos => ({
    x: (px - size.w / 2 - v.x) / (fit * v.k) + box.cx,
    y: (py - size.h / 2 - v.y) / (fit * v.k) + box.cy,
  });
  /** Chấm to lên chậm hơn khoảng cách khi phóng (√k, như Obsidian). */
  const nodeScale = Math.min(2, Math.max(0.8, Math.sqrt(v.k)));
  const radius = (i: number) => nodeRadius(degree[i]) * nodeScale;

  // Một vòng requestAnimationFrame chung cho mô phỏng và chuyển cảnh; tự dừng khi không còn gì chạy.
  const step = useCallback(() => {
    raf.current = null;
    let busy = false;
    let fitNow = false;
    const s = sim.current;
    if (s && s.sim.running) {
      s.sim.tick();
      s.idx.forEach((i, j) => {
        pos[i].x = s.sim.nodes[j].x;
        pos[i].y = s.sim.nodes[j].y;
      });
      busy = s.sim.running;
      // Đặt lại nhãn khi đã yên, và ~4 lần mỗi giây trong lúc trôi để nhãn không đè nhau lâu.
      if (!busy || ++ticks.current % 15 === 0) setSettled((n) => n + 1);
      if (!busy && fitOnSettle.current) {
        fitOnSettle.current = false;
        fitNow = true;
      }
    }
    const t = target.current;
    if (t) {
      const c = vRef.current;
      // Tiến 15% quãng còn lại mỗi khung (Obsidian: 0.85).
      const next = { k: c.k + (t.k - c.k) * 0.15, x: c.x + (t.x - c.x) * 0.15, y: c.y + (t.y - c.y) * 0.15 };
      const done = Math.abs(t.k / c.k - 1) < 0.002 && Math.abs(t.x - c.x) < 0.5 && Math.abs(t.y - c.y) < 0.5;
      setView(done ? t : next);
      if (done) target.current = null;
      else busy = true;
    }
    setFrame((f) => f + 1);
    if (busy) raf.current = requestAnimationFrame(step);
    if (fitNow) fitRef.current();
  }, [pos]);
  const kick = useCallback(() => {
    if (raf.current === null) raf.current = requestAnimationFrame(step);
  }, [step]);

  /** Mô phỏng trên các mục đang hiện, bắt đầu từ chỗ hiện tại của chúng. */
  const ensureSim = useCallback(() => {
    if (sim.current) return sim.current.sim;
    const local = new Map(graph.idx.map((i, j) => [i, j]));
    const s = new ForceSim(
      graph.idx.map((i) => pos[i]),
      graph.edges.map((e) => ({ s: local.get(e.s)!, t: local.get(e.t)! })),
      graph.idx.map((i) => nodeRadius(degree[i])),
    );
    s.alpha = 0;
    sim.current = { sim: s, idx: graph.idx };
    return s;
  }, [graph, pos, degree]);

  // Lọc đổi → dựng lại mô phỏng trên các mục còn lại và hâm lại (Obsidian: alpha 0.3).
  const firstGraph = useRef(graph);
  useEffect(() => {
    sim.current = null;
    // Lần đầu (kể cả khi StrictMode chạy hiệu ứng hai lần): bố cục từ server đã nằm yên.
    if (graph === firstGraph.current) return;
    const s = ensureSim();
    s.reheat(REHEAT);
    if (reduced.current) {
      s.settle();
      sim.current!.idx.forEach((i, j) => {
        pos[i].x = s.nodes[j].x;
        pos[i].y = s.nodes[j].y;
      });
      setSettled((n) => n + 1);
      if (fitOnSettle.current) {
        fitOnSettle.current = false;
        fitRef.current();
      }
    } else kick();
  }, [graph, ensureSim, kick, pos]);

  /** Đổi cảnh: mượt, hoặc nhảy thẳng khi người dùng giảm chuyển động. */
  const goTo = (next: View) => {
    if (reduced.current) {
      target.current = null;
      setView(next);
    } else {
      target.current = next;
      kick();
    }
  };
  /** Phóng `f` lần, giữ nguyên điểm (px, py) của khung. */
  const zoomAt = (f: number, px = size.w / 2, py = size.h / 2, from: View = target.current ?? v) => {
    const k = clampK(from.k * f);
    const r = k / from.k;
    return { k, x: px - size.w / 2 - (px - size.w / 2 - from.x) * r, y: py - size.h / 2 - (py - size.h / 2 - from.y) * r };
  };
  /** Vừa khung với các mục đang hiện. */
  const fitVisible = () => {
    if (!graph.idx.length) return goTo({ k: 1, x: 0, y: 0 });
    const xs = graph.idx.map((i) => pos[i].x);
    const ys = graph.idx.map((i) => pos[i].y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    // Chừa thêm một dòng nhãn ở trên và dưới, để nhãn của chấm sát mép không bị cắt.
    const padY = PAD + labelPx * 1.5;
    const want = Math.min((size.w - PAD * 2) / (x1 - x0 || 1), (size.h - padY * 2) / (y1 - y0 || 1), 2.5 * 1.6);
    const k = clampK(want / fit);
    goTo({ k, x: -((x0 + x1) / 2 - box.cx) * fit * k, y: -((y0 + y1) / 2 - box.cy) * fit * k });
  };
  const fitRef = useRef(fitVisible);
  fitRef.current = fitVisible;

  // Ctrl/⌘ + cuộn (và chụm trên bàn di chuột, trình duyệt gửi như Ctrl + cuộn) để phóng quanh
  // con trỏ. Cuộn thường vẫn cuộn trang, để bản đồ không giữ chân người đang đọc trang.
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1);
    goTo(zoomAt(Math.pow(1.5, -dy / 120), e.clientX - rect.left, e.clientY - rect.top));
  };
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => wheelRef.current(e);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const toggleType = (t: EntryType) =>
    setTypes((s) => {
      const next = new Set(s);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const active = dragging ?? (hover !== null ? data.nodes.findIndex((nd) => nd.slug === hover) : undefined) ?? focusIdx;
  const activeIdx = active === undefined || active < 0 || !graph.keep[active] ? undefined : active;
  const lit = (i: number) => activeIdx === undefined || i === activeIdx || graph.neighbors[activeIdx].has(i);

  // Đo độ rộng nhãn thật bằng canvas (theo phông của trang); ở server thì ước lượng.
  const widths = useRef(new Map<string, number>());
  const measure = (text: string, bold: boolean) => {
    const key = `${labelPx}|${bold ? 'b' : ''}|${text}`;
    let w = widths.current.get(key);
    if (w === undefined) {
      const ctx = typeof document === 'undefined' ? null : measureCtx();
      if (ctx && svgRef.current) {
        ctx.font = `${bold ? 600 : 400} ${labelPx}px ${getComputedStyle(svgRef.current).fontFamily}`;
        w = ctx.measureText(text).width;
      } else w = text.length * labelPx * 0.6;
      widths.current.set(key, w);
    }
    return w;
  };

  // Đặt nhãn: xếp theo ưu tiên (chấm đang nổi, hàng xóm của nó, mục đang xem, rồi mục nhiều liên
  // kết), thử bốn chỗ quanh chấm (dưới, trên, phải, trái) và bỏ nhãn nếu chỗ nào cũng đè lên một
  // nhãn khác hay một chấm khác. Phóng to thì có thêm chỗ, nên hiện thêm nhãn. Chỉ phụ thuộc mức
  // phóng (kéo khung không đổi khoảng cách), nên tính lại khi phóng, lọc, nổi, hoặc khi các chấm
  // vừa nằm yên.
  const kKey = Math.round(v.k * 20) / 20;
  const labels = useMemo(() => {
    const s = fit * kKey;
    const sc = Math.min(2, Math.max(0.8, Math.sqrt(kKey)));
    const h = labelPx * 1.4;
    const rank = (i: number) =>
      i === activeIdx ? 0 : activeIdx !== undefined && graph.neighbors[activeIdx].has(i) ? 1 : i === focusIdx ? 2 : 3;
    const order = [...graph.idx].sort(
      (a, b) => rank(a) - rank(b) || degree[b] - degree[a] || data.nodes[a].title.localeCompare(data.nodes[b].title, 'vi'),
    );
    type Rect = { l: number; r: number; t: number; b: number };
    const hit = (a: Rect, b: Rect) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
    const dots = graph.idx.map((i) => {
      const r = nodeRadius(degree[i]) * sc;
      return { i, l: pos[i].x * s - r, r: pos[i].x * s + r, t: pos[i].y * s - r, b: pos[i].y * s + r };
    });
    const placed: Rect[] = [];
    const where = new Map<number, Side>();
    for (const i of order) {
      const w = measure(shortTitle(data.nodes[i].title), i === activeIdx) + 6; // + viền trắng của chữ
      const x = pos[i].x * s;
      const y = pos[i].y * s;
      const r = nodeRadius(degree[i]) * sc;
      const rects: [Side, Rect][] = [
        ['below', { l: x - w / 2, r: x + w / 2, t: y + r + 2, b: y + r + 2 + h }],
        ['above', { l: x - w / 2, r: x + w / 2, t: y - r - 2 - h, b: y - r - 2 }],
        ['right', { l: x + r + 4, r: x + r + 4 + w, t: y - h / 2, b: y + h / 2 }],
        ['left', { l: x - r - 4 - w, r: x - r - 4, t: y - h / 2, b: y + h / 2 }],
      ];
      const free = rects.find(([, rect]) => !placed.some((p) => hit(p, rect)) && !dots.some((d) => d.i !== i && hit(d, rect)));
      const pick = free ?? (i === activeIdx ? rects[0] : undefined);
      if (!pick) continue;
      placed.push(pick[1]);
      where.set(i, pick[0]);
    }
    return where;
    // `pos` đổi tại chỗ; `settled` báo khi các chấm vừa nằm yên, nên có trong danh sách để tính lại.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settled là tín hiệu tính lại, measure chỉ đọc cache
  }, [graph, kKey, fit, activeIdx, focusIdx, degree, data, labelPx, pos, settled]);

  const svgPoint = (e: { clientX: number; clientY: number }) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const a = (e.target as Element).closest('a');
    if (a) {
      const i = Number(a.getAttribute('data-i'));
      // Chưa bắt con trỏ: nếu không kéo, click vẫn tới link như thường.
      nodeDrag.current = { i, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
      return;
    }
    pointers.current.set(e.pointerId, svgPoint(e));
    e.currentTarget.setPointerCapture(e.pointerId);
    pan.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y };
    target.current = null;
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = nodeDrag.current;
    if (d && d.id === e.pointerId) {
      if (!d.moved) {
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) <= DRAG_PX) return;
        d.moved = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(d.i);
      }
      const p = toWorld(svgPoint(e).x, svgPoint(e).y);
      if (reduced.current) {
        // Không hoạt cảnh: chỉ chấm đang kéo di chuyển.
        pos[d.i].x = p.x;
        pos[d.i].y = p.y;
        sim.current = null;
        setFrame((f) => f + 1);
        return;
      }
      const s = ensureSim();
      const j = sim.current!.idx.indexOf(d.i);
      if (j < 0) return;
      s.nodes[j].fx = p.x;
      s.nodes[j].fy = p.y;
      // Giữ ấm trong lúc kéo (Obsidian: alphaTarget 0.3), nên các chấm nối với nó đi theo.
      s.alphaTarget = REHEAT;
      s.reheat(REHEAT);
      kick();
      return;
    }
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    const now = svgPoint(e);
    if (pointers.current.size >= 2) {
      // Chụm hai ngón: phóng quanh điểm giữa và kéo theo điểm giữa.
      const other = [...pointers.current.entries()].find(([id]) => id !== e.pointerId)![1];
      const before = Math.hypot(prev.x - other.x, prev.y - other.y);
      const after = Math.hypot(now.x - other.x, now.y - other.y);
      pointers.current.set(e.pointerId, now);
      if (before > 0 && after > 0) {
        const mid = { x: (now.x + other.x) / 2, y: (now.y + other.y) / 2 };
        const z = zoomAt(after / before, mid.x, mid.y, vRef.current);
        setView({ k: z.k, x: z.x + (now.x - prev.x) / 2, y: z.y + (now.y - prev.y) / 2 });
      }
      pan.current = null;
      return;
    }
    pointers.current.set(e.pointerId, now);
    const p = pan.current;
    if (p) setView({ k: v.k, x: p.vx + e.clientX - p.x, y: p.vy + e.clientY - p.y });
  };

  const endPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = nodeDrag.current;
    if (d && d.id === e.pointerId) {
      nodeDrag.current = null;
      if (d.moved) {
        // Vừa kéo xong: click sắp tới không được mở link.
        suppressClick.current = true;
        setTimeout(() => (suppressClick.current = false), 0);
        setDragging(null);
        const s = sim.current;
        const j = s ? s.idx.indexOf(d.i) : -1;
        if (s && j >= 0) {
          s.sim.nodes[j].fx = null;
          s.sim.nodes[j].fy = null;
          s.sim.alphaTarget = 0;
          kick();
        } else setSettled((n) => n + 1);
      }
      return;
    }
    pointers.current.delete(e.pointerId);
    pan.current = null;
    // Còn một ngón sau khi chụm: kéo tiếp từ chỗ đó.
    const rest = [...pointers.current.values()][0];
    if (rest) {
      const rect = svgRef.current!.getBoundingClientRect();
      pan.current = { x: rest.x + rect.left, y: rest.y + rect.top, vx: v.x, vy: v.y };
    }
  };

  /** Tab tới một chấm nằm ngoài khung thì đưa nó vào giữa. */
  const revealNode = (i: number) => {
    const x = sx(pos[i]);
    const y = sy(pos[i]);
    if (x < PAD || x > size.w - PAD || y < PAD || y > size.h - PAD)
      goTo({ k: v.k, x: v.x + size.w / 2 - x, y: v.y + size.h / 2 - y });
  };

  const counts = ENTRY_TYPES.map((t) => [t, data.nodes.filter((nd) => nd.type === t).length] as const);
  const sorted = graph.idx.map((i) => ({ nd: data.nodes[i], i })).sort((a, b) => a.nd.title.localeCompare(b.nd.title, 'vi'));
  // Vẽ chấm/nhãn đang nổi sau cùng để nằm trên.
  const layered = activeIdx === undefined ? graph.idx : [...graph.idx.filter((i) => !lit(i)), ...graph.idx.filter(lit)];
  const fade = 'transition-opacity duration-200 motion-reduce:transition-none';

  return (
    <div className="space-y-3">
      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <legend className="sr-only">Hiện các loại mục</legend>
        {counts.map(([t, n]) => (
          <label key={t} className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={types.has(t)} onChange={() => toggleType(t)} className="w-4 h-4 accent-purple-700" />
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${TYPE_DOT[t]}`} aria-hidden="true" />
            {TYPE_LABELS[t]} <span className="text-gray-600">({n})</span>
          </label>
        ))}
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={orphans} onChange={(e) => setOrphans(e.target.checked)} className="w-4 h-4 accent-purple-700" />
          Mục chưa có liên kết
        </label>
        {focusIdx !== undefined && (
          <label className="inline-flex items-center gap-1.5">
            Phạm vi
            <select
              value={depth}
              onChange={(e) => {
                fitOnSettle.current = true;
                setDepth(Number(e.target.value));
              }}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
            >
              <option value={0}>Toàn bộ thư viện</option>
              <option value={1}>Mục nối thẳng với “{shortTitle(data.nodes[focusIdx].title)}”</option>
              <option value={2}>Trong 2 bước</option>
              <option value={3}>Trong 3 bước</option>
            </select>
          </label>
        )}
      </fieldset>

      <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size.w} ${size.h}`}
          className={`block w-full h-[60vh] min-h-80 touch-none select-none ${dragging !== null ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
          role="group"
          aria-label={`Bản đồ thư viện: ${graph.idx.length} mục, ${graph.edges.length} liên kết. Mỗi chấm là một link tới mục.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onClickCapture={(e) => {
            if (!suppressClick.current) return;
            suppressClick.current = false;
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <g aria-hidden="true">
            {graph.edges.map((e) => {
              const on = activeIdx !== undefined && (e.s === activeIdx || e.t === activeIdx);
              // Vẽ từ mép chấm này tới mép chấm kia, không xuyên qua tâm.
              const x1 = sx(pos[e.s]);
              const y1 = sy(pos[e.s]);
              const x2 = sx(pos[e.t]);
              const y2 = sy(pos[e.t]);
              const len = Math.hypot(x2 - x1, y2 - y1) || 1;
              const [r1, r2] = [radius(e.s), radius(e.t)];
              if (len <= r1 + r2) return null;
              const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
              return (
                <line
                  key={`${data.nodes[e.s].slug}~${data.nodes[e.t].slug}`}
                  x1={x1 + ux * r1}
                  y1={y1 + uy * r1}
                  x2={x2 - ux * r2}
                  y2={y2 - uy * r2}
                  className={`${on ? 'stroke-purple-600' : 'stroke-gray-300'} ${fade}`}
                  strokeWidth={on ? 2 : 1}
                  opacity={activeIdx === undefined || on ? 1 : DIM}
                />
              );
            })}
          </g>
          {graph.idx.map((i) => {
            const nd = data.nodes[i];
            const x = sx(pos[i]);
            const y = sy(pos[i]);
            const r = radius(i);
            return (
              <a
                key={nd.slug}
                href={tvHref(nd.slug)}
                data-tv={nd.slug}
                data-i={i}
                aria-label={`${nd.title} (${TYPE_LABELS[nd.type]}, ${degree[i]} liên kết)`}
                onPointerEnter={(e) => e.pointerType !== 'touch' && setHover(nd.slug)}
                onPointerLeave={() => setHover(null)}
                onFocus={(e) => {
                  setHover(nd.slug);
                  if (e.currentTarget.matches(':focus-visible')) revealNode(i);
                }}
                onBlur={() => setHover(null)}
                className={`group outline-none ${fade}`}
                style={{ opacity: lit(i) ? 1 : DIM }}
              >
                <circle cx={x} cy={y} r={Math.max(r, MIN_HIT)} className="fill-transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  className={`${TYPE_FILL[nd.type]} stroke-white group-focus-visible:stroke-gray-900`}
                  strokeWidth={i === activeIdx ? 3 : 1.5}
                />
              </a>
            );
          })}
          <g aria-hidden="true" className="pointer-events-none">
            {layered.map((i) => {
              const r = radius(i);
              const on = i === activeIdx;
              const side = labels.get(i) ?? 'below';
              const x = sx(pos[i]);
              const y = sy(pos[i]);
              // Đường chân chữ cho từng chỗ đặt (chữ cao ~0,75 cỡ chữ trên đường chân).
              const at = {
                below: { x, y: y + r + 2 + labelPx, anchor: 'middle' as const },
                above: { x, y: y - r - 2 - labelPx * 0.3, anchor: 'middle' as const },
                right: { x: x + r + 4, y: y + labelPx * 0.35, anchor: 'start' as const },
                left: { x: x - r - 4, y: y + labelPx * 0.35, anchor: 'end' as const },
              }[side];
              // Đang kéo thì chỉ giữ nhãn của chấm đó và hàng xóm (các chấm khác đang trôi).
              const visible = labels.has(i) && (lit(i) || dragging === null);
              return (
                <text
                  key={data.nodes[i].slug}
                  x={at.x}
                  y={at.y}
                  textAnchor={at.anchor}
                  className={`fill-gray-800 stroke-white ${on ? 'font-semibold' : ''} ${fade}`}
                  fontSize={labelPx}
                  strokeWidth={3}
                  paintOrder="stroke"
                  opacity={visible ? (lit(i) ? 1 : DIM) : 0}
                >
                  {shortTitle(data.nodes[i].title)}
                </text>
              );
            })}
          </g>
        </svg>
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          {[
            { label: 'Phóng to', icon: Plus, run: () => goTo(zoomAt(1.3)) },
            { label: 'Thu nhỏ', icon: Minus, run: () => goTo(zoomAt(1 / 1.3)) },
            { label: 'Vừa khung', icon: Maximize2, run: fitVisible },
          ].map(({ label, icon: Icon, run }) => (
            <button
              key={label}
              type="button"
              onClick={run}
              aria-label={label}
              title={label}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Rê chuột hoặc bấm Tab tới một chấm để làm nổi các mục nối với nó; bấm để mở. Kéo một chấm để xem nó gắn với đâu, kéo nền để
        di chuyển. Phóng to: Ctrl (⌘) + cuộn, chụm hai ngón, hoặc nút +.
      </p>

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-gray-800 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600">
          Xem dạng danh sách
        </summary>
        <ul className="mt-3 space-y-2" aria-label="Danh sách mục và liên kết">
          {sorted.map(({ nd, i }) => (
            <li key={nd.slug}>
              <a href={tvHref(nd.slug)} data-tv={nd.slug} className="font-medium">
                {nd.title}
              </a>
              <span className="text-gray-600"> · {TYPE_LABELS[nd.type]}</span>
              {graph.neighbors[i].size > 0 && (
                <span className="text-gray-700">
                  {' '}
                  — nối với{' '}
                  {[...graph.neighbors[i]]
                    .map((j) => data.nodes[j].title)
                    .sort((a, b) => a.localeCompare(b, 'vi'))
                    .join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

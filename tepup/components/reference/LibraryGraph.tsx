'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import type { GraphData } from '@/lib/library/entry-service';
import { ENTRY_TYPES, TYPE_LABELS, type EntryType } from '@/lib/library/schemas';
import { tvHref } from '@/lib/library/refs';

/**
 * Bản đồ thư viện: mọi mục và liên kết giữa chúng, như graph view của Obsidian
 * (docs/design-reference-library.md §7.5). Mỗi chấm là một link /tv/ thường, nên rê chuột
 * hiện xem nhanh và bấm mở bảng bên như ở mọi nơi khác. Bố cục tính bằng một mô phỏng lực
 * nhỏ, tất định (cùng dữ liệu → cùng hình, nên render ở server và trình duyệt khớp nhau).
 * Vẽ theo điểm ảnh thật của khung (viewBox = kích thước khung), nên chữ và chấm giữ cỡ đọc
 * được ở mọi màn hình; phóng to chỉ giãn khoảng cách. Danh sách bên dưới là cách đọc tương
 * đương cho bàn phím và trình đọc màn hình.
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

type Pos = { x: number; y: number };

/** Mô phỏng lực: đẩy nhau (mọi cặp), lò xo (mỗi liên kết), kéo nhẹ về tâm. */
function layout(n: number, edges: { s: number; t: number }[]): Pos[] {
  const R = Math.sqrt(n) * 28 + 20;
  const p: Pos[] = Array.from({ length: n }, (_, i) => {
    const a = i * 2.399963; // góc vàng: rải đều, không ngẫu nhiên
    const r = R * Math.sqrt((i + 0.5) / n);
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
  const ITER = 300;
  for (let it = 0; it < ITER; it++) {
    const alpha = 1 - it / ITER;
    const d = p.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const dx = p[i].x - p[j].x;
        const dy = p[i].y - p[j].y;
        const d2 = dx * dx + dy * dy + 0.01;
        const f = (900 * alpha) / d2;
        d[i].x += dx * f;
        d[i].y += dy * f;
        d[j].x -= dx * f;
        d[j].y -= dy * f;
      }
    for (const { s, t } of edges) {
      const dx = p[t].x - p[s].x;
      const dy = p[t].y - p[s].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = ((dist - 60) / dist) * 0.08 * alpha;
      d[s].x += dx * f;
      d[s].y += dy * f;
      d[t].x -= dx * f;
      d[t].y -= dy * f;
    }
    for (let i = 0; i < n; i++) {
      // Kéo về tâm mạnh hơn cho mục lẻ, để chúng không trôi xa làm cả hình bé lại.
      d[i].x -= p[i].x * 0.03 * alpha;
      d[i].y -= p[i].y * 0.03 * alpha;
      const len = Math.hypot(d[i].x, d[i].y);
      const k = len > 12 ? 12 / len : 1;
      p[i].x += d[i].x * k;
      p[i].y += d[i].y * k;
    }
  }
  return p;
}

const LABEL_PX = 11;
const PAD = 36;

export default function LibraryGraph({ data, focus }: { data: GraphData; focus?: string }) {
  const [types, setTypes] = useState<Set<EntryType>>(() => new Set(ENTRY_TYPES));
  const [orphans, setOrphans] = useState(true);
  const [hover, setHover] = useState<string | null>(null);
  // Phóng (k) và kéo (x, y, điểm ảnh). null = mặc định (vừa khung, hoặc quanh ?muc=).
  const [view, setView] = useState<{ k: number; x: number; y: number } | null>(null);
  // Kích thước khung: đo sau khi gắn; giá trị đầu dùng chung cho server và lần render đầu.
  const [size, setSize] = useState({ w: 800, h: 480 });
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const degree = useMemo(() => {
    const deg = new Array(data.nodes.length).fill(0);
    for (const e of data.edges) {
      deg[e.s]++;
      deg[e.t]++;
    }
    return deg as number[];
  }, [data]);

  // Mục hiện ra theo bộ lọc; liên kết chỉ giữa các mục đang hiện.
  const graph = useMemo(() => {
    const keep = data.nodes.map((nd, i) => types.has(nd.type) && (orphans || degree[i] > 0));
    const idx = new Map<number, number>();
    const nodes = data.nodes.flatMap((nd, i) => (keep[i] ? [{ ...nd, deg: degree[i] }] : []));
    data.nodes.forEach((_, i) => keep[i] && idx.set(i, idx.size));
    const edges = data.edges.flatMap((e) => (keep[e.s] && keep[e.t] ? [{ s: idx.get(e.s)!, t: idx.get(e.t)! }] : []));
    const pos = layout(nodes.length, edges);
    const neighbors = nodes.map(() => new Set<number>());
    for (const e of edges) {
      neighbors[e.s].add(e.t);
      neighbors[e.t].add(e.s);
    }
    const xs = pos.map((q) => q.x);
    const ys = pos.map((q) => q.y);
    const box = nodes.length
      ? { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2, w: Math.max(...xs) - Math.min(...xs) || 1, h: Math.max(...ys) - Math.min(...ys) || 1 }
      : { cx: 0, cy: 0, w: 1, h: 1 };
    return { nodes, edges, pos, neighbors, box };
  }, [data, types, orphans, degree]);

  // Tỉ lệ "vừa khung": toàn bộ hình nằm trong khung, chừa lề cho nhãn.
  const fit = Math.min((size.w - PAD * 2) / graph.box.w, (size.h - PAD * 2) / graph.box.h, 2.5);

  const bySlug = useMemo(() => new Map(graph.nodes.map((nd, i) => [nd.slug, i])), [graph]);
  const active = hover ?? focus ?? null;
  const activeIdx = active ? bySlug.get(active) : undefined;
  const lit = (i: number) => activeIdx === undefined || i === activeIdx || graph.neighbors[activeIdx].has(i);

  const focusIdx = focus ? bySlug.get(focus) : undefined;
  const v =
    view ??
    (focusIdx === undefined
      ? { k: 1, x: 0, y: 0 }
      : // Đặt mục được chọn vào giữa khung, phóng to một chút.
        { k: 1.6, x: -(graph.pos[focusIdx].x - graph.box.cx) * fit * 1.6, y: -(graph.pos[focusIdx].y - graph.box.cy) * fit * 1.6 });

  /** Toạ độ mô phỏng → điểm ảnh trong khung. */
  const sx = (p: Pos) => (p.x - graph.box.cx) * fit * v.k + size.w / 2 + v.x;
  const sy = (p: Pos) => (p.y - graph.box.cy) * fit * v.k + size.h / 2 + v.y;

  const zoom = (f: number) => {
    const k = Math.min(6, Math.max(0.5, v.k * f));
    // Giữ tâm khung đứng yên khi phóng.
    setView({ k, x: (v.x * k) / v.k, y: (v.y * k) / v.k });
  };

  const toggleType = (t: EntryType) =>
    setTypes((s) => {
      const next = new Set(s);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const counts = ENTRY_TYPES.map((t) => [t, data.nodes.filter((nd) => nd.type === t).length] as const);
  const sorted = graph.nodes.map((nd, i) => ({ nd, i })).sort((a, b) => a.nd.title.localeCompare(b.nd.title, 'vi'));
  // Nhãn: mục nhiều liên kết, mục đang nổi và hàng xóm, hoặc mọi mục khi đã phóng to.
  const showLabel = (i: number) =>
    graph.nodes[i].deg >= 3 || v.k >= 1.8 || graph.nodes.length <= 20 || (activeIdx !== undefined && lit(i));

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
      </fieldset>

      <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size.w} ${size.h}`}
          className="block w-full h-[60vh] min-h-80 touch-none select-none cursor-grab active:cursor-grabbing"
          role="group"
          aria-label={`Bản đồ thư viện: ${graph.nodes.length} mục, ${graph.edges.length} liên kết. Mỗi chấm là một link tới mục.`}
          onPointerDown={(e) => {
            if ((e.target as Element).closest('a')) return;
            drag.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            setView({ k: v.k, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y });
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          {graph.edges.map((e, k) => {
            const on = activeIdx !== undefined && (e.s === activeIdx || e.t === activeIdx);
            return (
              <line
                key={k}
                x1={sx(graph.pos[e.s])}
                y1={sy(graph.pos[e.s])}
                x2={sx(graph.pos[e.t])}
                y2={sy(graph.pos[e.t])}
                className={on ? 'stroke-purple-600' : 'stroke-gray-300'}
                strokeWidth={on ? 2 : 1}
                opacity={activeIdx === undefined || on ? 1 : 0.35}
              />
            );
          })}
          {sorted.map(({ nd, i }) => {
            const x = sx(graph.pos[i]);
            const y = sy(graph.pos[i]);
            const r = 5 + Math.sqrt(nd.deg) * 2.5;
            return (
              <a
                key={nd.slug}
                href={tvHref(nd.slug)}
                data-tv={nd.slug}
                aria-label={`${nd.title} (${TYPE_LABELS[nd.type]}, ${nd.deg} liên kết)`}
                onPointerEnter={() => setHover(nd.slug)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(nd.slug)}
                onBlur={() => setHover(null)}
                className="group outline-none"
                style={{ opacity: lit(i) ? 1 : 0.3 }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  className={`${TYPE_FILL[nd.type]} stroke-white group-focus-visible:stroke-gray-900`}
                  strokeWidth={i === activeIdx ? 3 : 1.5}
                />
                {showLabel(i) && (
                  <text
                    x={x}
                    y={y + r + LABEL_PX + 2}
                    textAnchor="middle"
                    className={`fill-gray-800 stroke-white ${i === activeIdx ? 'font-semibold' : ''}`}
                    fontSize={LABEL_PX}
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {nd.title.length > 34 ? `${nd.title.slice(0, 33)}…` : nd.title}
                  </text>
                )}
              </a>
            );
          })}
        </svg>
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          {[
            { label: 'Phóng to', icon: Plus, run: () => zoom(1.3) },
            { label: 'Thu nhỏ', icon: Minus, run: () => zoom(1 / 1.3) },
            { label: 'Vừa khung', icon: Maximize2, run: () => setView({ k: 1, x: 0, y: 0 }) },
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
        Rê chuột hoặc bấm Tab tới một chấm để làm nổi các mục nối với nó; bấm để mở. Kéo nền để di chuyển.
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
                    .map((j) => graph.nodes[j].title)
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

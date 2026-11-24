'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Filter, Users } from 'lucide-react';
import type { BaseRateCrowdBlock as BaseRateCrowdBlockType, BaseRateCrowdColor } from '@/lib/types/content';
import { useBlockInteraction } from '@/lib/hooks/useBlockInteraction';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { seededShuffle } from '@/lib/utils/seededShuffle';
import { allocateDots } from '@/lib/utils/allocateDots';
import BlockShell from './BlockShell';
import { toPlainText, useAnnouncer } from './useAnnouncer';

interface Props {
  block: BaseRateCrowdBlockType;
  onComplete?: () => void;
}

/** Lưới cố định 40 × 25 = 1.000 người. */
const COLS = 40;
const DOTS = 1000;
const CELL = 10;

const DEFAULT_INSTRUCTION =
  'Mỗi hình là một người, chia theo đúng tỉ lệ ngoài đời. Chỉnh xem mỗi nhóm có bao nhiêu phần trăm khớp với mô tả, đoán trước nhóm nào đông hơn, rồi bấm lọc.';

/** Màu theo bảng Tailwind (chế độ tối trỏ lại biến màu, xem app/reader.css). Không dùng mã hex. */
const COLORS: Record<BaseRateCrowdColor, { fill: string; text: string; swatch: string }> = {
  sky: { fill: 'fill-sky-600', text: 'text-sky-800', swatch: 'bg-sky-600' },
  amber: { fill: 'fill-amber-600', text: 'text-amber-800', swatch: 'bg-amber-600' },
  emerald: { fill: 'fill-emerald-600', text: 'text-emerald-800', swatch: 'bg-emerald-600' },
  violet: { fill: 'fill-violet-600', text: 'text-violet-800', swatch: 'bg-violet-600' },
};
const COLOR_ORDER: BaseRateCrowdColor[] = ['sky', 'amber', 'emerald', 'violet'];

/** Hình dạng theo thứ tự nhóm: không phân biệt nhóm chỉ bằng màu. */
type Shape = 'circle' | 'square' | 'diamond' | 'triangle';
const SHAPES: Shape[] = ['circle', 'square', 'diamond', 'triangle'];
const SHAPE_NAMES: Record<Shape, string> = {
  circle: 'hình tròn',
  square: 'hình vuông',
  diamond: 'hình thoi',
  triangle: 'hình tam giác',
};

/** Tên nhóm đặt giữa câu: viết thường chữ đầu ("Giảng viên" → "giảng viên"), trừ khi là chữ viết tắt. */
const inSentence = (label: string) => {
  const t = toPlainText(label);
  return t.length > 1 && t[1] === t[1].toLowerCase() ? t[0].toLowerCase() + t.slice(1) : t;
};
const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN');
const pct = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
const clampPct = (n: number) => (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0);

function ShapeMark({ shape, x, y, className }: { shape: Shape; x: number; y: number; className: string }) {
  const c = CELL / 2;
  const r = 3.6;
  switch (shape) {
    case 'circle':
      return <circle cx={x + c} cy={y + c} r={r} className={className} />;
    case 'square':
      return <rect x={x + c - r + 0.4} y={y + c - r + 0.4} width={(r - 0.4) * 2} height={(r - 0.4) * 2} className={className} />;
    case 'diamond':
      return (
        <polygon points={`${x + c},${y + c - r - 0.6} ${x + c + r + 0.6},${y + c} ${x + c},${y + c + r + 0.6} ${x + c - r - 0.6},${y + c}`} className={className} />
      );
    default:
      return <polygon points={`${x + c},${y + c - r} ${x + c + r},${y + c + r} ${x + c - r},${y + c + r}`} className={className} />;
  }
}

export default function BaseRateCrowdBlockComponent({ block, onComplete }: Props) {
  const uid = useId();
  const groups = useMemo(() => (block.groups ?? []).slice(0, 4), [block.groups]);
  const [match, setMatch] = useState<number[]>(() => groups.map((g) => clampPct(g.matchPercent)));
  const [filtered, setFiltered] = useState(false);
  const [message, announce] = useAnnouncer();
  const { markInteracted } = useBlockInteraction(onComplete);
  const announceTimer = useRef<number | null>(null);

  const styled = groups.map((g, i) => ({
    ...g,
    shape: SHAPES[i % SHAPES.length],
    color: COLORS[g.color && COLORS[g.color] ? g.color : COLOR_ORDER[i % COLOR_ORDER.length]],
  }));

  // Chấm của từng nhóm, và bao nhiêu chấm trong đó "khớp mô tả".
  const dotCounts = useMemo(() => allocateDots(groups.map((g) => g.population), DOTS), [groups]);
  const matchedDots = dotCounts.map((n, i) => Math.round((n * (match[i] ?? 0)) / 100));

  // Đám đông: vị trí xáo trộn cố định; trong mỗi nhóm, những người đầu tiên theo thứ tự xáo là người "khớp".
  const crowd = useMemo(() => {
    const owner: number[] = [];
    dotCounts.forEach((n, gi) => {
      for (let k = 0; k < n; k++) owner.push(gi);
    });
    const seed = `${block.description ?? ''}|${groups.map((g) => g.id).join(',')}`;
    const placed = seededShuffle(owner, seed);
    // Ai trong nhóm "khớp" được chọn theo một thứ tự xáo riêng, để người khớp rải khắp lưới
    // chứ không dồn lên những hàng đầu.
    const rankInGroup = new Array(placed.length).fill(0);
    groups.forEach((_, gi) => {
      const positions = placed.flatMap((g, pos) => (g === gi ? [pos] : []));
      seededShuffle(positions, `${seed}|${gi}`).forEach((pos, rank) => {
        rankInGroup[pos] = rank;
      });
    });
    return placed.map((gi, pos) => ({ gi, rank: rankInGroup[pos] }));
  }, [dotCounts, groups, block.description]);

  // Số người thật khớp mô tả (tính từ dân số thật, không từ số chấm).
  const matchedPeople = groups.map((g, i) => (Math.max(0, g.population) * (match[i] ?? 0)) / 100);
  const totalMatched = matchedPeople.reduce((a, b) => a + b, 0);
  const targetIndex = Math.max(0, groups.findIndex((g) => g.id === block.targetGroupId));
  const target = styled[targetIndex];
  const chance = totalMatched > 0 ? (matchedPeople[targetIndex] / totalMatched) * 100 : null;
  const subject = block.subject?.trim() || 'người được mô tả';
  const chanceText =
    chance === null
      ? 'Không còn ai khớp mô tả.'
      : `Khả năng ${subject} là ${inSentence(target?.label ?? '')}: ${pct(chance)}%.`;
  const summary = styled
    .map((g, i) => `${matchedDots[i]} ${SHAPE_NAMES[g.shape]} (khoảng ${fmt(matchedPeople[i])} ${inSentence(g.label)})`)
    .join(', ');

  useEffect(
    () => () => {
      if (announceTimer.current) window.clearTimeout(announceTimer.current);
    },
    []
  );

  const scheduleAnnounce = (text: string) => {
    if (announceTimer.current) window.clearTimeout(announceTimer.current);
    // Kéo thanh trượt sinh nhiều thay đổi liền nhau: chỉ đọc kết quả khi người học dừng tay.
    announceTimer.current = window.setTimeout(() => announce(text), 700);
  };

  const handleMatch = (i: number, value: number) => {
    const next = match.map((m, j) => (j === i ? clampPct(value) : m));
    setMatch(next);
    if (filtered) {
      const people = groups.map((g, j) => (Math.max(0, g.population) * next[j]) / 100);
      const tot = people.reduce((a, b) => a + b, 0);
      scheduleAnnounce(
        tot > 0
          ? `Khả năng ${subject} là ${inSentence(target?.label ?? '')}: ${pct((people[targetIndex] / tot) * 100)}%.`
          : 'Không còn ai khớp mô tả.'
      );
    }
  };

  const toggleFilter = () => {
    const next = !filtered;
    setFiltered(next);
    if (next) {
      markInteracted();
      announce(`Chỉ còn người khớp mô tả: ${summary}. ${chanceText}`);
    } else {
      announce('Đã hiện lại cả đám đông.');
    }
  };

  const rows = Math.ceil(crowd.length / COLS);

  return (
    <BlockShell accent="sky">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-sky-700" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">{block.title || 'Đám đông theo tỉ lệ thật'}</h2>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">
        {renderInlineMarkdown(block.instruction?.trim() ? block.instruction : DEFAULT_INSTRUCTION)}
      </p>

      {block.description && (
        <blockquote className="mb-4 rounded-xl border-l-4 border-sky-600 bg-sky-50 px-4 py-3 text-gray-800">
          {renderInlineMarkdown(block.description)}
        </blockquote>
      )}

      {/* Chú giải: mỗi nhóm một hình dạng + màu, kèm số người thật. */}
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700">
        {styled.map((g, i) => (
          <li key={g.id} className="inline-flex items-center gap-2">
            <svg viewBox={`0 0 ${CELL} ${CELL}`} className="h-4 w-4" aria-hidden="true">
              <ShapeMark shape={g.shape} x={0} y={0} className={g.color.fill} />
            </svg>
            <span>
              <span className="font-medium text-gray-900">{renderInlineMarkdown(g.label, { links: false })}</span>
              {': '}
              {dotCounts[i]} {SHAPE_NAMES[g.shape]} ≈ {fmt(g.population)} người
            </span>
          </li>
        ))}
      </ul>

      {/* Lưới: chỉ để nhìn; mọi con số đều có bằng chữ ở dưới. */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-2">
        <svg viewBox={`0 0 ${COLS * CELL} ${rows * CELL}`} className="block w-full h-auto" aria-hidden="true">
          {crowd.map((d, pos) => {
            const g = styled[d.gi];
            const isMatch = d.rank < matchedDots[d.gi];
            const faded = filtered && !isMatch;
            return (
              <ShapeMark
                key={pos}
                shape={g.shape}
                x={(pos % COLS) * CELL}
                y={Math.floor(pos / COLS) * CELL}
                className={`${faded ? 'fill-gray-200' : g.color.fill} transition-colors duration-300`}
              />
            );
          })}
        </svg>
      </div>

      {/* Thanh chỉnh "% khớp mô tả" */}
      <div className="space-y-4 mb-4">
        {styled.map((g, i) => {
          const valueText = `${pct(match[i] ?? 0)}% ${inSentence(g.label)} khớp mô tả`;
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <label htmlFor={`${uid}-m${i}`} className="text-sm font-medium text-gray-700">
                  {toPlainText(g.label)} khớp mô tả
                </label>
                <span className={`text-sm font-bold tabular-nums ${g.color.text}`}>{pct(match[i] ?? 0)}%</span>
              </div>
              <input
                id={`${uid}-m${i}`}
                type="range"
                min={0}
                max={100}
                step={1}
                value={match[i] ?? 0}
                onChange={(e) => handleMatch(i, parseFloat(e.target.value))}
                aria-valuetext={valueText}
                className="range-touch w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600 text-sky-600"
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={toggleFilter}
        aria-pressed={filtered}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-colors ${
          filtered ? 'bg-sky-700 text-white hover:bg-sky-800' : 'border-2 border-sky-700 text-sky-800 hover:bg-sky-50'
        }`}
      >
        <Filter className="h-4 w-4" aria-hidden="true" />
        Chỉ giữ người khớp mô tả
      </button>

      {filtered ? (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-gray-700 mb-2">Trong số những người khớp mô tả:</p>
          <ul className="space-y-1 mb-3">
            {styled.map((g, i) => (
              <li key={g.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 text-gray-800">
                  <svg viewBox={`0 0 ${CELL} ${CELL}`} className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
                    <ShapeMark shape={g.shape} x={0} y={0} className={g.color.fill} />
                  </svg>
                  {renderInlineMarkdown(g.label, { links: false })}
                </span>
                <span className="tabular-nums font-semibold text-gray-900">≈ {fmt(matchedPeople[i])} người</span>
              </li>
            ))}
          </ul>
          <p className="font-semibold text-gray-900">{chanceText}</p>
          {block.insight && <p className="mt-2 text-gray-700 leading-relaxed">{renderInlineMarkdown(block.insight)}</p>}
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">Đoán trước: trong những người khớp mô tả, nhóm nào đông hơn?</p>
      )}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </BlockShell>
  );
}

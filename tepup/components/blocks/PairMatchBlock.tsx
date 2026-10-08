'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Waypoints } from 'lucide-react';
import type { PairMatchBlock as PairMatchBlockType } from '@/lib/types/content';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { seededShuffle } from '@/lib/utils/seededShuffle';
import BlockShell from './BlockShell';
import { toPlainText, useAnnouncer } from './useAnnouncer';

interface Props {
  block: PairMatchBlockType;
  onComplete?: () => void;
}

/** Colour per solved pair, so a matched couple is recognisable at a glance. */
const PAIR_COLORS = [
  'bg-sky-50 border-sky-300 text-sky-900',
  'bg-emerald-50 border-emerald-300 text-emerald-900',
  'bg-violet-50 border-violet-300 text-violet-900',
  'bg-amber-50 border-amber-300 text-amber-900',
  'bg-rose-50 border-rose-300 text-rose-900',
  'bg-teal-50 border-teal-300 text-teal-900',
];

type ItemState = 'solved' | 'wrong' | 'selected' | 'idle' | 'waiting';

/** `h-full` is what lets a short left item stretch to its taller right neighbour. */
function Item({
  text,
  state,
  badge,
  colorClass,
  onClick,
  disabled,
  buttonRef,
}: {
  text: string;
  state: ItemState;
  badge?: number;
  colorClass?: string;
  onClick: () => void;
  disabled: boolean;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  const look =
    state === 'solved'
      ? `${colorClass} cursor-default`
      : state === 'wrong'
        ? 'border-red-400 bg-red-50 text-red-800 animate-shake'
        : state === 'selected'
          ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
          : state === 'waiting'
            ? 'border-gray-300 bg-white text-gray-800 hover:border-sky-400 hover:bg-sky-50'
            : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      className={`h-full w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 transition-all duration-150 text-sm sm:text-base ${look}`}
    >
      <span className="flex items-center gap-2">
        {badge !== undefined && (
          <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/70 text-xs font-bold">
            {badge}
          </span>
        )}
        <span>{renderInlineMarkdown(text)}</span>
      </span>
    </button>
  );
}

export default function PairMatchBlockComponent({ block, onComplete }: Props) {
  /** pair id -> order in which it was solved (drives the badge number and colour). */
  const [solved, setSolved] = useState<Record<string, number>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [message, announce] = useAnnouncer();
  /** Nút cột trái theo pair id — sau mỗi lần nối, mục bên phải vừa bấm bị tắt nên
   *  focus phải được trả về cột trái thay vì rơi mất. */
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const focusAfterRender = useRef<string | null>(null);

  // Seeded from the pair ids so server and client agree — see seededShuffle.
  const rightColumn = useMemo(
    () => seededShuffle(block.pairs, block.pairs.map((p) => p.id).join('|')),
    [block.pairs]
  );

  const solvedCount = Object.keys(solved).length;
  // An author who deleted every pair leaves nothing to solve; gating on that would
  // wedge the lesson's Continue button forever, so an empty block counts as done.
  const finished = solvedCount === block.pairs.length;

  useEffect(() => {
    if (finished) onComplete?.();
    // onComplete is a fresh closure each render; firing on `finished` is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  useEffect(() => {
    const id = focusAfterRender.current;
    if (!id) return;
    focusAfterRender.current = null;
    leftRefs.current[id]?.focus();
  });

  const handleLeftClick = (pairId: string) => {
    if (solved[pairId]) return;
    setWrongPair(null);
    setSelectedLeft((cur) => (cur === pairId ? null : pairId));
  };

  const handleRightClick = (pairId: string) => {
    if (solved[pairId] || !selectedLeft) return;

    if (selectedLeft === pairId) {
      setSolved((prev) => ({ ...prev, [pairId]: Object.keys(prev).length + 1 }));
      setSelectedLeft(null);
      setWrongPair(null);
      const pair = block.pairs.find((p) => p.id === pairId);
      const done = solvedCount + 1;
      announce(
        `Đúng: "${toPlainText(pair?.left)}" với "${toPlainText(pair?.right)}". ` +
          (done === block.pairs.length ? 'Đã nối đúng tất cả!' : `Đã nối đúng ${done}/${block.pairs.length}.`)
      );
      // Focus sang mục bên trái kế tiếp chưa nối (vòng lại từ đầu nếu cần).
      const row = block.pairs.findIndex((p) => p.id === pairId);
      const next = [...block.pairs.slice(row + 1), ...block.pairs.slice(0, row)].find(
        (p) => !solved[p.id]
      );
      focusAfterRender.current = next?.id ?? null;
      return;
    }

    // Wrong: flash both sides, then release so the learner can try again freely.
    // Chớp đỏ không tới được trình đọc màn hình — báo bằng lời, rồi trả focus về mục trái.
    setWrongPair({ left: selectedLeft, right: pairId });
    focusAfterRender.current = selectedLeft;
    setSelectedLeft(null);
    window.setTimeout(() => setWrongPair(null), 600);
    announce(`Sai cặp, thử lại. Đã nối đúng ${solvedCount}/${block.pairs.length}.`);
  };

  const colorFor = (pairId: string) => PAIR_COLORS[(solved[pairId] - 1) % PAIR_COLORS.length];

  return (
    <BlockShell>
      <div className="flex items-center gap-2 mb-1">
        <Waypoints className="w-5 h-5 text-sky-500" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">{block.title || 'Nối cặp'}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {block.instruction || 'Chạm một mục bên trái, rồi chạm mục tương ứng bên phải.'}
      </p>

      {/*
        One grid holding both columns, filled left/right/left/right, rather than two
        independent columns. A grid row sizes to its tallest cell, so a two-line
        definition on the right lifts its left neighbour to match and the two columns
        stay aligned row for row instead of drifting apart.
      */}
      <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2 items-stretch">
        {block.pairs.map((leftPair, row) => {
          const rightPair = rightColumn[row];
          return (
            <Fragment key={leftPair.id}>
              <Item
                text={leftPair.left}
                state={
                  solved[leftPair.id]
                    ? 'solved'
                    : wrongPair?.left === leftPair.id
                      ? 'wrong'
                      : selectedLeft === leftPair.id
                        ? 'selected'
                        : 'idle'
                }
                badge={solved[leftPair.id]}
                colorClass={solved[leftPair.id] ? colorFor(leftPair.id) : undefined}
                onClick={() => handleLeftClick(leftPair.id)}
                disabled={Boolean(solved[leftPair.id])}
                buttonRef={(el) => {
                  leftRefs.current[leftPair.id] = el;
                }}
              />
              <Item
                text={rightPair.right}
                state={
                  solved[rightPair.id]
                    ? 'solved'
                    : wrongPair?.right === rightPair.id
                      ? 'wrong'
                      : selectedLeft
                        ? 'waiting'
                        : 'idle'
                }
                badge={solved[rightPair.id]}
                colorClass={solved[rightPair.id] ? colorFor(rightPair.id) : undefined}
                onClick={() => handleRightClick(rightPair.id)}
                disabled={Boolean(solved[rightPair.id]) || !selectedLeft}
              />
            </Fragment>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">{message}</p>

      <div className="mt-4 flex items-center gap-2 text-sm">
        {finished ? (
          <span className="flex items-center gap-1.5 font-medium text-green-700">
            <Check className="w-4 h-4" aria-hidden="true" />
            Đã nối đúng tất cả!
          </span>
        ) : (
          <span className="text-gray-500">
            Đã nối {solvedCount}/{block.pairs.length} cặp
          </span>
        )}
      </div>
    </BlockShell>
  );
}

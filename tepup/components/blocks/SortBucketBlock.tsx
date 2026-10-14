'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Boxes, Check } from 'lucide-react';
import type { SortBucketBlock as SortBucketBlockType } from '@/lib/types/content';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { seededShuffle } from '@/lib/utils/seededShuffle';
import BlockShell from './BlockShell';
import { toPlainText, useAnnouncer } from './useAnnouncer';

interface Props {
  block: SortBucketBlockType;
  onComplete?: () => void;
}

/** Pointer travel before a mouse press counts as a drag rather than a click. */
const DRAG_THRESHOLD_PX = 5;
/** Hold time before a touch turns into a drag, so a quick swipe still scrolls. */
const TOUCH_HOLD_MS = 180;

interface PointerInfo {
  itemId: string;
  startX: number;
  startY: number;
  isTouch: boolean;
  dragging: boolean;
  holdTimer: number | null;
}

export default function SortBucketBlockComponent({ block, onComplete }: Props) {
  /** Item ids already dropped in the right bucket — they stay put. */
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [wrongBucket, setWrongBucket] = useState<string | null>(null);
  /** Item being dragged plus the current pointer position, for the floating ghost. */
  const [drag, setDrag] = useState<{ itemId: string; x: number; y: number } | null>(null);
  const [hoverBucket, setHoverBucket] = useState<string | null>(null);

  const pointer = useRef<PointerInfo | null>(null);
  /** A drag ends with a synthetic click on the shared ancestor; this swallows it.
   *  A ref, not `drag` state, because the click fires before React re-renders. */
  const justDragged = useRef(false);
  const [message, announce] = useAnnouncer();
  /** Nút thẻ trong khay, để trả focus về sau khi chọn rổ bằng bàn phím. */
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  /** Thẻ cần nhận focus ở lần render tới (thẻ vừa xếp đã biến mất khỏi khay). */
  const focusAfterRender = useRef<string | null>(null);

  // An author can point an item at a bucket they later deleted; those items would
  // be unplaceable and the block could never complete, so they are dropped here.
  const validItems = useMemo(
    () => block.items.filter((it) => block.buckets.some((b) => b.id === it.bucketId)),
    [block.items, block.buckets]
  );

  const shuffledItems = useMemo(
    () => seededShuffle(validItems, validItems.map((i) => i.id).join('|')),
    [validItems]
  );

  const pending = shuffledItems.filter((it) => !placed[it.id]);
  // Also true when every item was orphaned by a deleted bucket: there is nothing
  // left to place, and gating on it would wedge the lesson's Continue button.
  const finished = pending.length === 0;

  useEffect(() => {
    if (finished) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  useEffect(() => {
    const id = focusAfterRender.current;
    if (!id) return;
    focusAfterRender.current = null;
    itemRefs.current[id]?.focus();
  });

  /** Grading, shared by tap-to-place and drag-to-drop so both behave identically.
   *  Trả về true khi xếp đúng rổ. */
  const place = useCallback(
    (itemId: string, bucketId: string): boolean => {
      const item = validItems.find((it) => it.id === itemId);
      if (!item || placed[itemId]) return false;

      if (item.bucketId === bucketId) {
        setPlaced((prev) => ({ ...prev, [itemId]: true }));
        setSelectedItem(null);
        setWrongBucket(null);
        const bucket = block.buckets.find((b) => b.id === bucketId);
        const left = validItems.filter((it) => !placed[it.id] && it.id !== itemId).length;
        announce(
          `Đã xếp "${toPlainText(item.text)}" vào "${toPlainText(bucket?.label)}". ` +
            (left === 0 ? 'Đã phân loại đúng tất cả!' : `Còn ${left} thẻ.`)
        );
        return true;
      }

      // Wrong bucket: flash it and drop the selection; the item stays in the tray.
      // Chỉ chớp đỏ thì trình đọc màn hình không biết gì — báo bằng lời nữa.
      setWrongBucket(bucketId);
      setSelectedItem(null);
      window.setTimeout(() => setWrongBucket(null), 600);
      announce('Sai rổ, thử lại.');
      return false;
    },
    [validItems, placed, block.buckets, announce]
  );

  // ── drag ───────────────────────────────────────────────────────────────────

  /** Which bucket sits under the pointer. The ghost is pointer-events:none so it
   *  never shadows the bucket underneath. */
  const bucketAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y);
    return el?.closest('[data-bucket-id]')?.getAttribute('data-bucket-id') ?? null;
  };

  useEffect(() => {
    // While a touch drag is running the page must not scroll under the finger.
    // preventDefault only works from a non-passive listener, which React's props
    // cannot express — hence the manual registration.
    if (!drag) return;
    const preventScroll = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, [drag]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const info = pointer.current;
      if (!info) return;

      if (!info.dragging) {
        const moved = Math.hypot(e.clientX - info.startX, e.clientY - info.startY);
        // A touch that moves before the hold timer fires is a scroll, not a drag.
        if (info.isTouch) {
          if (moved > DRAG_THRESHOLD_PX) {
            if (info.holdTimer) window.clearTimeout(info.holdTimer);
            pointer.current = null;
          }
          return;
        }
        if (moved <= DRAG_THRESHOLD_PX) return;
        info.dragging = true;
        setSelectedItem(info.itemId);
      }

      setDrag({ itemId: info.itemId, x: e.clientX, y: e.clientY });
      setHoverBucket(bucketAt(e.clientX, e.clientY));
    };

    const finish = (e: PointerEvent) => {
      const info = pointer.current;
      if (!info) return;
      if (info.holdTimer) window.clearTimeout(info.holdTimer);
      pointer.current = null;

      if (info.dragging) {
        justDragged.current = true;
        window.setTimeout(() => (justDragged.current = false), 0);
        const bucketId = bucketAt(e.clientX, e.clientY);
        if (bucketId) place(info.itemId, bucketId);
        else setSelectedItem(null);
      }
      setDrag(null);
      setHoverBucket(null);
    };

    const cancel = () => {
      const info = pointer.current;
      if (info?.holdTimer) window.clearTimeout(info.holdTimer);
      pointer.current = null;
      setDrag(null);
      setHoverBucket(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [place]);

  const handlePointerDown = (e: React.PointerEvent, itemId: string) => {
    if (placed[itemId] || e.button !== 0) return;
    const isTouch = e.pointerType === 'touch';

    const info: PointerInfo = {
      itemId,
      startX: e.clientX,
      startY: e.clientY,
      isTouch,
      dragging: false,
      holdTimer: null,
    };

    if (isTouch) {
      // Hold still briefly to drag; swipe straight away and the page scrolls.
      info.holdTimer = window.setTimeout(() => {
        if (pointer.current !== info) return;
        info.dragging = true;
        setSelectedItem(itemId);
        setDrag({ itemId, x: info.startX, y: info.startY });
      }, TOUCH_HOLD_MS);
    }

    pointer.current = info;
  };

  /** Tap path, unchanged: select an item, then tap a bucket. */
  const handleItemClick = (itemId: string) => {
    if (justDragged.current) return;
    setWrongBucket(null);
    setSelectedItem((cur) => (cur === itemId ? null : itemId));
  };

  const handleBucketClick = (bucketId: string) => {
    if (justDragged.current || !selectedItem) return;
    // Sau khi chọn, mọi rổ bị tắt (không còn thẻ nào được chọn) nên focus sẽ rơi mất.
    // Trả nó về khay: thẻ vừa thử nếu sai, thẻ kế tiếp nếu đúng.
    const idx = pending.findIndex((it) => it.id === selectedItem);
    const correct = place(selectedItem, bucketId);
    focusAfterRender.current = correct
      ? (pending[idx + 1] ?? pending[idx - 1])?.id ?? null
      : selectedItem;
  };

  const draggedItem = drag ? validItems.find((it) => it.id === drag.itemId) : null;

  return (
    <BlockShell>
      <div className="flex items-center gap-2 mb-1">
        <Boxes className="w-5 h-5 text-green-500" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">{block.title || 'Phân loại vào rổ'}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {block.instruction || 'Kéo thẻ vào rổ, hoặc chạm chọn thẻ rồi chạm vào rổ.'}
      </p>

      {/* Tray of items still to be sorted. */}
      <div className="min-h-[56px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-3 mb-4">
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-1">Đã xếp xong tất cả thẻ.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pending.map((item) => {
              const isDragged = drag?.itemId === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  type="button"
                  onPointerDown={(e) => handlePointerDown(e, item.id)}
                  onClick={() => handleItemClick(item.id)}
                  onContextMenu={(e) => e.preventDefault()}
                  aria-pressed={selectedItem === item.id}
                  className={`select-none touch-manipulation px-3 py-2 rounded-lg border-2 text-sm transition-all duration-150 ${
                    isDragged
                      ? 'border-green-400 bg-green-50 opacity-40'
                      : selectedItem === item.id
                        ? 'border-green-500 bg-green-50 text-green-900 ring-2 ring-green-200 cursor-grab'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-100 cursor-grab'
                  }`}
                >
                  {renderInlineMarkdown(item.text, { links: false })}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Buckets. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {block.buckets.map((bucket) => {
          const contents = validItems.filter((it) => placed[it.id] && it.bucketId === bucket.id);
          const isWrong = wrongBucket === bucket.id;
          const isHovered = hoverBucket === bucket.id;
          return (
            <button
              key={bucket.id}
              type="button"
              data-bucket-id={bucket.id}
              onClick={() => handleBucketClick(bucket.id)}
              disabled={!selectedItem && !drag}
              className={`text-left rounded-xl border-2 p-3 min-h-[110px] transition-all duration-150 ${
                isWrong
                  ? 'border-red-400 bg-red-50 animate-shake'
                  : isHovered
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : selectedItem || drag
                      ? 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50/50 cursor-pointer'
                      : 'border-gray-200 bg-white'
              }`}
            >
              <p className="font-medium text-gray-900 text-sm mb-2">
                {renderInlineMarkdown(bucket.label)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {contents.map((it) => (
                  <span
                    key={it.id}
                    className="px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs"
                  >
                    {renderInlineMarkdown(it.text, { links: false })}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating ghost. pointer-events:none so elementFromPoint sees the bucket. */}
      {drag && draggedItem && (
        <div
          className="pointer-events-none fixed z-50 px-3 py-2 rounded-lg border-2 border-green-500 bg-white text-sm text-green-900 shadow-lg"
          style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -120%)' }}
        >
          {renderInlineMarkdown(draggedItem.text, { links: false })}
        </div>
      )}

      <p className="sr-only" aria-live="polite">{message}</p>

      <div className="mt-4 text-sm">
        {finished ? (
          <span className="flex items-center gap-1.5 font-medium text-green-700">
            <Check className="w-4 h-4" aria-hidden="true" />
            Đã phân loại đúng tất cả!
          </span>
        ) : (
          <span className="text-gray-500">
            Còn {pending.length}/{validItems.length} thẻ chưa xếp
          </span>
        )}
      </div>
    </BlockShell>
  );
}

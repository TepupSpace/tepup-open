'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { X, PencilLine } from 'lucide-react';
import { useNavigate } from '@/lib/hooks/useNavigate';
import { getPreviousPath } from '@/lib/navigation-history';
import Spinner from '@/components/ui/Spinner';
import type { ContentBlock, QuestionBlock } from '@/lib/types/content';
import { toggleAnswer, isAnswerCorrect } from '@/lib/utils/quiz';
import { useProgress } from '@/lib/contexts/ProgressContext';
import { useBottomChrome } from '@/lib/hooks/useBottomChrome';
import TextSelectionPopover from '@/components/ai/TextSelectionPopover';
import SuggestEditDialog from '@/components/learn/SuggestEditDialog';
import { BlockRenderer, INTERACTIVE_BLOCK_TYPES, preloadBlockTypes } from '@/components/learn/BlockRenderer';
import { isEmptyBlock } from '@/lib/editor/trim-empty-blocks';

interface LessonPlayerProps {
  /** Stable database id — this is what progress is keyed by, never the slug. */
  contentId: string;
  contentType: 'lesson' | 'chapter';
  title: string;
  blocks: ContentBlock[];
  /** Where the close button and the completion handler return to. */
  exitHref: string;
}

/** A block plus its original position in `blocks` (used as a stable state key). */
type RevealItem = { block: ContentBlock; index: number };

/**
 * Split blocks into reveal groups. If any `step-break` marker is present, blocks
 * between markers form one group (revealed together). Otherwise falls back to the
 * legacy behavior: one block per group (revealed one-at-a-time).
 *
 * Empty blocks (blank lines saved before saves trimmed them) are skipped, so they
 * never become a blank step. They keep their `index`, which question state is keyed by.
 */
function computeGroups(blocks: ContentBlock[]): RevealItem[][] {
  const hasBreak = blocks.some((b) => b.type === 'step-break');
  const groups: RevealItem[][] = [];
  if (!hasBreak) {
    blocks.forEach((block, index) => {
      if (block.type !== 'step-break' && !isEmptyBlock(block)) groups.push([{ block, index }]);
    });
    return groups;
  }
  let cur: RevealItem[] = [];
  blocks.forEach((block, index) => {
    if (isEmptyBlock(block)) return;
    if (block.type === 'step-break') {
      if (cur.length) groups.push(cur);
      cur = [];
    } else {
      cur.push({ block, index });
    }
  });
  if (cur.length) groups.push(cur);
  return groups;
}

/**
 * Nhóm mới được neo ở 10% chiều cao vùng cuộn tính từ mép trên — rơi vào vùng
 * giữa tầm mắt thay vì dính sát mép trên như `scrollIntoView({block:'start'})`.
 */
const VIEW_ANCHOR = 0.1;

/** `useLayoutEffect` cảnh báo khi render phía server; trang bài học có SSR. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function LessonPlayer({
  contentId,
  contentType,
  title,
  blocks,
  exitHref,
}: LessonPlayerProps) {
  const { navigate, goBack, isPending: isNavigating } = useNavigate();
  // Anonymous "suggest a fix": null = closed, string = open with that passage pre-filled.
  const [suggestQuote, setSuggestQuote] = useState<string | null>(null);
  const closeSuggest = useCallback(() => setSuggestQuote(null), []);
  const scrollRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const groupStartRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const { markCompleted } = useProgress();

  // Chân trang có nút Tiếp tục chiếm khoảng chừng này; nút chat nổi phải tránh ra.
  useBottomChrome('4.75rem');

  const [visibleGroups, setVisibleGroups] = useState(1);
  const [points, setPoints] = useState(0);
  const hasMarkedRef = useRef(false);
  const [questionStates, setQuestionStates] = useState<Record<number, {
    /** Ids picked so far. Single-choice questions simply never hold more than one. */
    selected: string[];
    checked: boolean;
    correct: boolean | null;
  }>>({});
  const [interactiveBlockCompleted, setInteractiveBlockCompleted] = useState<Record<number, boolean>>({});

  const groups = useMemo(() => computeGroups(blocks), [blocks]);
  const totalGroups = groups.length;
  const isComplete = visibleGroups > totalGroups;
  const revealed = groups.slice(0, visibleGroups).flat();
  const currentGroup = groups[visibleGroups - 1] ?? [];

  /**
   * Phần tử cuộn thật. Root chỉ đặt `min-height` nên `flex-1` của <main> không
   * resolve được thành chiều cao xác định — thường <main> cao bằng nội dung và
   * chính TÀI LIỆU mới cuộn (đó cũng là lý do header/footer phải `sticky`).
   * Trả về null nghĩa là cuộn tài liệu.
   */
  const getScroller = useCallback((): HTMLElement | null => {
    const main = scrollRef.current;
    if (!main || main.scrollHeight <= main.clientHeight) return null;
    const overflowY = getComputedStyle(main).overflowY;
    return overflowY === 'auto' || overflowY === 'scroll' ? main : null;
  }, []);

  /** Dải còn nhìn thấy được, đã trừ header và footer dính. */
  const getBand = useCallback(() => {
    const top = headerRef.current?.getBoundingClientRect().bottom ?? 0;
    const bottom = footerRef.current?.getBoundingClientRect().top ?? window.innerHeight;
    return { top, height: Math.max(1, bottom - top) };
  }, []);

  /**
   * Đỉnh phần tử so với khung nhìn, KHÔNG tính transform — block vừa hiện đang
   * chạy `animate-fade-in` (translateY 10px) mà getBoundingClientRect thì cộng
   * cả transform vào, nên phải đi theo chuỗi offsetTop.
   */
  const untransformedTop = useCallback((el: HTMLElement, scroller: HTMLElement | null) => {
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== scroller) {
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    if (scroller) return scroller.getBoundingClientRect().top + y - scroller.scrollTop;
    return y - window.scrollY;
  }, []);

  /**
   * Đệm dưới cùng đủ cao để nhóm cuối — thường rất ngắn — vẫn cuộn lên được
   * vạch 10%. Không có nó thì trình duyệt kẹp lại và nhóm rơi xuống giữa màn.
   */
  const syncTailPad = useCallback(() => {
    const content = contentRef.current;
    const start = groupStartRef.current;
    const tail = tailRef.current;
    if (!content || !start || !tail) return;

    // Đo chiều cao nhóm khi chưa có đệm, rồi mới đặt lại đệm.
    tail.style.height = '0px';
    const groupHeight = content.offsetHeight - (start.offsetTop - content.offsetTop);
    const needed = getBand().height * (1 - VIEW_ANCHOR) - groupHeight;
    tail.style.height = `${Math.max(0, needed)}px`;
  }, [getBand]);

  /** Đưa đầu nhóm hiện tại lên vạch 10% của dải nhìn thấy được. */
  const anchorToGroupStart = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const start = groupStartRef.current;
    if (!start) return;
    const scroller = getScroller();
    const band = getBand();
    const delta = untransformedTop(start, scroller) - (band.top + band.height * VIEW_ANCHOR);
    if (scroller) {
      scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + delta), behavior });
    } else {
      window.scrollTo({ top: Math.max(0, window.scrollY + delta), behavior });
    }
  }, [getScroller, getBand, untransformedTop]);

  // Nhóm mới hiện ra: đặt đệm rồi neo, cả hai trong cùng một lần bố cục để
  // thanh cuộn không nhảy hai nhịp.
  useIsomorphicLayoutEffect(() => {
    if (visibleGroups <= 1) return;
    syncTailPad();
    anchorToGroupStart();
  }, [visibleGroups, syncTailPad, anchorToGroupStart]);

  // Xoay ngang / đổi cỡ cửa sổ làm chiều cao vùng cuộn đổi theo.
  useEffect(() => {
    const onResize = () => syncTailPad();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [syncTailPad]);

  /**
   * Ảnh/video của nhóm hiện tại tải xong thì chiều cao thật mới lộ ra: tính lại
   * đệm, và neo lại nếu media đó là block cuối (phần dịch chuyển nằm ngay dưới
   * tầm mắt người học).
   */
  const handleMediaSettled = useCallback((reanchor: boolean) => {
    syncTailPad();
    if (reanchor) anchorToGroupStart();
  }, [syncTailPad, anchorToGroupStart]);

  // Nạp trước ảnh của cả bài ngay khi vào, để lúc block ảnh hiện ra thì ảnh đã
  // nằm sẵn trong cache trình duyệt — người học ít khi phải nhìn skeleton.
  useEffect(() => {
    const sources = blocks
      .filter((b): b is Extract<ContentBlock, { type: 'image' }> => b.type === 'image')
      .map((b) => b.src)
      .filter(Boolean);
    for (const src of sources) {
      const img = new window.Image();
      img.src = src;
    }
  }, [blocks]);

  // Cùng ý đồ với việc nạp trước ảnh, nhưng cho các chunk JS của block tương tác.
  // Đợi lúc trình duyệt rảnh để không tranh băng thông với phần bài đang hiện.
  useEffect(() => {
    const types = blocks.map((b) => b.type);
    const warm = () => preloadBlockTypes(types);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 2_000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 300);
    return () => clearTimeout(id);
  }, [blocks]);

  const handleClose = () => {
    if (isNavigating) return;

    // Vào bài học là `push`, nên thoát phải GỠ entry đó khỏi history. Trước đây
    // thoát cũng `push` — back một bước là rơi ngược vào chính bài vừa thoát.
    if (getPreviousPath() === exitHref) {
      goBack();
      return;
    }

    // Mở thẳng link bài học hoặc F5 giữa bài: không có gì để lùi. `replace` để
    // entry player biến mất thay vì bị đẩy xuống dưới.
    navigate(exitHref, { replace: true });
  };

  const handleSelect = (blockIndex: number, optionId: string) => {
    const block = blocks[blockIndex] as QuestionBlock;
    setQuestionStates((prev) => ({
      ...prev,
      [blockIndex]: {
        ...prev[blockIndex],
        selected: toggleAnswer(prev[blockIndex]?.selected ?? [], optionId, block.mode),
        checked: false,
        correct: null,
      },
    }));
  };

  const handleCheck = (blockIndex: number) => {
    const block = blocks[blockIndex] as QuestionBlock;
    const isCorrect = isAnswerCorrect(block, questionStates[blockIndex]?.selected ?? []);

    setQuestionStates((prev) => ({
      ...prev,
      [blockIndex]: { ...prev[blockIndex], checked: true, correct: isCorrect },
    }));

    if (isCorrect) setPoints((prev) => prev + 10);

    if (block.explanation) {
      setTimeout(() => {
        explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleContinue = () => {
    if (isComplete) {
      if (!hasMarkedRef.current) {
        hasMarkedRef.current = true;
        markCompleted(contentType, contentId, points);
      }
      handleClose();
    } else {
      setVisibleGroups((prev) => prev + 1);
    }
  };

  // Check every selected-but-unchecked question in the current group at once.
  const handleCheckGroup = () => {
    currentGroup.forEach((it) => {
      if (it.block.type === 'question' && questionStates[it.index]?.selected?.length && !questionStates[it.index]?.checked) {
        handleCheck(it.index);
      }
    });
  };

  // Button state logic — gated on ALL question/interactive blocks in the current group.
  const groupQuestions = currentGroup.filter((it) => it.block.type === 'question');
  const groupInteractives = currentGroup.filter((it) => INTERACTIVE_BLOCK_TYPES.includes(it.block.type));
  const allSelected = groupQuestions.every((it) => (questionStates[it.index]?.selected?.length ?? 0) > 0);
  const allChecked = groupQuestions.every((it) => questionStates[it.index]?.checked);
  const allInteractiveDone = groupInteractives.every((it) => interactiveBlockCompleted[it.index]);

  let buttonText = 'Tiếp tục';
  let buttonAction: () => void | Promise<void> = handleContinue;
  let buttonDisabled = false;
  let buttonStyle = 'bg-gray-900 text-white hover:bg-gray-800';

  if (isComplete) {
    buttonText = 'Hoàn thành';
    buttonStyle = 'bg-green-500 text-white hover:bg-green-600';
  } else if (groupQuestions.length > 0 && !allSelected) {
    buttonText = 'Chọn đáp án';
    buttonDisabled = true;
    buttonStyle = 'bg-gray-200 text-gray-400 cursor-not-allowed';
  } else if (groupQuestions.length > 0 && !allChecked) {
    buttonText = 'Kiểm tra';
    buttonAction = handleCheckGroup;
    buttonStyle = 'bg-blue-500 text-white hover:bg-blue-600';
  } else if (groupInteractives.length > 0 && !allInteractiveDone) {
    buttonText = 'Hoàn thành bài tập';
    buttonDisabled = true;
    buttonStyle = 'bg-gray-200 text-gray-400 cursor-not-allowed';
  }

  const progress = Math.min((visibleGroups / Math.max(totalGroups, 1)) * 100, 100);

  return (
    <div className="min-h-screen-dvh bg-white flex flex-col">
      <TextSelectionPopover onSuggestEdit={setSuggestQuote} />
      <SuggestEditDialog
        open={suggestQuote !== null}
        onClose={closeSuggest}
        contentType={contentType}
        contentId={contentId}
        title={title}
        initialQuote={suggestQuote ?? ''}
      />
      {/* Header */}
      <header ref={headerRef} className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 pt-safe">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleClose}
            disabled={isNavigating}
            aria-busy={isNavigating}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-wait"
            aria-label="Đóng bài học"
          >
            {isNavigating
              ? <Spinner size="md" tone="muted" />
              : <X className="w-6 h-6 text-gray-600" aria-hidden="true" />}
          </button>
          {/* Lề hẹp trên mobile: mx-8 cố định bóp thanh tiến độ còn một mẩu ở màn 390px. */}
          <div className="flex-1 ml-2 mr-1 sm:mx-8">
            <div
              className="h-2 bg-gray-100 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Tiến độ: ${title}`}
            >
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setSuggestQuote('')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Góp ý chỉnh sửa bài học"
            title="Góp ý chỉnh sửa"
          >
            <PencilLine className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" ref={scrollRef} className="relative flex-1 overflow-auto">
        <div ref={contentRef} className="max-w-3xl mx-auto px-4 py-8 [&>div:first-child>*]:mt-0">
          {revealed.map(({ block, index }, pos) => {
            const isLast = pos === revealed.length - 1;
            const inCurrentGroup = currentGroup.some((it) => it.index === index);
            // Neo vào block ĐẦU của nhóm mới, không phải block cuối — người học
            // bắt đầu đọc từ đầu phần vừa mở ra.
            const isGroupStart = inCurrentGroup && currentGroup[0]?.index === index;
            return (
              <div
                key={index}
                className="animate-fade-in"
                ref={isGroupStart ? groupStartRef : undefined}
              >
                <BlockRenderer
                  block={block}
                  index={index}
                  questionState={questionStates[index]}
                  onSelectAnswer={handleSelect}
                  onInteractiveComplete={(idx) => setInteractiveBlockCompleted((prev) => ({ ...prev, [idx]: true }))}
                  isLastVisible={isLast}
                  explanationRef={explanationRef}
                  isCurrentBlock={inCurrentGroup}
                  onMediaSettled={handleMediaSettled}
                />
              </div>
            );
          })}
          {/* Đệm động: cho phép nhóm cuối cũng cuộn lên được vạch 10%. */}
          <div ref={tailRef} aria-hidden="true" />
        </div>
      </main>

      {/* Footer */}
      <footer ref={footerRef} className="sticky bottom-0 z-40 bg-white border-t border-gray-100 px-4 pt-4 pb-safe-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={buttonAction}
            disabled={buttonDisabled || isNavigating}
            aria-busy={isNavigating}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all active:scale-[0.99] disabled:cursor-wait flex items-center justify-center gap-2 ${buttonStyle}`}
          >
            {isNavigating ? (
              <>
                <Spinner size="sm" tone="onDark" />
                Đang lưu…
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

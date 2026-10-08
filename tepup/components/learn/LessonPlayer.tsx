'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { X, PencilLine, ArrowRight, BookOpen, RotateCcw, CircleCheck } from 'lucide-react';
import { useNavigate } from '@/lib/hooks/useNavigate';
import { getPreviousPath } from '@/lib/navigation-history';
import Spinner from '@/components/ui/Spinner';
import type { ContentBlock, QuestionBlock } from '@/lib/types/content';
import { toggleAnswer, isAnswerCorrect } from '@/lib/utils/quiz';
import { useProgress } from '@/lib/contexts/ProgressContext';
import { useBottomChrome } from '@/lib/hooks/useBottomChrome';
import TextSelectionPopover from '@/components/ai/TextSelectionPopover';
import SuggestEditDialog from '@/components/learn/SuggestEditDialog';
import ReaderSettings from '@/components/reader/ReaderSettings';
import { BlockRenderer, INTERACTIVE_BLOCK_TYPES, preloadBlockTypes } from '@/components/learn/BlockRenderer';
import { isEmptyBlock } from '@/lib/editor/trim-empty-blocks';
import type { NextItemLink } from '@/lib/utils/next-item';

interface LessonPlayerProps {
  /** Stable database id — this is what progress is keyed by, never the slug. */
  contentId: string;
  contentType: 'lesson' | 'chapter';
  title: string;
  blocks: ContentBlock[];
  /** Where the close button and the completion handler return to. */
  exitHref: string;
  /** The next lesson/chapter, offered at the end. Null on the last one. */
  next?: NextItemLink | null;
}

/**
 * - `learn`: reveal group by group (the normal flow).
 * - `choose`: the learner finished this before; ask how to revisit it.
 * - `review`: every block at once, questions shown answered, no gating, and
 *   finishing does not overwrite the saved score.
 */
type PlayerMode = 'learn' | 'choose' | 'review';

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
 * Nhóm mới được đặt GIỮA dải nhìn thấy được (giữa header và footer dính). Trước
 * đây neo ở vạch 10% từ mép trên: trên laptop, nhóm ngắn dính lên đầu màn hình
 * và cả phần dưới bỏ trống. Nhóm cao hơn dải thì neo đầu nhóm cách mép trên
 * một khoảng nhỏ, để người học bắt đầu đọc từ đầu phần vừa mở.
 */
const TALL_GROUP_MARGIN = 24;

/**
 * Nút chân trang khi chưa bấm được (chưa chọn đáp án, chưa xong bài tập). Chữ là
 * lời hướng dẫn nên phải đọc được: gray-600 trên gray-100 ≈ 7:1, vẫn nhạt hẳn so
 * với nút đen đang hoạt động.
 */
const DISABLED_BUTTON_STYLE = 'bg-gray-100 text-gray-600 cursor-not-allowed';

/** Tiến độ không phát sự kiện riêng cho từng bài; ProgressContext render lại là đủ. */
const subscribeNever = () => () => {};

/** `useLayoutEffect` cảnh báo khi render phía server; trang bài học có SSR. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function LessonPlayer({
  contentId,
  contentType,
  title,
  blocks,
  exitHref,
  next = null,
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  /**
   * Nút vừa bấm có thể biến mất (màn hỏi xem lại, chân trang đổi sang "Học bài
   * tiếp"): ghi lại chỗ cần đưa focus tới sau lần render kế, để phím Tab không
   * rơi về <body> và bỏ qua phần vừa mở.
   */
  const pendingFocusRef = useRef<'group' | 'top' | null>(null);
  const { markCompleted, isCompleted } = useProgress();

  // Tiến độ nằm ở localStorage: server (và lần hydrate) coi như chưa học, ngay sau
  // đó trình duyệt đọc giá trị thật. Người học chọn xong thì `choice` quyết định;
  // hoàn thành bài ngay trong lượt này (`finishedHere`) không được bật lại màn hỏi.
  const wasCompleted = useSyncExternalStore(
    subscribeNever,
    () => isCompleted(contentType, contentId),
    () => false,
  );
  const [choice, setChoice] = useState<'learn' | 'review' | null>(null);
  const [finishedHere, setFinishedHere] = useState(false);
  const mode: PlayerMode = choice ?? (wasCompleted && !finishedHere ? 'choose' : 'learn');

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
  const showNext = isComplete && next !== null;

  // Chân trang có nút Tiếp tục chiếm khoảng chừng này; nút chat nổi phải tránh ra.
  // Cuối bài có thêm dòng "Tiếp theo" nên cao hơn; màn hỏi xem lại thì không có chân trang.
  useBottomChrome(mode === 'choose' ? '0rem' : showNext ? '6.5rem' : '4.75rem');

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
   * Chiều cao nhóm hiện tại: từ đầu block đầu nhóm tới đầu phần đệm (ngay sau
   * block cuối). Cả hai cùng offsetParent nên không bị transform hay đệm ảnh hưởng.
   */
  const groupHeight = useCallback(() => {
    const start = groupStartRef.current;
    const tail = tailRef.current;
    if (!start || !tail) return 0;
    return Math.max(0, tail.offsetTop - start.offsetTop);
  }, []);

  /** Đỉnh nhóm nên nằm ở đâu trong khung nhìn: giữa dải, hoặc sát trên nếu nhóm quá cao. */
  const targetTop = useCallback((height: number) => {
    const band = getBand();
    const room = band.height - height;
    return room >= 2 * TALL_GROUP_MARGIN ? band.top + room / 2 : band.top + TALL_GROUP_MARGIN;
  }, [getBand]);

  /**
   * Đệm dưới cùng đủ cao để nhóm cuối — thường rất ngắn — vẫn cuộn lên được tới
   * giữa dải. Không có nó thì trình duyệt kẹp lại ở cuối trang và nhóm rơi xuống dưới.
   */
  const syncTailPad = useCallback(() => {
    const content = contentRef.current;
    const tail = tailRef.current;
    if (!content || !groupStartRef.current || !tail) return;

    const height = groupHeight();
    const band = getBand();
    // Khoảng trống cần có dưới nhóm khi nhóm nằm đúng chỗ, trừ phần lề dưới sẵn có.
    const below = band.top + band.height - (targetTop(height) + height);
    const padBottom = parseFloat(getComputedStyle(content).paddingBottom) || 0;
    tail.style.height = `${Math.max(0, below - padBottom)}px`;
  }, [getBand, groupHeight, targetTop]);

  /** Đưa nhóm hiện tại vào giữa dải nhìn thấy được. */
  const anchorToGroupStart = useCallback((behavior?: ScrollBehavior) => {
    const start = groupStartRef.current;
    if (!start) return;
    // Cuộn mượt bằng JS không chịu quy tắc CSS prefers-reduced-motion: tự kiểm tra.
    behavior ??= window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const scroller = getScroller();
    const delta = untransformedTop(start, scroller) - targetTop(groupHeight());
    if (scroller) {
      scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + delta), behavior });
    } else {
      window.scrollTo({ top: Math.max(0, window.scrollY + delta), behavior });
    }
  }, [getScroller, untransformedTop, targetTop, groupHeight]);

  // Nhóm mới hiện ra: đặt đệm rồi neo, cả hai trong cùng một lần bố cục để
  // thanh cuộn không nhảy hai nhịp.
  useIsomorphicLayoutEffect(() => {
    if (visibleGroups <= 1) return;
    syncTailPad();
    anchorToGroupStart();
  }, [visibleGroups, syncTailPad, anchorToGroupStart]);

  // Chạy sau hiệu ứng neo ở trên (cùng lượt, theo thứ tự khai báo); preventScroll
  // để focus không kéo khung nhìn khỏi vị trí vừa neo.
  useIsomorphicLayoutEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    if (target === 'top') {
      headingRef.current?.focus({ preventScroll: true });
      return;
    }
    // Nhóm mới: focus vào block đầu nhóm. Hết bài và có bài sau: nút vừa bấm đã
    // bị thay bằng cặp nút cuối bài, nên chuyển sang nút chính.
    (groupStartRef.current ?? nextButtonRef.current)?.focus({ preventScroll: true });
  }, [mode, visibleGroups]);

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
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        explanationRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      }, 100);
    }
  };

  /** Kết thúc bài: lưu hoàn thành (trừ khi chỉ đang xem lại), rồi sang bài sau hoặc thoát. */
  const finish = (goNext: boolean) => {
    if (isNavigating) return;
    if (mode === 'learn' && !hasMarkedRef.current) {
      hasMarkedRef.current = true;
      setFinishedHere(true);
      markCompleted(contentType, contentId, points);
    }
    // `replace`: back từ bài sau đưa về trang khoá học, không lùi qua từng bài đã học.
    if (goNext && next) navigate(next.href, { replace: true });
    else handleClose();
  };

  const handleContinue = () => {
    if (isComplete) {
      finish(false);
      return;
    }
    pendingFocusRef.current = 'group';
    setVisibleGroups((prev) => prev + 1);
  };

  /** Xem lại: hiện mọi block cùng lúc, câu hỏi hiện sẵn đáp án đúng và lời giải. */
  const startReview = () => {
    const answered: typeof questionStates = {};
    blocks.forEach((block, index) => {
      if (block.type !== 'question') return;
      const correctIds = block.options.filter((o) => o.isCorrect).map((o) => o.id);
      answered[index] = { selected: correctIds, checked: true, correct: true };
    });
    setQuestionStates(answered);
    setVisibleGroups(totalGroups + 1);
    setChoice('review');
    pendingFocusRef.current = 'top';
    window.scrollTo({ top: 0 });
  };

  const startRetake = () => {
    setChoice('learn');
    pendingFocusRef.current = 'top';
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
    buttonText = mode === 'review' ? 'Xong' : 'Hoàn thành';
    buttonStyle = 'bg-green-700 text-white hover:bg-green-800';
  } else if (groupQuestions.length > 0 && !allSelected) {
    buttonText = 'Chọn đáp án';
    buttonDisabled = true;
    buttonStyle = DISABLED_BUTTON_STYLE;
  } else if (groupQuestions.length > 0 && !allChecked) {
    buttonText = 'Kiểm tra';
    buttonAction = handleCheckGroup;
    buttonStyle = 'bg-blue-600 text-white hover:bg-blue-700';
  } else if (groupInteractives.length > 0 && !allInteractiveDone) {
    buttonText = 'Hoàn thành bài tập';
    buttonDisabled = true;
    buttonStyle = DISABLED_BUTTON_STYLE;
  }

  const progress = Math.min((visibleGroups / Math.max(totalGroups, 1)) * 100, 100);

  // Đọc cho trình đọc màn hình mỗi lần mở thêm một phần. Lúc vào bài hay xem lại
  // thì chuỗi rỗng, nên không đọc gì.
  const revealAnnouncement =
    mode !== 'learn' || visibleGroups <= 1
      ? ''
      : isComplete
      ? `Đã hết ${contentType === 'lesson' ? 'bài học' : 'chương'}.`
      : `Phần ${visibleGroups}/${totalGroups}`;

  return (
    <div className="reader min-h-screen-dvh bg-white flex flex-col">
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
            aria-label={contentType === 'lesson' ? 'Đóng bài học' : 'Đóng chương'}
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
                className="h-full bg-green-700 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <ReaderSettings />
          <button
            onClick={() => setSuggestQuote('')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={contentType === 'lesson' ? 'Góp ý chỉnh sửa bài học' : 'Góp ý chỉnh sửa chương'}
            title="Góp ý chỉnh sửa"
          >
            <PencilLine className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Luôn gắn sẵn, chỉ đổi chữ: vùng live mọc ra cùng nội dung thường bị bỏ qua. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{revealAnnouncement}</p>

      {/* Main Content */}
      <main id="main-content" ref={scrollRef} className="relative flex-1 overflow-auto">
        {mode === 'choose' ? (
          <RevisitChooser
            contentType={contentType}
            title={title}
            onReview={startReview}
            onRetake={startRetake}
          />
        ) : (
        <>
        {/* Đúng một h1 mỗi màn (màn hỏi xem lại có h1 riêng). Nằm ngoài
            contentRef để không phá bộ chọn :first-child bên dưới. */}
        <h1 ref={headingRef} tabIndex={-1} className="sr-only">{title}</h1>
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
                // Đầu nhóm chỉ nhận focus bằng script sau khi mở nhóm (không phải
                // điểm Tab) và không bấm được, nên không cần viền focus.
                // eslint-disable-next-line no-restricted-syntax -- vùng chứa không tương tác, focus bằng script
                className={isGroupStart ? 'animate-fade-in outline-none' : 'animate-fade-in'}
                ref={isGroupStart ? groupStartRef : undefined}
                tabIndex={isGroupStart ? -1 : undefined}
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
          {/* Đệm động: cho phép nhóm cuối cũng cuộn lên được giữa dải nhìn thấy. */}
          <div ref={tailRef} aria-hidden="true" />
        </div>
        </>
        )}
      </main>

      {/* Footer — ẩn ở màn hỏi xem lại, vì hai lựa chọn đã nằm giữa màn hình. */}
      {mode !== 'choose' && (
      <footer ref={footerRef} className="sticky bottom-0 z-40 bg-white border-t border-gray-100 px-4 pt-4 pb-safe-4">
        <div className="max-w-3xl mx-auto">
          {showNext && next ? (
            <>
              <p className="mb-3 text-sm text-gray-500 truncate">
                {contentType === 'lesson' ? 'Bài tiếp theo' : 'Chương tiếp theo'}:{' '}
                <span className="font-medium text-gray-800">{next.title}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => finish(false)}
                  aria-disabled={isNavigating || undefined}
                  className="shrink-0 px-4 sm:px-5 py-4 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors aria-disabled:cursor-wait"
                >
                  {contentType === 'lesson' ? 'Về khoá học' : 'Về câu chuyện'}
                </button>
                <button
                  ref={nextButtonRef}
                  type="button"
                  onClick={() => finish(true)}
                  aria-disabled={isNavigating || undefined}
                  aria-busy={isNavigating}
                  className="flex-1 basis-48 py-4 rounded-xl font-semibold text-lg bg-green-700 text-white hover:bg-green-800 transition-all active:scale-[0.99] aria-disabled:cursor-wait flex items-center justify-center gap-2"
                >
                  {isNavigating ? (
                    <>
                      <Spinner size="sm" tone="onDark" />
                      Đang lưu…
                    </>
                  ) : (
                    <>
                      {contentType === 'lesson' ? 'Học bài tiếp' : 'Đọc chương tiếp'}
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
          <button
            type="button"
            // aria-disabled thay cho disabled: nút bị khoá ngay sau khi bấm "Tiếp
            // tục" sẽ đẩy focus về <body>. Nút giữ focus, chỉ là bấm không làm gì.
            onClick={buttonDisabled || isNavigating ? undefined : buttonAction}
            aria-disabled={buttonDisabled || isNavigating || undefined}
            aria-busy={isNavigating}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${buttonDisabled ? '' : 'active:scale-[0.99]'} ${isNavigating ? 'cursor-wait' : ''} ${buttonStyle}`}
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
          )}
        </div>
      </footer>
      )}
    </div>
  );
}

/**
 * Màn hỏi khi người học mở lại bài đã hoàn thành: đọc lại toàn bộ một lượt, hay
 * học lại từ đầu như lần đầu.
 */
function RevisitChooser({
  contentType,
  title,
  onReview,
  onRetake,
}: {
  contentType: 'lesson' | 'chapter';
  title: string;
  onReview: () => void;
  onRetake: () => void;
}) {
  const noun = contentType === 'lesson' ? 'bài học' : 'chương';
  const firstRef = useRef<HTMLButtonElement>(null);
  // Đưa focus vào lựa chọn đầu để người dùng bàn phím/trình đọc màn hình biết ngay.
  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const option =
    'w-full flex items-start gap-4 text-left p-5 rounded-2xl border border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors';

  return (
    <section aria-labelledby="revisit-title" className="max-w-xl mx-auto px-4 py-10 sm:py-16">
      <CircleCheck className="w-10 h-10 text-green-600 mb-4" aria-hidden="true" />
      <h1 id="revisit-title" className="text-2xl font-bold text-gray-900">
        Bạn đã hoàn thành {noun} này
      </h1>
      <p className="mt-2 text-gray-600">
        <span className="font-medium text-gray-800">{title}</span> — bạn muốn xem lại theo cách nào?
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <button ref={firstRef} type="button" onClick={onReview} className={option}>
          <BookOpen className="w-6 h-6 mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
          <span>
            <span className="block font-semibold text-gray-900">Đọc toàn bộ {noun}</span>
            <span className="block mt-1 text-sm text-gray-600">
              Hiện tất cả nội dung cùng lúc, câu hỏi kèm sẵn đáp án và lời giải.
            </span>
          </span>
        </button>
        <button type="button" onClick={onRetake} className={option}>
          <RotateCcw className="w-6 h-6 mt-0.5 shrink-0 text-gray-700" aria-hidden="true" />
          <span>
            <span className="block font-semibold text-gray-900">Học lại từ đầu</span>
            <span className="block mt-1 text-sm text-gray-600">
              Đi lại từng phần và tự trả lời câu hỏi như lần đầu.
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}

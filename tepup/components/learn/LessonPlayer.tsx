'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
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
import ReferenceProvider from '@/components/reference/ReferenceProvider';
import { collectTvSlugs } from '@/lib/library/refs';
import { fraunces, beVietnam } from '@/lib/fonts/paper';
import { takeStampHandoff, introStampSize } from '@/lib/paper/stamp-handoff';
import { PaperPlayerContext } from './paper-context';
import { IconAa, IconArrow, IconClose, IconNote, IconReset, IconReview } from './PaperIcons';
import { flush, tally, track } from '@/lib/analytics/client';
import { ListChecks } from 'lucide-react';
import { stripTags } from '@/lib/diff/text';
import ProgressDialog, { type CourseOutline, type LessonSection } from './ProgressDialog';
import './player-paper.css';

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
  /** Library reference reader (previews + side panels) on? Server flag, see lib/library/flags.ts. */
  references?: boolean;
  /** Extra header controls. Staff view only (signed-in); the public ISR route never passes it. */
  headerExtra?: React.ReactNode;
  /** Notices above the content (flags, endorsements). Same for every visitor: cache-safe. */
  notices?: React.ReactNode;
  /**
   * Lessons only: the course outline (visible lessons), for the "Tiến độ" dialog and the anonymous
   * "học xong cả khoá" tally. Same for every visitor (cached read), so cache-safe.
   */
  course?: CourseOutline | null;
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
 * legacy behavior: one block per group (revealed one-at-a-time), except that a heading
 * joins the block after it.
 *
 * Empty blocks (blank lines saved before saves trimmed them) are skipped, so they
 * never become a blank step. They keep their `index`, which question state is keyed by.
 */
function computeGroups(blocks: ContentBlock[]): RevealItem[][] {
  const hasBreak = blocks.some((b) => b.type === 'step-break');
  const groups: RevealItem[][] = [];
  if (!hasBreak) {
    // A heading is never a step on its own: it opens together with the block after it
    // (legacy `text.title` became a separate heading block, scripts/split-text-titles.ts).
    let pending: RevealItem[] = [];
    blocks.forEach((block, index) => {
      if (block.type === 'step-break' || isEmptyBlock(block)) return;
      pending.push({ block, index });
      if (block.type !== 'heading') {
        groups.push(pending);
        pending = [];
      }
    });
    if (pending.length) groups.push(pending);
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
 * Nhịp chuyển động của trang học (demo-course-stories, giữ nguyên giá trị):
 * khối mới vượt đường 75% chiều cao màn thì cả nội dung trượt lên vừa đủ để mép
 * dưới khối mới đậu đúng đường đó; khối cao hơn chỗ còn lại thì canh mép trên
 * (chừa 28px khối trước cho biết mạch).
 */
const FLOW_LINE = 0.75;
const FLOW_CONTEXT = 28;
const EASE_FLY = 'cubic-bezier(.65,0,.25,1)';
const EASE_UP = 'cubic-bezier(.16,1,.3,1)';
const EASE_RISE = 'cubic-bezier(.22,1,.36,1)';
const STAMP_SRC = '/paper/lesson-stamp-go.webp';

/** Tiến độ không phát sự kiện riêng cho từng bài; ProgressContext render lại là đủ. */
const subscribeNever = () => () => {};

/** `useLayoutEffect` cảnh báo khi render phía server; trang bài học có SSR. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * - `intro`: Screen 1 (tem + tên) đang chạy, khung học còn ẩn.
 * - `ready`: khung học (thanh trên, nội dung, nút dưới) đã hiện.
 */
type Phase = 'intro' | 'ready';

export default function LessonPlayer({
  contentId,
  contentType,
  title,
  blocks,
  exitHref,
  next = null,
  references = false,
  headerExtra = null,
  notices = null,
  course = null,
}: LessonPlayerProps) {
  // Every /tv/<slug> in the content, so the reader fetches all previews in one request.
  const refSlugs = useMemo(() => [...collectTvSlugs(blocks).keys()], [blocks]);
  const { navigate, goBack, isPending: isNavigating } = useNavigate();
  const pathname = usePathname();
  const isLesson = contentType === 'lesson';
  const noun = isLesson ? 'bài học' : 'chương';
  // Anonymous "suggest a fix": null = closed, string = open with that passage pre-filled.
  const [suggestQuote, setSuggestQuote] = useState<string | null>(null);
  // One form for every kind of suggestion; the learner picks "sửa bài" or "thuật ngữ" in it.
  const closeSuggest = useCallback(() => setSuggestQuote(null), []);
  const openSuggestEdit = useCallback((q: string) => setSuggestQuote(q), []);

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const setRoot = useCallback((el: HTMLDivElement | null) => {
    rootRef.current = el;
    setRootEl(el);
  }, []);
  const paperCtx = useMemo(() => ({ root: rootEl }), [rootEl]);

  const scrollRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const groupStartRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  /**
   * Nút vừa bấm có thể biến mất (màn hỏi xem lại, chân trang đổi sang "Đọc chương
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

  const [phase, setPhase] = useState<Phase>('intro');
  // Tem Screen 1: ảnh của folder vừa bấm (nếu đi từ trang câu chuyện), mặc định tem "Học ngay".
  const [stampSrc, setStampSrc] = useState(STAMP_SRC);
  const [introShown, setIntroShown] = useState(true);
  const leavingRef = useRef(false);

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
  const visible = groups.slice(0, visibleGroups);
  const currentGroup = groups[visibleGroups - 1] ?? [];

  // ---------------------------------------------------------------- số liệu ẩn danh
  // CLAUDE.md › Analytics. Chỉ ở chế độ học (không phải xem lại). track() tự bỏ qua khi
  // người học tắt tracking; tally() là bộ đếm tổng không mã, ai cũng cộng.
  const analyticsRef = useRef({ started: false, finished: false, lastGroup: 0 });
  useEffect(() => {
    const a = analyticsRef.current;
    if (phase !== 'ready' || mode !== 'learn') return;
    if (!a.started) {
      a.started = true;
      track({ name: 'content_start', contentType, contentId });
      tally({ metric: 'content_start', contentType, contentId });
    }
    for (let g = a.lastGroup; g < Math.min(visibleGroups, totalGroups); g++) {
      for (const it of groups[g]) {
        track({ name: 'block_view', contentType, contentId, blockIndex: it.index, blockType: it.block.type });
      }
    }
    a.lastGroup = Math.max(a.lastGroup, Math.min(visibleGroups, totalGroups));
  }, [phase, mode, visibleGroups, totalGroups, groups, contentType, contentId]);

  // ---------------------------------------------------------------- bảng "Tiến độ"
  const [progressOpen, setProgressOpen] = useState(false);
  const progressBtnRef = useRef<HTMLButtonElement>(null);
  // Các phần của bài = heading cấp 1–2 (không có thì lấy mọi heading).
  const sectionHeads = useMemo(() => {
    const heads = blocks
      .map((b, index) => ({ b, index }))
      .filter((x): x is { b: Extract<ContentBlock, { type: 'heading' }>; index: number } => x.b.type === 'heading');
    const top = heads.filter((h) => h.b.level <= 2);
    return (top.length ? top : heads)
      .map((h) => ({ blockIndex: h.index, title: stripTags(h.b.html).trim() }))
      .filter((h) => h.title);
  }, [blocks]);
  const allRevealed = mode === 'review' || isComplete;
  const lastRevealedIndex = allRevealed
    ? Infinity
    : (groups[Math.min(visibleGroups, totalGroups) - 1] ?? []).reduce((m, it) => Math.max(m, it.index), -1);
  const sections: LessonSection[] = sectionHeads.map((h, i) => {
    if (mode === 'choose' || allRevealed) return { ...h, status: 'done' };
    if (h.blockIndex > lastRevealedIndex) return { ...h, status: 'todo' };
    const next = sectionHeads[i + 1];
    return { ...h, status: next && next.blockIndex <= lastRevealedIndex ? 'done' : 'current' };
  });
  const jumpToBlock = useCallback((blockIndex: number): HTMLElement | null => {
    const el = flowRef.current?.querySelector<HTMLElement>(`[data-block-index="${blockIndex}"]`) ?? null;
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    // Một lần focus để trình đọc màn hình đọc từ phần vừa chọn, rồi dọn tabindex.
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
    }
    return el;
  }, []);

  // Rời bài giữa chừng (đóng tab, chuyển trang): ghi block cuối đã thấy.
  useEffect(() => {
    const a = analyticsRef.current;
    const exit = () => {
      if (!a.started || a.finished) return;
      a.finished = true;
      const lastGroup = groups[Math.max(0, a.lastGroup - 1)] ?? [];
      track({
        name: 'content_exit',
        contentType,
        contentId,
        blockIndex: lastGroup[lastGroup.length - 1]?.index ?? 0,
        totalBlocks: blocks.length,
      });
    };
    const onPageHide = () => {
      exit();
      flush(true);
    };
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      exit();
    };
  }, [groups, blocks.length, contentType, contentId]);

  // ---------------------------------------------------------------- đo chân trang
  // --foot = mép trên cụm nút tính từ đáy: mask của vùng cuộn tan dần ngay trên nó, và
  // nút nổi (chat) đứng trên nó. Chữ to hơn khi người học phóng chữ, nên phải đo thật.
  const [footHeight, setFootHeight] = useState(0);
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const measure = () => {
      const bottom = parseFloat(getComputedStyle(el).bottom) || 0;
      setFootHeight(Math.ceil(el.offsetHeight + bottom));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, phase]);
  useBottomChrome(mode === 'choose' || phase === 'intro' ? '0rem' : footHeight ? `${footHeight}px` : '6.5rem');

  // ---------------------------------------------------------------- cuộn & hiện khối
  /** Đường 75% màn, tính theo toạ độ trong vùng cuộn. */
  const flowLimit = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return 0;
    return window.innerHeight * FLOW_LINE - scroller.getBoundingClientRect().top;
  }, []);

  /** Chừa chỗ trống dưới cùng để khối cuối vẫn đẩy lên được tới đường 75%. */
  const padFlow = useCallback(() => {
    const scroller = scrollRef.current;
    const flow = flowRef.current;
    if (!scroller || !flow) return;
    if (mode === 'review') {
      // Cuộn hết vẫn đọc được khối cuối, không nằm sau nút.
      flow.style.paddingBottom = 'calc(var(--foot, 104px) + 6rem)';
      return;
    }
    flow.style.paddingBottom = `${Math.max(160, scroller.clientHeight - flowLimit() + 40)}px`;
  }, [mode, flowLimit]);

  const scrollRaf = useRef(0);
  /** Cuộn ease-out (nhanh lúc đầu, chậm dần); cuộn mới thay cuộn đang chạy. Trả về thời lượng. */
  const glideScroll = useCallback((to: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return 0;
    cancelAnimationFrame(scrollRaf.current);
    const from = scroller.scrollTop;
    const dist = to - from;
    if (prefersReducedMotion() || Math.abs(dist) < 2) {
      scroller.scrollTop = to;
      return 0;
    }
    const dur = Math.min(750, 420 + Math.abs(dist) * 0.5);
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      scroller.scrollTop = from + dist * e;
      if (t < 1) scrollRaf.current = requestAnimationFrame(step);
    };
    scrollRaf.current = requestAnimationFrame(step);
    return dur;
  }, []);
  useEffect(() => () => cancelAnimationFrame(scrollRaf.current), []);

  /**
   * Đưa phần tử lên vừa đủ để mép dưới của nó đậu trên đường 75%. Chỉ cuộn xuống,
   * không bao giờ kéo ngược lên. Đo bỏ phần lệch của hiệu ứng nổi lên (transform).
   */
  const reveal = useCallback((node: HTMLElement | null) => {
    const scroller = scrollRef.current;
    if (!node || !scroller) return 0;
    const r = node.getBoundingClientRect();
    const base = scroller.getBoundingClientRect().top - scroller.scrollTop;
    const transform = getComputedStyle(node).transform;
    const ty = transform && transform !== 'none' ? new DOMMatrix(transform).m42 : 0;
    const top = r.top - base - ty;
    const bottom = r.bottom - base - ty;
    const limit = flowLimit();
    let want = bottom - limit;
    if (bottom - top > limit - FLOW_CONTEXT) want = top - FLOW_CONTEXT;
    if (want <= scroller.scrollTop + 1) return 0;
    return glideScroll(want);
  }, [flowLimit, glideScroll]);

  /** Khối mới hiện dần: mờ → rõ, nổi 8px; tiêu đề + từng đoạn nối đuôi 80ms. */
  const fadeIn = useCallback((nodes: HTMLElement[], delay: number, gap = 80) => {
    if (prefersReducedMotion()) return;
    nodes.forEach((x, i) => {
      x.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 800, delay: delay + i * gap, easing: EASE_RISE, fill: 'backwards' },
      );
    });
  }, []);

  const groupParts = useCallback((group: HTMLElement) => {
    const parts: HTMLElement[] = [];
    group.querySelectorAll<HTMLElement>(':scope > .pl__block').forEach((block) => {
      const lt = block.querySelector<HTMLElement>(':scope > .lt');
      if (lt) parts.push(...lt.querySelectorAll<HTMLElement>(':scope > .lt__title, .lt__paras > p'));
      else parts.push(block);
    });
    return parts;
  }, []);

  // Nhóm mới hiện ra (kể cả nhóm đầu khi khung học vừa hiện): đặt đệm, cuộn trước
  // tạo chỗ, rồi nhóm hiện dần khi cuộn đi được ~55%. Focus vào nhóm (preventScroll
  // để khung nhìn không nhảy khỏi chỗ vừa cuộn).
  useIsomorphicLayoutEffect(() => {
    if (phase !== 'ready' || mode !== 'learn') return;
    const group = groupStartRef.current;
    padFlow();
    if (!group) return;
    const dur = visibleGroups > 1 ? reveal(group) : 0;
    fadeIn(groupParts(group), dur ? dur * 0.55 : visibleGroups > 1 ? 0 : 200);
  }, [visibleGroups, phase, mode, padFlow, reveal, fadeIn, groupParts]);

  useIsomorphicLayoutEffect(() => {
    const target = pendingFocusRef.current;
    if (!target || phase !== 'ready') return;
    pendingFocusRef.current = null;
    if (target === 'top') {
      headingRef.current?.focus({ preventScroll: true });
      return;
    }
    // Nhóm mới: focus vào nhóm. Hết bài: nút vừa bấm có thể đã đổi, chuyển sang nút chính.
    (isComplete ? primaryButtonRef.current : groupStartRef.current ?? primaryButtonRef.current)?.focus({ preventScroll: true });
  }, [mode, visibleGroups, phase, isComplete]);

  // Xoay ngang / đổi cỡ cửa sổ làm chiều cao vùng cuộn đổi theo.
  useEffect(() => {
    const onResize = () => padFlow();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [padFlow]);

  /**
   * Ảnh/video của nhóm hiện tại tải xong thì chiều cao thật mới lộ ra: tính lại
   * đệm, và cuộn thêm nếu media đó là block cuối (phần dịch chuyển nằm ngay dưới
   * tầm mắt người học).
   */
  const handleMediaSettled = useCallback((reanchor: boolean) => {
    padFlow();
    if (reanchor && mode === 'learn' && visibleGroups > 1) reveal(groupStartRef.current);
  }, [padFlow, reveal, mode, visibleGroups]);

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

  // ---------------------------------------------------------------- Screen 1
  // Lấy cờ "tem bay" đúng một lần (effect chạy hai lần ở StrictMode).
  const handoffTakenRef = useRef(false);
  const [handoff, setHandoff] = useState<boolean | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (handoffTakenRef.current) return;
    handoffTakenRef.current = true;
    if (prefersReducedMotion()) {
      // Giảm chuyển động: bỏ Screen 1, vào thẳng trang học.
      setIntroShown(false);
      setPhase('ready');
      return;
    }
    const h = takeStampHandoff(pathname);
    if (h?.stampSrc) setStampSrc(h.stampSrc);
    setHandoff(!!h);
  }, [pathname]);

  // Chạy Screen 1 rồi trượt lên vào trang học (demo `toLearn` nửa nhận + `introThenFlow`).
  useIsomorphicLayoutEffect(() => {
    if (handoff === null) return;
    const intro = introRef.current;
    const stamp = stampRef.current;
    const name = nameRef.current;
    if (!intro || !stamp || !name) return;
    const anims: Animation[] = [];
    const tween = (el: Element, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      const a = el.animate(frames, { fill: 'both', ...opts });
      anims.push(a);
      return a;
    };

    let introAt: number;
    if (handoff) {
      // Trang câu chuyện để lại tem ở tâm màn, cạnh introStampSize(): vẽ ngay ở đó rồi
      // trượt về chỗ của nó trong Screen 1 (FLIP), trong lúc tên hiện dần.
      const r = stamp.getBoundingClientRect();
      const side = introStampSize(window.innerWidth);
      const dx = window.innerWidth / 2 - (r.left + r.width / 2);
      const dy = window.innerHeight / 2 - (r.top + r.height / 2);
      const sc = r.width ? side / r.width : 1;
      tween(
        stamp,
        [{ opacity: 1, transform: `translate(${dx}px, ${dy}px) scale(${sc})` }, { opacity: 1, transform: 'none' }],
        { duration: 720, easing: EASE_FLY },
      );
      introAt = 600;
    } else {
      tween(stamp, [{ opacity: 0, transform: 'translateY(24px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 800, easing: EASE_UP });
      introAt = 400;
    }
    tween(name, [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: introAt, easing: EASE_UP });
    // Tên hiện xong là đi tiếp, không đứng chờ.
    const leaveAt = introAt + 600;
    const up = tween(
      intro,
      [
        { opacity: 1, transform: 'translate(-50%, -50%)' },
        { opacity: 0, transform: 'translate(-50%, calc(-50% - 90px))' },
      ],
      { duration: 700, delay: leaveAt, easing: EASE_FLY },
    );
    // Screen 1 đi gần hết rồi khung học mới hiện, không chồng hình.
    const timer = window.setTimeout(() => setPhase('ready'), leaveAt + 650);
    up.finished.then(() => setIntroShown(false), () => {});
    return () => {
      window.clearTimeout(timer);
      anims.forEach((a) => a.cancel());
    };
  }, [handoff]);

  // Khung học hiện ra: thanh trên rơi xuống, nút dưới nổi lên.
  useIsomorphicLayoutEffect(() => {
    if (phase !== 'ready' || !introShown) return;
    if (prefersReducedMotion()) return;
    barRef.current?.animate(
      [{ opacity: 0, transform: 'translateY(-12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 600, easing: EASE_UP, fill: 'backwards' },
    );
    footerRef.current?.animate(
      [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
      { duration: 700, delay: 200, easing: EASE_UP, fill: 'backwards' },
    );
    // Chỉ một lần, lúc khung học vừa hiện (introShown vẫn true tới khi Screen 1 trượt xong).
  }, [phase]);

  // ---------------------------------------------------------------- thoát
  /** Trang học mờ đi (~0.3s) rồi mới điều hướng (demo `fromLearn`). */
  const leaveThen = useCallback((go: () => void) => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      go();
      return;
    }
    if (leavingRef.current) return;
    leavingRef.current = true;
    const a = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-in', fill: 'forwards' });
    a.finished.then(go, go);
    // Phòng khi điều hướng không xảy ra (cùng URL, lỗi mạng): hiện lại trang.
    window.setTimeout(() => {
      leavingRef.current = false;
      a.cancel();
    }, 4_000);
  }, []);

  const handleClose = () => {
    if (isNavigating) return;
    leaveThen(() => {
      // Vào bài học là `push`, nên thoát phải GỠ entry đó khỏi history. Trước đây
      // thoát cũng `push` — back một bước là rơi ngược vào chính bài vừa thoát.
      if (getPreviousPath() === exitHref) {
        goBack();
        return;
      }
      // Mở thẳng link bài học hoặc F5 giữa bài: không có gì để lùi. `replace` để
      // entry player biến mất thay vì bị đẩy xuống dưới.
      navigate(exitHref, { replace: true });
    });
  };

  // ---------------------------------------------------------------- câu hỏi
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

    if (mode === 'learn' && !questionStates[blockIndex]?.checked) {
      track({ name: 'question_answer', contentType, contentId, blockIndex, correct: isCorrect });
      // Đáp án đã chọn chỉ vào bộ đếm tổng: không mã, không ngày (có thể lộ quan điểm).
      const rawId = (blocks[blockIndex] as ContentBlock).id;
      const blockKey = rawId && /^[A-Za-z0-9_-]{1,64}$/.test(rawId) ? rawId : `i${blockIndex}`;
      for (const optionId of questionStates[blockIndex]?.selected ?? []) {
        if (/^[A-Za-z0-9_-]{1,64}$/.test(optionId)) tally({ metric: 'quiz_option', contentId, blockKey, optionId });
      }
    }

    // Ô giải thích vừa mở: cuộn lên vừa đủ cho nó nằm trên đường 75%.
    if (block.explanation) {
      setTimeout(() => {
        padFlow();
        reveal(explanationRef.current);
      }, 60);
    }
  };

  /** Kết thúc bài: lưu hoàn thành (trừ khi chỉ đang xem lại), rồi sang bài sau hoặc thoát. */
  const finish = (goNext: boolean) => {
    if (isNavigating) return;
    if (mode === 'learn' && !hasMarkedRef.current) {
      hasMarkedRef.current = true;
      setFinishedHere(true);
      markCompleted(contentType, contentId, points);
      analyticsRef.current.finished = true;
      track({ name: 'content_complete', contentType, contentId });
      tally({ metric: 'content_complete', contentType, contentId });
      // Bài cuối còn thiếu của khoá vừa xong (lần đầu): cộng một lượt "học xong cả khoá".
      const courseLessonIds = course?.levels.flatMap((l) => l.lessons.map((x) => x.id)) ?? [];
      if (
        course &&
        !wasCompleted &&
        courseLessonIds.length > 0 &&
        courseLessonIds.every((id) => id === contentId || isCompleted('lesson', id))
      ) {
        tally({ metric: 'course_complete', courseId: course.id });
      }
    }
    // `replace`: back từ bài sau đưa về trang khoá học, không lùi qua từng bài đã học.
    if (goNext && next) leaveThen(() => navigate(next.href, { replace: true }));
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
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const startRetake = () => {
    setChoice('learn');
    pendingFocusRef.current = 'top';
  };

  // Xem lại: vài khối đầu hiện nối đuôi, phần dưới đã sẵn.
  useIsomorphicLayoutEffect(() => {
    if (mode !== 'review' || phase !== 'ready') return;
    padFlow();
    const flow = flowRef.current;
    if (!flow) return;
    fadeIn(Array.from(flow.querySelectorAll<HTMLElement>('.pl__block')).slice(0, 6), 0, 70);
    footerRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: prefersReducedMotion() ? 0 : 400, easing: 'ease-out' });
  }, [mode, phase]);

  // Check every selected-but-unchecked question in the current group at once.
  const handleCheckGroup = () => {
    currentGroup.forEach((it) => {
      if (it.block.type === 'question' && questionStates[it.index]?.selected?.length && !questionStates[it.index]?.checked) {
        handleCheck(it.index);
      }
    });
  };

  // ---------------------------------------------------------------- chân trang
  // Gated on ALL question/interactive blocks in the current group.
  const groupQuestions = currentGroup.filter((it) => it.block.type === 'question');
  const groupInteractives = currentGroup.filter((it) => INTERACTIVE_BLOCK_TYPES.includes(it.block.type));
  const allSelected = groupQuestions.every((it) => (questionStates[it.index]?.selected?.length ?? 0) > 0);
  const allChecked = groupQuestions.every((it) => questionStates[it.index]?.checked);
  const allInteractiveDone = groupInteractives.every((it) => interactiveBlockCompleted[it.index]);
  const gate: 'select' | 'check' | 'activity' | null =
    groupQuestions.length > 0 && !allSelected
      ? 'select'
      : groupQuestions.length > 0 && !allChecked
      ? 'check'
      : groupInteractives.length > 0 && !allInteractiveDone
      ? 'activity'
      : null;

  // Tới nhóm cuối và không còn gì chặn = cuối bài (demo: khối cuối xong là hiện nút kết thúc).
  const atEnd = mode === 'review' || isComplete || (visibleGroups >= totalGroups && gate === null);

  const progress =
    mode === 'choose' ? 100 : Math.min((Math.min(visibleGroups, totalGroups) / Math.max(totalGroups, 1)) * 100, 100);

  // Đọc cho trình đọc màn hình mỗi lần mở thêm một phần. Lúc vào bài hay xem lại
  // thì chuỗi rỗng, nên không đọc gì.
  const revealAnnouncement =
    mode !== 'learn' || visibleGroups <= 1
      ? ''
      : isComplete || (visibleGroups >= totalGroups && gate === null)
      ? `Phần ${Math.min(visibleGroups, totalGroups)}/${totalGroups}. Đã hết ${noun}.`
      : `Phần ${visibleGroups}/${totalGroups}`;

  const busyLabel = (
    <>
      <Spinner size="sm" tone="onDark" />
      Đang lưu…
    </>
  );

  let footer: React.ReactNode;
  if (atEnd) {
    const backLabel = isLesson ? 'Về khoá học' : 'Về câu chuyện';
    if (next) {
      const goLabel = mode === 'review' ? 'Đi tiếp' : isLesson ? 'Học bài tiếp' : 'Đọc chương tiếp';
      footer = (
        <>
          {mode !== 'review' && (
            <p key="next" className="pl__next">
              <span>{isLesson ? 'Bài tiếp theo:' : 'Chương tiếp theo:'}</span>
              <span>{next.title}</span>
            </p>
          )}
          <div key="btns" className="pl__btns">
            <button
              key="ghost"
              type="button"
              onClick={() => finish(false)}
              aria-disabled={isNavigating || undefined}
              className="lbtn lbtn--ghost"
            >
              {backLabel}
            </button>
            <button
              key="primary"
              ref={primaryButtonRef}
              type="button"
              onClick={() => finish(true)}
              aria-disabled={isNavigating || undefined}
              aria-busy={isNavigating}
              className="lbtn"
            >
              {isNavigating ? busyLabel : (
                <>
                  {goLabel}
                  <IconArrow size={22} />
                </>
              )}
            </button>
          </div>
        </>
      );
    } else {
      // Bài/chương cuối (Figma 490-73381): một nút xanh.
      const doneLabel = mode === 'review' ? backLabel : isLesson ? 'Hoàn thành bài học' : 'Hoàn thành chương';
      footer = (
        <div key="btns" className="pl__btns">
          <button
            key="primary"
            ref={primaryButtonRef}
            type="button"
            onClick={() => finish(false)}
            aria-disabled={isNavigating || undefined}
            aria-busy={isNavigating}
            className={mode === 'review' ? 'lbtn' : 'lbtn lbtn--green'}
          >
            {isNavigating ? busyLabel : doneLabel}
          </button>
        </div>
      );
    }
  } else {
    const label =
      gate === 'select' ? 'Chọn đáp án' : gate === 'check' ? 'Kiểm tra' : gate === 'activity' ? 'Hoàn thành bài tập' : 'Tiếp tục';
    const off = gate === 'select' || gate === 'activity';
    const action = gate === 'check' ? handleCheckGroup : handleContinue;
    footer = (
      <div key="btns" className="pl__btns">
        <button
          key="primary"
          ref={primaryButtonRef}
          type="button"
          // aria-disabled thay cho disabled: nút bị khoá ngay sau khi bấm "Tiếp
          // tục" sẽ đẩy focus về <body>. Nút giữ focus, chỉ là bấm không làm gì.
          onClick={off || isNavigating ? undefined : action}
          aria-disabled={off || isNavigating || undefined}
          aria-busy={isNavigating}
          className={off ? 'lbtn lbtn--off' : 'lbtn'}
        >
          {isNavigating ? busyLabel : (
            <>
              {label}
              {gate === null && <IconArrow size={22} />}
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <PaperPlayerContext.Provider value={paperCtx}>
    <div
      ref={setRoot}
      className={`reader pl ${fraunces.variable} ${beVietnam.variable}`}
      data-phase={phase}
      style={(footHeight ? { '--foot': `${footHeight}px` } : undefined) as React.CSSProperties | undefined}
    >
      <ReferenceProvider slugs={refSlugs} enabled={references}>
      <TextSelectionPopover onSuggest={openSuggestEdit} />
      <ProgressDialog
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        noun={noun}
        title={title}
        sections={sections}
        stepsSeen={allRevealed || mode === 'choose' ? totalGroups : Math.min(visibleGroups, totalGroups)}
        stepsTotal={totalGroups}
        course={isLesson ? course : null}
        currentId={contentId}
        isCompleted={(id) => isCompleted('lesson', id) || (id === contentId && finishedHere)}
        onJump={jumpToBlock}
        returnFocusTo={() => progressBtnRef.current}
      />
      <SuggestEditDialog
        open={suggestQuote !== null}
        onClose={closeSuggest}
        contentType={contentType}
        allowTermType={references}
        contentId={contentId}
        title={title}
        initialQuote={suggestQuote ?? ''}
      />

      {/* Screen 1: tem + tên, không thanh trên. Trang trí: tên đọc qua h1 của luồng học. */}
      {introShown && (
        <div ref={introRef} className="pl__intro" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh trong public/, kích thước cố định */}
          <img ref={stampRef} className="pl__stamp pl__pre" src={stampSrc} alt="" width={210} height={210} />
          <p ref={nameRef} className="pl__name pl__serif pl__pre">{title}</p>
        </div>
      )}

      {/* Thanh trên: thoát, tiến độ, tuỳ chọn đọc, góp ý */}
      <header ref={barRef} className="pl__bar">
        <div className="pl__col pl__tools">
          <button
            type="button"
            onClick={handleClose}
            aria-disabled={isNavigating || undefined}
            aria-busy={isNavigating}
            className="pl__icon-btn"
            aria-label={isLesson ? 'Thoát bài học' : 'Thoát chương'}
          >
            {isNavigating ? <Spinner size="md" tone="muted" /> : <IconClose size={24} />}
          </button>
          <div
            className="pl__progress"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Tiến độ ${noun}: ${title}`}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="pl__icons">
            <button
              ref={progressBtnRef}
              type="button"
              onClick={() => setProgressOpen(true)}
              className="pl__icon-btn"
              aria-label="Xem tiến độ"
              aria-haspopup="dialog"
              aria-expanded={progressOpen}
              title="Tiến độ"
            >
              <ListChecks size={24} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <ReaderSettings
              buttonClassName="pl__icon-btn"
              icon={<IconAa size={28} />}
              defaultFontHint="Be Vietnam Pro"
            />
            <button
              type="button"
              onClick={() => openSuggestEdit('')}
              className="pl__icon-btn"
              aria-label={isLesson ? 'Góp ý chỉnh sửa bài học' : 'Góp ý chỉnh sửa chương'}
              title="Góp ý chỉnh sửa"
            >
              <IconNote size={24} />
            </button>
            {headerExtra}
          </div>
        </div>
      </header>

      {/* Luôn gắn sẵn, chỉ đổi chữ: vùng live mọc ra cùng nội dung thường bị bỏ qua. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{revealAnnouncement}</p>

      <main
        id="main-content"
        ref={scrollRef}
        className={`pl__scroll ${mode === 'choose' ? 'pl__scroll--free' : ''}`}
      >
        {mode === 'choose' ? (
          phase === 'ready' && (
            <RevisitChooser
              noun={noun}
              onReview={startReview}
              onRetake={startRetake}
            />
          )
        ) : (
          <div ref={flowRef} className="pl__col pl__flow">
            {/* Đúng một h1 mỗi màn (màn hỏi xem lại có h1 riêng). */}
            <h1 ref={headingRef} tabIndex={-1} className="sr-only">{title}</h1>
            {notices && <div className="pl__notices">{notices}</div>}
            {visible.map((group, gi) => {
              const isCurrent = gi === visibleGroups - 1;
              return (
                <div
                  key={group[0]?.index ?? gi}
                  className="pl__group"
                  // Nhóm mới chỉ nhận focus bằng script sau khi mở (không phải điểm Tab).
                  ref={isCurrent ? groupStartRef : undefined}
                  tabIndex={isCurrent ? -1 : undefined}
                >
                  {group.map(({ block, index }, pos) => (
                    <div key={index} className="pl__block" data-block-index={index}>
                      <BlockRenderer
                        block={block}
                        index={index}
                        questionState={questionStates[index]}
                        onSelectAnswer={handleSelect}
                        onInteractiveComplete={(idx) => {
                          if (mode === 'learn' && !interactiveBlockCompleted[idx]) {
                            track({ name: 'block_complete', contentType, contentId, blockIndex: idx, blockType: blocks[idx]?.type ?? 'unknown' });
                          }
                          setInteractiveBlockCompleted((prev) => ({ ...prev, [idx]: true }));
                        }}
                        isLastVisible={isCurrent && pos === group.length - 1}
                        explanationRef={explanationRef}
                        isCurrentBlock={isCurrent}
                        onMediaSettled={handleMediaSettled}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Chân trang — ẩn ở màn hỏi xem lại, vì hai lựa chọn đã nằm giữa màn hình. */}
      {mode !== 'choose' && (
        <footer ref={footerRef} className="pl__foot">
          <div className="pl__col">{footer}</div>
        </footer>
      )}
      </ReferenceProvider>
    </div>
    </PaperPlayerContext.Provider>
  );
}

/**
 * Màn hỏi khi người học mở lại bài đã hoàn thành (Figma 490-73629): xem lại toàn
 * bộ một lượt, hay học lại từ đầu như lần đầu. Bấm thẻ là vào luôn.
 */
function RevisitChooser({
  noun,
  onReview,
  onRetake,
}: {
  noun: string;
  onReview: () => void;
  onRetake: () => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const [picked, setPicked] = useState<'review' | 'reset' | null>(null);

  // Đưa focus vào lựa chọn đầu để người dùng bàn phím/trình đọc màn hình biết ngay;
  // đầu trang và hai thẻ hiện nối đuôi.
  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true });
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    root.querySelectorAll<HTMLElement>('.pl__choose-head, .lstudy').forEach((x, i) => {
      x.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 700, delay: i * 90, easing: EASE_RISE, fill: 'backwards' },
      );
    });
  }, []);

  const pick = (kind: 'review' | 'reset') => {
    if (picked) return;
    setPicked(kind);
    const go = kind === 'review' ? onReview : onRetake;
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      go();
      return;
    }
    window.setTimeout(() => {
      root
        .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' })
        .finished.then(go, go);
    }, 300);
  };

  return (
    <section ref={rootRef} aria-labelledby="revisit-title" className="pl__col pl__choose">
      <div className="pl__choose-head">
        <h1 id="revisit-title" className="pl__serif">
          Bạn đã hoàn thành {noun} này
        </h1>
        <p>Bạn muốn học lại theo cách nào?</p>
      </div>
      <div className="pl__opts">
        <button
          ref={firstRef}
          type="button"
          onClick={() => pick('review')}
          className={`lstudy lstudy--review ${picked === 'review' ? 'is-sel' : ''}`}
        >
          <IconReview size={28} />
          <span>
            <b>Xem lại toàn bộ {noun}</b>
            Hiện tất cả nội dung cùng lúc, câu hỏi kèm sẵn đáp án và lời giải.
          </span>
        </button>
        <button
          type="button"
          onClick={() => pick('reset')}
          className={`lstudy lstudy--reset ${picked === 'reset' ? 'is-sel' : ''}`}
        >
          <IconReset size={28} />
          <span>
            <b>Học lại từ đầu</b>
            Đi lại từng phần và tự trả lời câu hỏi như lần đầu.
          </span>
        </button>
      </div>
    </section>
  );
}

'use client';

import { memo, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import type { BookCharacter } from './book-data';
import { hasIntroPlayed, markIntroPlayed, setBookHandoff, takeBookHandoff } from './book-handoff';
import './story-book.css';

/**
 * Sổ tem nhân vật (note-cover, demo-course-stories màn 1–2).
 *
 * Port gần như nguyên văn phần carousel của demo: intro (sổ đóng → bìa lật sang
 * trái quanh gáy → tem chính rơi vào → 2 tem sau bung ra), xấp tem trước/trái/
 * phải, đường xếp bài lấy mẫu bezier, hàng đợi lượt bấm, tự chuyển 5s, vuốt/kéo,
 * chấm, nút trước/sau. Hằng số chuyển động giữ nguyên giá trị demo.
 *
 * React chỉ dựng markup ban đầu (đúng dáng cho nhân vật `initialIndex`, nên HTML
 * từ server đã đúng); sau đó mọi class/thuộc tính trạng thái do effect đổi trực
 * tiếp trên DOM như demo. Props của các phần tử đó không đổi giữa các lần render
 * nên React không ghi đè.
 *
 * - `mode="list"` (/courses): tem chính là link sang /story/<slug>, hover "TAP ĐỂ HỌC".
 * - `mode="story"` (/story/<slug>): không link, không hover; đổi nhân vật gọi
 *   onFront/onSwapOut/onSwapIn để trang đổi thẻ câu chuyện tại chỗ.
 *
 * Trợ năng: region + aria-roledescription="carousel"; chỉ tem chính đọc/bấm được
 * (tem khác `inert` + aria-hidden); vùng aria-live luôn gắn sẵn, chỉ báo khi người
 * xem tự đổi (không báo mỗi lượt tự chuyển); tự chuyển dừng khi rê chuột, khi tab
 * ẩn, dừng hẳn khi focus vào sổ hoặc người xem tự điều khiển, và có nút tạm dừng/
 * tiếp tục (WCAG 2.2.2). Giảm chuyển động: bỏ intro, đổi tem tức thì, không tự chuyển.
 */

// ---------- xấp tem: vị trí (khớp Figma, tâm tem so với tem chính) ----------
type Pose = 'front' | 'left' | 'right' | 'gone-left' | 'gone-right';
interface PoseValue {
  x: number;
  y: number;
  r: number;
  s: number;
  o: number;
}
const POSE: Record<Pose, PoseValue> = {
  front: { x: 0, y: 0, r: -2.23, s: 1, o: 1 },
  left: { x: -62.23, y: -14.06, r: -5.5, s: 0.833, o: 1 }, // tem sau 1 (Figma -5.5deg)
  right: { x: 61.77, y: 9.93, r: 2, s: 0.833, o: 1 }, // tem sau 2 (Figma 2deg)
  'gone-left': { x: -30, y: -8, r: -4, s: 0.76, o: 0 }, // ẩn sau tem chính
  'gone-right': { x: 30, y: 5, r: 1, s: 0.76, o: 0 },
};
const Z: Partial<Record<Pose, number>> = { front: 5, left: 2, right: 3 }; // quầng cam = 4; tem đang hiện/mờ dần = 1; tem đang lên trước = 6
const tf = (p: PoseValue) => `translate(${p.x}px,${p.y}px) rotate(${p.r}deg) scale(${p.s})`;
const kf = (p: PoseValue): Keyframe => ({ transform: tf(p), opacity: p.o });

// ---------- xếp bài ----------
const DUR = 1100;
const MID = 0.45; // lúc 2 tem đã kéo ra hai bên -> đổi thứ tự trên/dưới
const EASE_OUT = 'cubic-bezier(.45,0,.35,1)';
const EASE_IN = 'cubic-bezier(.4,0,.2,1)';
const RATE_RUSH = 2; // còn lượt chờ: chạy nhanh
const RATE_LAST = 1.35; // lượt cuối của chuỗi bấm: hơi nhanh rồi đậu
const STEPS = 32;

// ---------- mở sổ ----------
const OPEN_HOLD = 600;
const OPEN_DUR = 1600;
const OPEN_EASE = 'cubic-bezier(.6,0,.2,1)'; // nhấc bìa chậm, đậu xuống êm
const DROP_AT = 0.1;
const DROP = 1300;
const FAN_GAP = 50;
const FAN = 650;
const SLIDE = 575; // lùi ngược trục dọc của tem 575px: đáy tem vừa khuất trên mép sổ
const SLIDE_X = Math.sin((POSE.front.r * Math.PI) / 180) * SLIDE;
const SLIDE_Y = -Math.cos((POSE.front.r * Math.PI) / 180) * SLIDE;
const DROP_EASE = 'cubic-bezier(.2,.75,.25,1)';
const FAN_EASE = 'cubic-bezier(.3,.7,.2,1)';

// ---------- tự chuyển ----------
const AUTO_MS = 5000;

// ---------- chuyển màn listing -> câu chuyện ----------
const OUT_MS = 220;
export const GLIDE = 1100;
const GLIDE_EASE = 'cubic-bezier(.65,0,.15,1)';
/** expo-out: vào nhanh, đậu rất chậm (dùng cho phần nội dung nổi lên ở trang câu chuyện). */
export const RISE_EASE = 'cubic-bezier(.16,1,.3,1)';
/** Thời lượng thẻ câu chuyện mới hiện vào khi đổi nhân vật. */
export const SWAP_IN = 800;

export const storyHref = (slug: string) => `/story/${slug}`;

function bezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const bx = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t - x;
      const dx = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
      if (Math.abs(bx) < 1e-5 || !dx) break;
      t = Math.min(1, Math.max(0, t - bx / dx));
    }
    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  };
}
const easeOut = bezier(0.45, 0, 0.35, 1);
const easeIn = bezier(0.4, 0, 0.2, 1);
const easeAll = bezier(0.45, 0, 0.35, 1);

// đường đi 1 lượt, mỗi thuộc tính một nhịp riêng rồi lấy mẫu thành keyframe:
//  ngang + cỡ: kéo ra (tới MID) rồi trượt vào; dọc: trôi liền 1 mạch cả lượt (không khựng lúc đổi lớp);
//  góc: giữ nguyên tới MID, xoay trong nửa sau cùng nhịp trượt; hiện (o): xong trong nửa đầu
function path(A: PoseValue, P: { x: number; s: number; o: number }, B: PoseValue): Keyframe[] {
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const out: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const first = t <= MID;
    const u = first ? easeOut(t / MID) : easeIn((t - MID) / (1 - MID));
    const p: PoseValue = {
      x: first ? lerp(A.x, P.x, u) : lerp(P.x, B.x, u),
      s: first ? lerp(A.s, P.s, u) : lerp(P.s, B.s, u),
      o: first ? lerp(A.o, P.o, u) : lerp(P.o, B.o, u),
      r: first ? A.r : lerp(A.r, B.r, u),
      y: lerp(A.y, B.y, easeAll(t)),
    };
    out.push({ ...kf(p), offset: t });
  }
  return out;
}

/** Dáng ban đầu (cũng là dáng HTML từ server). 2 nhân vật: tem còn lại nằm bên phải. */
function initialPose(i: number, front: number, n: number): Pose {
  if (i === front) return 'front';
  if (n === 2) return 'right';
  if (i === (front - 1 + n) % n) return 'left';
  if (i === (front + 1) % n) return 'right';
  return 'gone-left';
}

const stampLabel = (c: BookCharacter) => `${c.name}, ${c.role} — xem câu chuyện`;

const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

export interface StoryBookProps {
  characters: BookCharacter[];
  mode: 'list' | 'story';
  initialIndex?: number;
  /** Nhân vật trước đổi (ngay khi bấm): trang câu chuyện đổi URL + tiêu đề. */
  onFront?: (index: number) => void;
  /** Thẻ câu chuyện cũ bắt đầu mờ đi. */
  onSwapOut?: () => void;
  /** Hiện thẻ của nhân vật `index`, đậu xong sau `endIn` ms (0 = tức thì). */
  onSwapIn?: (index: number, endIn: number) => void;
  /** Vừa tới từ /courses (sổ đang trượt): nội dung nổi lên sau `delay` ms. */
  onArrive?: (delay: number) => void;
}

interface BookApi {
  step: (delta: number) => void;
  goTo: (index: number) => void;
  toggleAuto: () => void;
}

function StoryBook({ characters, mode, initialIndex = 0, onFront, onSwapOut, onSwapIn, onArrive }: StoryBookProps) {
  const router = useRouter();
  const n = characters.length;
  const isList = mode === 'list';
  // Chỉ số ban đầu cố định cho cả vòng đời: markup đầu tiên dựa vào nó.
  const [start] = useState(() => Math.min(Math.max(0, initialIndex), Math.max(0, n - 1)));
  const [autoOn, setAutoOn] = useState(true);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );
  const canAuto = isList && n >= 2 && !reduced;

  const rootRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLImageElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const api = useRef<BookApi | null>(null);

  // Callback và router mới nhất, không làm effect chính chạy lại.
  const cbRef = useRef({ onFront, onSwapOut, onSwapIn, onArrive, router, characters });
  useEffect(() => {
    cbRef.current = { onFront, onSwapOut, onSwapIn, onArrive, router, characters };
  });

  useLayoutEffect(() => {
    const carousel = rootRef.current;
    const cover = coverRef.current;
    const frame = frameRef.current;
    const shadowEl = shadowRef.current;
    const live = liveRef.current;
    const book = bookRef.current;
    if (!carousel || !cover || !frame || !shadowEl || !live || !book || n === 0) return;
    const cards = cardRefs.current.slice(0, n) as HTMLElement[];
    const dots = dotRefs.current.slice(0, n);
    const cast = () => cbRef.current.characters;
    const reducedNow = window.matchMedia(reducedQuery).matches;
    const phone = window.matchMedia('(max-width:600px)'); // khớp @media điện thoại trong CSS

    // Dọn dẹp: mọi timer/raf/animation/listener đăng ký qua đây.
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };
    const clearLater = (id: number) => {
      window.clearTimeout(id);
      timers.delete(id);
    };
    const cleanups: Array<() => void> = [];
    const on = (
      el: HTMLElement | Document | Window,
      type: string,
      fn: (e: never) => void,
      opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn as EventListener, opts);
      cleanups.push(() => el.removeEventListener(type, fn as EventListener, opts));
    };

    let current = start;
    let pairSide: 'left' | 'right' = 'right'; // chỉ dùng khi có đúng 2 nhân vật

    // ---------- co giãn cover theo bề ngang ----------
    function fit() {
      const w = cover!.clientWidth;
      let k = Math.min(1, w / 857);
      if (w < 600) k = Math.min(1, w / 430); // điện thoại: giữ tem đủ to, cắt bớt hai mép nền
      // Trang nhân vật trên điện thoại: sổ chỉ cao ~36% màn hình để danh sách câu
      // chuyện hiện ngay bên dưới (tem bớt chữ, xem .sb-carousel--story trong CSS).
      if (!isList && w < 600) k = Math.min(k, (window.innerHeight * 0.36) / 583);
      carousel!.style.setProperty('--k', k.toFixed(4));
    }
    fit();
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(fit);
      ro.observe(cover);
      cleanups.push(() => ro.disconnect());
    }
    on(window, 'resize', fit);

    const neighbour = (i: number, d: number) => (i + d + n) % n;
    function poseOf(i: number, front: number): Pose | null {
      if (i === front) return 'front';
      if (n === 2) return pairSide;
      if (i === neighbour(front, -1)) return 'left';
      if (i === neighbour(front, 1)) return 'right';
      return null;
    }

    function setPose(el: HTMLElement, pose: Pose) {
      el.dataset.pose = pose;
      el.classList.remove('is-front', 'is-left', 'is-right');
      if (Z[pose]) el.classList.add(`is-${pose}`);
      el.style.setProperty('--pose', tf(POSE[pose]));
      const front = pose === 'front';
      const c = cast()[Number(el.dataset.index)];
      el.inert = !front;
      if (front) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', 'true');
      if (isList) {
        if (front) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
        if (front && c) el.setAttribute('aria-label', stampLabel(c));
        else el.removeAttribute('aria-label');
      }
    }
    function layout(front: number) {
      cards.forEach((el, i) => {
        const p = poseOf(i, front);
        const prev = el.dataset.pose;
        setPose(el, p ?? (prev && prev.startsWith('gone') ? (prev as Pose) : 'gone-left'));
      });
    }

    function paintMeta(i: number, announce: boolean) {
      dots.forEach((b, j) => b?.setAttribute('aria-current', j === i ? 'true' : 'false'));
      const c = cast()[i];
      if (announce && c) live!.textContent = `Nhân vật ${i + 1}/${n}: ${c.name} — ${c.role}`;
      if (isList && c) cbRef.current.router.prefetch(storyHref(c.slug));
    }

    // ---------- xếp bài: tem chính lùi về một bên ra sau, tem sau trượt lên trước ----------
    let running: Animation[] = [];
    let queue: Array<{ delta?: number; index?: number; announce: boolean }> = [];
    let rate = 1;
    let rampRaf = 0;

    // đổi tốc độ dần trong ~180ms, không giật vận tốc
    function rampTo(target: number) {
      cancelAnimationFrame(rampRaf);
      const from = rate;
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / 180);
        rate = from + (target - from) * k;
        running.forEach((an) => an.updatePlaybackRate(rate));
        if (k < 1) rampRaf = requestAnimationFrame(tick);
      };
      tick(t0);
    }

    function settle() {
      cancelAnimationFrame(rampRaf);
      queue = [];
      const list = running;
      running = [];
      list.forEach((an) => {
        try {
          an.finish();
        } catch {
          /* animation vô hạn / đã huỷ */
        }
      });
      cards.forEach((el) => {
        el.classList.remove('is-moving');
        el.style.zIndex = '';
      });
    }

    // z-index nhảy đúng lúc MID theo thời gian của chính animation (tăng tốc vẫn khớp)
    function zSwap(el: HTMLElement, z0: number, z1: number) {
      return el.animate(
        [
          { zIndex: z0, offset: 0, easing: 'step-end' },
          { zIndex: z1, offset: MID },
          { zIndex: z1, offset: 1 },
        ],
        { duration: DUR },
      );
    }

    // tem vừa đậu: giữ đúng vị trí rồi để transition đưa sang trạng thái hover (nếu chuột đang nằm trên), không giật
    function release(el: HTMLElement) {
      el.style.transform = 'var(--pose)';
      el.getBoundingClientRect();
      el.classList.remove('is-moving');
      requestAnimationFrame(() => {
        el.style.transform = '';
      });
    }

    function shuffle(from: number, to: number, dir: number, r: number) {
      const before = cards.map((el) => el.dataset.pose as Pose);
      let side: 'left' | 'right' = dir > 0 ? 'right' : 'left'; // tem đi lên lấy từ phía này
      if (n === 2) {
        // 2 nhân vật: tem kia nằm sẵn một bên -> lên từ bên đó, tem chính lùi về bên còn lại
        side = before[to] === 'left' ? 'left' : 'right';
        pairSide = side === 'right' ? 'left' : 'right';
      }
      const sg = side === 'right' ? 1 : -1;
      layout(to);

      const list: Animation[] = [];
      const cardAnims: HTMLElement[] = [];
      cards.forEach((el, k) => {
        const b = before[k];
        const a = el.dataset.pose as Pose;
        const bVis = !!Z[b];
        const aVis = !!Z[a];
        let frames: Keyframe[] | null = null;
        let opts: KeyframeAnimationOptions = { duration: DUR, easing: 'linear' };

        if (k === to) {
          // tem đi lên: giữ góc tem phụ lúc kéo ra, chỉ xoay về góc tem chính trong lúc trượt vào giữa
          const startPose = b === side ? POSE[side] : { ...POSE[side], o: 0 };
          frames = path(startPose, { x: sg * 130, s: 0.9, o: 1 }, POSE.front);
          list.push(zSwap(el, bVis ? Z[b]! : 1, 6));
        } else if (k === from) {
          // tem chính lùi ra sau: giữ góc tem chính lúc kéo ra, xoay dần sang góc tem phụ khi lùi về chỗ.
          frames = path(POSE.front, { x: -sg * 188, s: 0.82, o: 1 }, POSE[a]);
          list.push(zSwap(el, 5, Z[a] || 2)); // nhảy xa: vẫn nằm trên các tem đang hiện dần
        } else if (bVis && !aVis) {
          // tem sau rời xấp: mờ dần ra phía sau
          frames = [kf(POSE[b]), kf(POSE[`gone-${b}` as Pose])];
          opts = { duration: DUR * 0.55, easing: EASE_OUT };
          el.style.zIndex = '1';
        } else if (!bVis && aVis) {
          // tem sau mới: hiện dần từ phía sau
          frames = [kf(POSE[`gone-${a}` as Pose]), kf(POSE[a])];
          opts = { duration: DUR * 0.65, delay: DUR * 0.35, easing: EASE_IN, fill: 'backwards' };
          el.style.zIndex = '1';
        } else if (b !== a && bVis && aVis) {
          // nhảy xa: tem sau đổi bên -> mờ đi bên cũ, hiện lại bên mới (không lướt ngang qua tem chính)
          frames = [
            { ...kf(POSE[b]), offset: 0, easing: EASE_OUT },
            { ...kf(POSE[`gone-${b}` as Pose]), offset: 0.4 },
            { ...kf(POSE[`gone-${a}` as Pose]), offset: 0.41, easing: EASE_IN },
            { ...kf(POSE[a]), offset: 1 },
          ];
          el.style.zIndex = '1';
        }
        if (!frames) return;
        el.classList.add('is-moving');
        list.push(el.animate(frames, opts));
        cardAnims.push(el);
      });
      // quầng cam (hard light) nhạt đi lúc 2 tem tách ra, để tem đổi lớp trên/dưới quầng không bị đổi màu đột ngột
      list.push(
        shadowEl!.animate(
          [
            { opacity: 1, offset: 0, easing: EASE_OUT },
            { opacity: 0, offset: MID, easing: EASE_IN },
            { opacity: 1, offset: 1 },
          ],
          { duration: DUR },
        ),
      );

      rate = r;
      list.forEach((an) => {
        an.playbackRate = r;
      });
      running = list;

      Promise.all(list.map((an) => an.finished)).then(
        () => {
          if (running !== list) return; // đã bị settle() giữa chừng
          running = [];
          cardAnims.forEach((el) => {
            el.style.zIndex = '';
            release(el);
          });
          next();
        },
        () => {},
      );
    }

    // ---------- chọn nhân vật ----------
    // dir: 1 = tới (tem phải lên trước), -1 = lùi; chấm tròn thì theo thứ tự trong danh sách
    function select(key: number, animate: boolean, dir: number, r: number, announce: boolean) {
      if (key === current || key < 0 || key >= n) return;
      const from = current;
      current = key;
      if (!dir) dir = key > from ? 1 : -1;
      paintMeta(key, announce);
      cbRef.current.onFront?.(key);
      const anim = animate && !reducedNow;
      if (anim) shuffle(from, key, dir, r || 1);
      else {
        settle();
        if (n === 2) pairSide = cards[key].dataset.pose === 'left' ? 'right' : 'left';
        layout(key);
      }
      if (isList) return;
      if (!anim) {
        cbRef.current.onSwapIn?.(key, 0);
        return;
      }
      cbRef.current.onSwapOut?.();
      if (!queue.length) cbRef.current.onSwapIn?.(key, DUR / (r || 1)); // còn lượt chờ: giữ mờ, chỉ hiện nhân vật cuối
    }

    // bấm trong lúc đang xếp: lượt đang chạy tăng tốc chạy nốt, rồi chạy tiếp các lượt chờ (tối đa 3)
    let transit = false;
    function enqueue(job: { delta?: number; index?: number; announce: boolean }) {
      if (intro !== 'done' || transit || n < 2) return; // sổ chưa mở xong / đang chuyển màn
      if (!running.length) {
        run(job, 1);
        return;
      }
      if (job.index !== undefined) queue = [job]; // chấm tròn: thay hết các lượt chờ, lấy lần bấm sau cùng
      else if (queue.length < 3) queue.push(job);
      if (!isList) cbRef.current.onSwapOut?.(); // câu chuyện chỉ hiện cho nhân vật cuối
      rampTo(RATE_RUSH);
    }
    function next() {
      const job = queue.shift();
      if (job) run(job, queue.length ? RATE_RUSH : RATE_LAST);
    }
    function run(job: { delta?: number; index?: number; announce: boolean }, r: number) {
      if (job.index !== undefined) select(job.index, true, 0, r, job.announce);
      else select(neighbour(current, job.delta ?? 1), true, job.delta ?? 1, r, job.announce);
      if (!running.length) next(); // lượt chờ trùng nhân vật hiện tại -> bỏ qua
    }
    const step = (delta: number, announce = true) => enqueue({ delta, announce });

    // ---------- mở sổ (1 lần mỗi lần tải trang, ở listing, khi cover lọt vào màn hình) ----------
    let intro: 'closed' | 'opening' | 'done' = 'closed';
    let clipRaf = 0;
    const dropWait: { book?: boolean; stamp?: boolean } = {};

    function startIntro() {
      if (intro !== 'closed') return;
      intro = 'opening';
      markIntroPlayed();
      later(openBook, OPEN_HOLD);
    }
    function openBook() {
      const t: KeyframeAnimationOptions = { duration: OPEN_DUR, easing: OPEN_EASE, fill: 'forwards' };
      const leaf = book!.querySelector<HTMLElement>('.sb-book__leaf')!;
      const shades = Array.from(book!.querySelectorAll<HTMLElement>('.sb-book__shade'));
      if (!phone.matches) book!.animate([{ transform: 'translateX(-214.25px)' }, { transform: 'none' }], t);
      book!.querySelector<HTMLElement>('.sb-book__pshadow')!.animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 1 }], t);
      shades[0].animate([{ opacity: 0 }, { opacity: 0.3, offset: 0.5 }, { opacity: 0.3 }], t);
      shades[1].animate([{ opacity: 0.3 }, { opacity: 0.3, offset: 0.5 }, { opacity: 0 }], t);
      leaf.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }], t).onfinish = () => {
        // trang đôi trùng khít cover thật -> đổi sang cover thật rồi đặt tem
        carousel!.classList.remove('is-closed');
        book!.hidden = true;
        book!.getAnimations({ subtree: true }).forEach((an) => an.cancel());
        dropDone('book');
      };
      later(placeStamps, OPEN_DUR * DROP_AT); // gối đầu: bìa mới lật ~10% là tem bắt đầu trượt xuống
    }

    // mép trái phần trang tem được hiện (toạ độ cover): bìa chưa qua 90deg -> mép ngoài của bìa (tem nằm dưới bìa);
    // qua rồi -> mép bìa đang hạ xuống bên trái (tem nằm trên mặt trong bìa)
    function bookLeft() {
      if (book!.hidden) return 0;
      const fr = frame!.getBoundingClientRect();
      const k = fr.width / 857;
      const bookX = new DOMMatrixReadOnly(getComputedStyle(book!).transform).m41;
      const spine = 428.5 + bookX;
      const ff = book!.querySelector('.sb-book__face--front')!.getBoundingClientRect();
      const bf = book!.querySelector('.sb-book__face--back')!.getBoundingClientRect();
      const ffRight = (ff.right - fr.left) / k;
      return ffRight > spine + 0.5 ? ffRight : Math.min(spine, (bf.left - fr.left) / k);
    }
    // cắt phần tử theo vùng sổ (X0..857, 0..583): đổi 4 góc sang toạ độ riêng của phần tử theo transform hiện tại
    function clipToBook(el: HTMLElement, X0: number, L: number, T: number, W: number, H: number) {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform).inverse();
      const cx = L + W / 2;
      const cy = T + H / 2;
      el.style.clipPath =
        'polygon(' +
        [
          [X0, 0],
          [857, 0],
          [857, 583],
          [X0, 583],
        ]
          .map((q) => {
            const pt = m.transformPoint({ x: q[0] - cx, y: q[1] - cy });
            return `${(pt.x + W / 2).toFixed(1)}px ${(pt.y + H / 2).toFixed(1)}px`;
          })
          .join(',') +
        ')';
    }

    // tem chính chỉ về lớp bình thường (dưới sổ) khi cả tem đã đậu lẫn bìa đã lật xong, không thì bị sổ che mất 1 nhịp
    function dropDone(what: 'book' | 'stamp') {
      dropWait[what] = true;
      if (dropWait.book && dropWait.stamp) carousel!.classList.remove('is-dropping');
    }

    // tem chính slide in thẳng từ trên xuống theo đúng trục nghiêng của tem; chỉ hiện phần nằm trên trang sổ
    // và không bị bìa che. Quầng cam, chấm tròn, mũi tên hiện cùng lúc 2 tem phụ bung ra.
    function placeStamps() {
      const list: Array<[HTMLElement, Animation]> = [];
      const front = cards[current];
      const F = POSE.front;
      // tem phụ chỉ bung khi tem chính đã đậu VÀ bìa đã lật xong (tem có thể đậu trước khi bìa xong)
      const fanAt = Math.max(DROP, OPEN_DUR * (1 - DROP_AT)) + FAN_GAP;
      front.classList.add('is-moving');
      carousel!.classList.add('is-dropping');
      // xuất phát: nằm hẳn trên mép sổ, đúng góc cuối -> đi thẳng xuống dọc trục tem vào chỗ
      list.push([
        front,
        front.animate([kf({ ...F, x: SLIDE_X, y: SLIDE_Y }), kf(F)], { duration: DROP, easing: DROP_EASE, fill: 'backwards' }),
      ]);
      const tick = () => {
        clipToBook(front, bookLeft(), 259.6, 37.85, 350, 508);
        clipRaf = requestAnimationFrame(tick);
      };
      tick();
      // tem phụ nấp kín sau tem chính (cùng tâm, cùng góc, nhỏ hơn), ẩn tới lúc tem chính đậu xong
      cards.forEach((el) => {
        const pose = el.dataset.pose as Pose;
        if (pose !== 'left' && pose !== 'right') return;
        const to = POSE[pose];
        const hid = { ...F, s: to.s, o: 0 };
        el.classList.add('is-moving');
        list.push([
          el,
          el.animate([kf(hid), { opacity: 1, offset: 0.08 }, kf(to)], {
            duration: FAN,
            delay: fanAt + (pose === 'right' ? 60 : 0),
            easing: FAN_EASE,
            fill: 'backwards',
          }),
        ]);
      });
      later(() => {
        // tem đã chạm giấy: thôi cắt; về lớp bình thường khi sổ cũng đã đổi sang cover thật
        cancelAnimationFrame(clipRaf);
        front.style.clipPath = '';
        dropDone('stamp');
      }, DROP);
      // quầng cam hiện dần tại chỗ, cùng nhịp 2 tem phụ bung ra
      shadowEl!.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FAN, delay: fanAt, easing: 'ease-out', fill: 'backwards' });
      // chấm tròn + mũi tên hiện cùng lúc (transition .45s trong CSS)
      later(() => carousel!.classList.remove('is-intro'), fanAt);
      Promise.all(list.map((x) => x[1].finished)).then(
        () => {
          list.forEach((x) => release(x[0]));
          intro = 'done';
          play();
        },
        () => {},
      );
    }

    // dự phòng cho IntersectionObserver (lần báo đầu có thể đo cover = 0 lúc trang chưa dàn xong)
    function checkIntro() {
      if (intro !== 'closed') return;
      const r = cover!.getBoundingClientRect();
      const seen = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (r.height && seen >= r.height * 0.35) {
        visible = true;
        startIntro();
      }
    }

    // vào thẳng (trang câu chuyện, lần thứ hai về listing, giảm chuyển động): sổ mở sẵn
    function skipIntro() {
      if (intro === 'done') return;
      intro = 'done';
      book!.hidden = true;
      carousel!.classList.remove('is-closed', 'is-intro');
      if (isList) markIntroPlayed();
    }

    // ---------- auto slide (chỉ ở listing) ----------
    const autoEnabled = isList && n >= 2 && !reducedNow;
    let autoTimer: number | null = null;
    let remain = AUTO_MS;
    let startedAt = 0;
    let stopped = !autoEnabled; // người xem đã tự điều khiển -> ngừng hẳn
    let hovered = false;
    let visible = false;

    function arm(ms: number) {
      if (autoTimer !== null) clearLater(autoTimer);
      remain = ms;
      startedAt = Date.now();
      autoTimer = later(() => {
        autoTimer = null;
        step(1, false);
        arm(AUTO_MS);
      }, ms);
    }
    function play() {
      if (intro !== 'done' || stopped || !visible || hovered || autoTimer !== null || document.hidden) return;
      arm(remain > 0 ? remain : AUTO_MS);
    }
    function pause() {
      if (autoTimer === null) return;
      clearLater(autoTimer);
      autoTimer = null;
      remain = Math.max(0, remain - (Date.now() - startedAt));
    }
    function stop() {
      if (autoTimer !== null) clearLater(autoTimer);
      autoTimer = null;
      if (stopped) return;
      stopped = true;
      if (autoEnabled) setAutoOn(false);
    }
    function resume() {
      if (!autoEnabled) return;
      stopped = false;
      remain = AUTO_MS;
      setAutoOn(true);
      play();
    }

    on(carousel, 'mouseenter', () => {
      hovered = true;
      pause();
    });
    on(carousel, 'mouseleave', () => {
      hovered = false;
      play();
    });
    // Focus vào sổ (bàn phím, trình đọc màn hình) dừng hẳn, như mẫu carousel của WAI-ARIA;
    // riêng nút tạm dừng/tiếp tục không tính, để bấm "tiếp tục" có tác dụng.
    on(carousel, 'focusin', (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('[data-book-auto]')) return;
      stop();
    });
    on(document, 'visibilitychange', () => {
      if (document.hidden) pause();
      else play();
    });

    if (!isList || reducedNow || hasIntroPlayed()) {
      skipIntro();
      visible = true;
    }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
          if (visible) {
            startIntro();
            play();
          } else pause();
        },
        { threshold: 0.35 },
      );
      io.observe(cover);
      cleanups.push(() => io.disconnect());
    } else {
      visible = true;
      later(startIntro, 0);
    }
    if (intro === 'closed') {
      on(window, 'scroll', checkIntro, { passive: true });
      on(window, 'load', checkIntro);
    }
    paintMeta(current, false);
    play();

    // ---------- điều khiển của người xem ----------
    api.current = {
      step: (delta) => {
        stop();
        step(delta);
      },
      goTo: (index) => {
        stop();
        enqueue({ index, announce: true });
      },
      toggleAuto: () => {
        if (stopped) resume();
        else stop();
      },
    };

    on(document, 'keydown', (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || n < 2) return;
      const t = e.target as HTMLElement | null;
      const inside = !!t && carousel!.contains(t);
      if (!inside) {
        // ngoài sổ: chỉ khi không có gì đang giữ focus (body) và sổ đang nằm trong màn hình
        if (t && t !== document.body && t !== document.documentElement) return;
        const r = cover!.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
      }
      e.preventDefault();
      stop();
      step(e.key === 'ArrowRight' ? 1 : -1);
    });

    // vuốt / kéo ngang trên cover (chuột: chỉ nút chính)
    let sx = 0;
    let sy = 0;
    let tracking = false;
    let swiped = false;
    const endDrag = () => {
      tracking = false;
      delete cover!.dataset.dragging;
    };
    on(cover, 'pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      tracking = true;
      swiped = false;
      sx = e.clientX;
      sy = e.clientY;
    });
    on(cover, 'pointermove', (e: PointerEvent) => {
      if (!tracking) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - sy)) cover!.dataset.dragging = 'true';
    });
    on(cover, 'pointerup', (e: PointerEvent) => {
      if (!tracking) return;
      endDrag();
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        stop();
        step(dx < 0 ? 1 : -1);
      }
    });
    on(cover, 'pointercancel', endDrag);
    on(cover, 'pointerleave', (e: PointerEvent) => {
      if (e.pointerType === 'mouse') endDrag();
    });

    // ---------- chuyển màn listing -> câu chuyện ----------
    const fades: Animation[] = [];
    // các phần còn lại của trang (mọi anh em trên đường từ sổ lên <main>) mờ đi, sổ đứng yên
    function listParts(): Element[] {
      const parts: Element[] = [];
      let node: Element | null = carousel;
      while (node && node.parentElement && node.tagName !== 'MAIN') {
        for (const sib of Array.from(node.parentElement.children)) if (sib !== node) parts.push(sib);
        node = node.parentElement;
      }
      return parts;
    }
    function toStory(i: number) {
      const c = cast()[i];
      if (!c) return;
      const href = storyHref(c.slug);
      transit = true;
      pause();
      if (reducedNow) {
        cbRef.current.router.push(href);
        return;
      }
      const r = cover!.getBoundingClientRect();
      const frontTransform = getComputedStyle(cards[i]).transform; // dáng hover ngay trước khi đổi màn
      listParts().forEach((el) => {
        fades.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT_MS, easing: 'ease-in', fill: 'forwards' }));
      });
      later(() => {
        setBookHandoff({
          href,
          rect: { left: r.left, top: r.top, width: r.width, height: r.height },
          frontTransform,
        });
        cbRef.current.router.push(href);
      }, OUT_MS);
    }

    // tap vào tem chính ở listing -> sang trang câu chuyện
    on(frame, 'click', (e: MouseEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('.sb-stamp');
      if (!card) return;
      if (!isList || transit || swiped || Number(card.dataset.index) !== current) {
        e.preventDefault();
        swiped = false;
        return;
      }
      stop();
      // mở tab mới / tải xuống: để trình duyệt tự xử lý
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      toStory(current);
    });

    // ---------- vừa tới từ listing: sổ trượt từ chỗ cũ sang chỗ mới ----------
    if (!isList) {
      const h = takeBookHandoff(window.location.pathname);
      if (h && !reducedNow) {
        const to = cover.getBoundingClientRect();
        const car = carousel.getBoundingClientRect();
        const sc = h.rect.width / to.width;
        // gốc co = mép trên giữa của cover (trong toạ độ carousel)
        const ox = to.left + to.width / 2 - car.left;
        const oy = to.top - car.top;
        const dx = h.rect.left + h.rect.width / 2 - (to.left + to.width / 2);
        const dy = h.rect.top - to.top;
        if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1 || Math.abs(sc - 1) >= 0.005) {
          fades.push(
            carousel.animate(
              [
                { transformOrigin: `${ox}px ${oy}px`, transform: `translate(${dx}px,${dy}px) scale(${sc})` },
                { transformOrigin: `${ox}px ${oy}px`, transform: 'none' },
              ],
              { duration: GLIDE, easing: GLIDE_EASE },
            ),
          );
        }
        // tem chính đang ở dáng hover (thẳng, nâng lên) lúc tap -> về dáng mặc định cùng nhịp sổ trượt, không giật
        const front = cards[current];
        if (h.frontTransform && h.frontTransform !== 'none') {
          front.classList.add('is-moving');
          const an = front.animate([{ transform: h.frontTransform }, { transform: tf(POSE.front) }], {
            duration: GLIDE,
            easing: GLIDE_EASE,
          });
          fades.push(an);
          an.finished.then(
            () => front.classList.remove('is-moving'),
            () => front.classList.remove('is-moving'),
          );
        }
        cbRef.current.onArrive?.(GLIDE * 0.55);
      }
    }

    return () => {
      api.current = null;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      cancelAnimationFrame(rampRaf);
      cancelAnimationFrame(clipRaf);
      running.forEach((an) => an.cancel());
      fades.forEach((an) => an.cancel());
      cleanups.forEach((fn) => fn());
    };
  }, [n, isList, start]);

  if (n === 0) return null;

  return (
    <div
      ref={rootRef}
      className={`sb-carousel${isList ? ' is-closed is-intro' : ' sb-carousel--story'}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Các nhân vật"
    >
      {/* Không có JS: không mở được sổ bằng animation → hiện sẵn trang đôi và tem. */}
      {isList && (
        <noscript>
          <style>{'.sb-carousel.is-closed .sb-cover__bg,.sb-carousel.is-closed .sb-stamp{visibility:visible}.sb-book{display:none}'}</style>
        </noscript>
      )}
      <div ref={coverRef} className={`sb-cover${isList ? '' : ' is-story'}`}>
        <div ref={frameRef} className="sb-cover__frame">
          {/* eslint-disable-next-line @next/next/no-img-element -- nền sổ cố định, co bằng transform cùng khung */}
          <img className="sb-cover__bg" src="/paper/cover.webp" alt="" width={857} height={583} draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element -- quầng sáng trang trí (mix-blend) */}
          <img ref={shadowRef} className="sb-cover__shadow" src="/paper/stamp-shadow.webp" alt="" draggable={false} />
          <div ref={bookRef} className="sb-book" aria-hidden="true" hidden={!isList}>
            <div className="sb-book__pshadow" />
            <div className="sb-book__page" />
            <div className="sb-book__leaf">
              <div className="sb-book__face sb-book__face--front">
                {/* eslint-disable-next-line @next/next/no-img-element -- bìa sổ đóng, chỉ dùng cho intro */}
                <img src="/paper/book-closed.webp" alt="" draggable={false} />
                <i className="sb-book__shade" />
              </div>
              <div className="sb-book__face sb-book__face--back">
                <i className="sb-book__shade" />
              </div>
            </div>
          </div>

          {characters.map((c, i) => {
            const pose = initialPose(i, start, n);
            const front = pose === 'front';
            const cls = `sb-stamp${Z[pose] ? ` is-${pose}` : ''}`;
            const style = { '--pose': tf(POSE[pose]) } as CSSProperties;
            const face = <StampFace c={c} />;
            return isList ? (
              <a
                key={c.slug}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={cls}
                data-index={i}
                data-pose={pose}
                href={storyHref(c.slug)}
                style={style}
                tabIndex={front ? undefined : -1}
                aria-hidden={front ? undefined : true}
                aria-label={front ? stampLabel(c) : undefined}
                inert={!front}
                draggable={false}
              >
                {face}
              </a>
            ) : (
              <div
                key={c.slug}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={cls}
                data-index={i}
                data-pose={pose}
                style={style}
                aria-hidden={front ? undefined : true}
                inert={!front}
              >
                {face}
              </div>
            );
          })}

          {n > 1 && (
            <div className="sb-dots" role="group" aria-label="Chọn nhân vật">
              {characters.map((c, i) => (
                <button
                  key={c.slug}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  type="button"
                  aria-label={c.name}
                  aria-current={i === start ? 'true' : 'false'}
                  onClick={() => api.current?.goTo(i)}
                />
              ))}
            </div>
          )}
          <span ref={liveRef} className="sb-vh" aria-live="polite" />
        </div>
      </div>

      {n > 1 && (
        <div className="sb-carousel__nav">
          <button
            className="sb-navbtn sb-navbtn--prev"
            type="button"
            aria-label="Nhân vật trước"
            onClick={() => api.current?.step(-1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh */}
            <img src="/paper/icon-arrow.svg" alt="" width={36} height={36} />
          </button>
          {canAuto && (
            <button
              className="sb-navbtn sb-navbtn--pause"
              type="button"
              data-book-auto
              aria-label={autoOn ? 'Tạm dừng tự chuyển nhân vật' : 'Tiếp tục tự chuyển nhân vật'}
              onClick={() => api.current?.toggleAuto()}
            >
              {autoOn ? (
                <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                  <rect x="2.5" y="1.5" width="3" height="11" rx="1" fill="currentColor" />
                  <rect x="8.5" y="1.5" width="3" height="11" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                  <path d="M4 1.8v10.4a.8.8 0 0 0 1.2.7l8-5.2a.8.8 0 0 0 0-1.4l-8-5.2A.8.8 0 0 0 4 1.8Z" fill="currentColor" />
                </svg>
              )}
            </button>
          )}
          <button
            className="sb-navbtn sb-navbtn--next"
            type="button"
            aria-label="Nhân vật tiếp theo"
            onClick={() => api.current?.step(1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh */}
            <img src="/paper/icon-arrow.svg" alt="" width={36} height={36} />
          </button>
        </div>
      )}
    </div>
  );
}

function StampFace({ c }: { c: BookCharacter }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- khung tem trang trí */}
      <img className="sb-stamp__shell" src="/paper/stamp-back.webp" alt="" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element -- khung tem có bóng cho vị trí trước */}
      <img className="sb-stamp__shell sb-stamp__shell--front" src="/paper/stamp-front.webp" alt="" draggable={false} />
      <span className="sb-stamp__photo">
        {c.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh tem từ Supabase Storage (đã qua isAllowedMediaUrl)
          <img src={c.photo} alt={c.name} draggable={false} />
        ) : (
          <span className="sb-stamp__blank paper-serif" role="img" aria-label={c.name}>
            {c.name.charAt(0)}
          </span>
        )}
        <span className="sb-stamp__tap" aria-hidden="true">
          TAP ĐỂ HỌC
        </span>
      </span>
      <span className="sb-stamp__text">
        <span>
          <span className="sb-stamp__name paper-serif">{c.name}</span>
          <span className="sb-stamp__role">{c.role}</span>
        </span>
        {c.quote && <span className="sb-stamp__quote">{c.quote}</span>}
      </span>
    </>
  );
}

export default memo(StoryBook);

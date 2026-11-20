'use client';

/**
 * Trang chi tiết câu chuyện: kệ folder các chương (demo-course-stories, màn 3).
 *
 * Server render toàn bộ dữ liệu chương (giống nhau cho mọi người: trang được cache
 * công khai). Trạng thái từng folder (Học ngay / Nhảy cóc / Hoàn thành) chỉ tính ở
 * client sau khi mount, từ tiến độ trong localStorage (`useProgress`, khoá theo id
 * chương như player). Kệ chạy bằng `ShelfRunner` (rAF), vẽ thẳng vào style của từng
 * folder, không qua React mỗi khung hình.
 *
 * Vào học: header + nội dung mờ đi, tem rút khỏi túi folder, trượt về giữa màn, xoay
 * thẳng, thả viền thẻ trắng; rồi bàn giao cho player qua `lib/paper/stamp-handoff.ts`.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { useProgress } from '@/lib/contexts/ProgressContext';
import { introStampSize, setStampHandoff } from '@/lib/paper/stamp-handoff';
import { chapterStates, createWheelGate, shelfP, useShelfRunner, type ChapterState, type ShelfPose } from '@/lib/paper/useShelfRunner';
import './chapter-shelf.css';

export interface ShelfChapter {
  id: string;
  slug: string;
  title: string;
  /** Tên phần (StoryPart) chứa chương: dòng nhỏ đỏ trên tiêu đề. */
  partName: string;
}

interface ChapterShelfProps {
  characterSlug: string;
  storySlug: string;
  title: string;
  teaser: string;
  estimatedTime: string;
  chapters: ShelfChapter[];
  /** Phần "Khoá học liên quan" (server render), mờ/hiện cùng trang. */
  children?: ReactNode;
}

const STATE: Record<ChapterState, { label: string; cta: string; stamp: string; union: string; star: string }> = {
  go: {
    label: 'Học ngay',
    cta: 'Bắt đầu học',
    stamp: '/paper/lesson-stamp-go.webp',
    union: '/paper/lesson-union-go.webp',
    star: '/paper/lesson-star-white.svg',
  },
  skip: {
    label: 'Nhảy cóc',
    cta: 'Học nhảy cóc',
    stamp: '/paper/lesson-stamp-skip.webp',
    union: '/paper/lesson-union-skip.webp',
    star: '/paper/lesson-star-grey.svg',
  },
  // "Hoàn thành": thân folder xanh, tem giữ màu gốc (bản -done cố ý không dùng).
  done: {
    label: 'Hoàn thành',
    cta: 'Học lại',
    stamp: '/paper/lesson-stamp-go.webp',
    union: '/paper/lesson-union-done.webp',
    star: '/paper/lesson-star-white.svg',
  },
};

// Nhịp chuyển cảnh vào trang học (ms) — giữ nguyên theo demo.
const PULL = 520;
const GLIDE_IN = 720;
const FADE_MS = 300;
const RISE_EASE = 'cubic-bezier(.16,1,.3,1)';
/** Nếu sau ngần này ms vẫn chưa sang trang học: trả trang về như cũ. */
const NAV_FALLBACK_MS = 4000;

/**
 * Lần rời trang này để vào học (biến module sống qua điều hướng client của Next).
 * Quay lại (Back / X ở player) → mở kệ đúng chương vừa học, chỉ mờ dần vào.
 */
let lastVisit: { key: string; index: number; at: number } | null = null;
/** Thẻ tem đang bay: giữ trên màn tới khi route đổi (component unmount). */
let activeFly: HTMLElement | null = null;

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function removeFlySoon() {
  const fly = activeFly;
  if (!fly) return;
  activeFly = null;
  // Hai khung hình: để player kịp vẽ tem của nó đúng chỗ rồi mới gỡ thẻ bay.
  requestAnimationFrame(() => requestAnimationFrame(() => fly.remove()));
}

export default function ChapterShelf({
  characterSlug,
  storySlug,
  title,
  teaser,
  estimatedTime,
  chapters,
  children,
}: ChapterShelfProps) {
  const router = useRouter();
  const { isCompleted } = useProgress();
  const count = chapters.length;
  const storyKey = `${characterSlug}/${storySlug}`;

  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  /** Folder đang ở giữa kệ (theo vị trí chạy): màu nền, dòng phần, nút học. */
  const [at, setAt] = useState(0);
  /** Folder được chọn (đích của kệ): aria-selected, focus, nút học. */
  const [sel, setSel] = useState(0);
  const [announce, setAnnounce] = useState('');
  // Ảnh chụp lần rời trang trước (đọc một lần; StrictMode chạy effect hai lần vẫn thấy).
  const [visit] = useState(() => lastVisit);

  // Trước khi mount: coi như chưa học chương nào (giống server, không lệch hydrate).
  const states = chapterStates(chapters.map((c) => mounted && isCompleted('chapter', c.id)));

  const rootRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);
  const folderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anims = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);
  const busy = useRef(false);
  const dragged = useRef(false);
  const userMoved = useRef(false);

  const runner = useShelfRunner({
    count: () => count,
    width: () => shelfRef.current?.clientWidth || window.innerWidth,
    reducedMotion,
    onIndex: (i) => setAt(i),
    paint: (i: number, p: ShelfPose, base: number) => {
      const el = folderRefs.current[i];
      if (!el) return;
      el.style.transform = `translateX(${p.x.toFixed(2)}px) perspective(${shelfP(base).toFixed(0)}px) rotateY(${p.ry.toFixed(2)}deg) scale(${p.s.toFixed(4)})`;
      el.style.opacity = p.op.toFixed(3);
      el.style.zIndex = String(p.z);
      el.style.setProperty('--shade', p.shade.toFixed(3));
      el.style.setProperty('--shade-to', p.side < 0 ? 'left' : 'right'); // mép xa là mép phía folder giữa
      el.style.pointerEvents = p.op > 0.05 ? '' : 'none';
    },
  });

  const track = useCallback((a: Animation) => {
    anims.current.push(a);
    return a;
  }, []);

  /** Chọn folder i: kệ chạy tới, focus theo (nếu cần). */
  const select = useCallback(
    (i: number, opts: { fast?: boolean; focus?: boolean } = {}) => {
      const n = Math.max(0, Math.min(count - 1, i));
      runner.goTo(n, opts.fast);
      userMoved.current = true;
      setSel(n);
      if (opts.focus) folderRefs.current[n]?.focus({ preventScroll: true });
    },
    [count, runner],
  );

  // ---- tên chương dài: thu chữ cho vừa khung của folder ----
  const fitTitles = useCallback(() => {
    for (const el of folderRefs.current) {
      const t = el?.querySelector<HTMLElement>('.lfolder__title');
      if (!t) continue;
      let size = 28;
      t.style.fontSize = '';
      while (t.scrollHeight > t.clientHeight + 1 && size > 14) {
        size -= 2;
        t.style.fontSize = `${size / 16}rem`;
      }
    }
  }, []);

  // ---- mount: chọn chương mặc định, hiệu ứng vào ----
  useEffect(() => {
    const done = chapters.map((c) => isCompleted('chapter', c.id));
    const st = chapterStates(done);
    let start = Math.max(0, st.indexOf('go'));
    const back = !!visit && visit.key === storyKey && Date.now() - visit.at < 2 * 3600 * 1000;
    if (back && visit) {
      const i = visit.index;
      // Học xong chương thì kệ mở sẵn ở chương kế (không trượt).
      start = done[i] && i < count - 1 ? i + 1 : Math.min(i, count - 1);
    }
    lastVisit = null;
    start = Math.max(0, start);
    setSel(start);
    runner.reset(start);
    fitTitles();
    document.fonts?.ready.then(fitTitles).catch(() => {});

    if (!reducedMotion()) {
      const root = rootRef.current;
      if (back) {
        // Quay lại từ trang học: header + trang hiện lại bằng mờ dần.
        const chrome = Array.from(document.querySelectorAll<HTMLElement>('[data-paper-header],[data-paper-chrome]'));
        for (const el of [...chrome, root]) {
          if (el) track(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: 'ease-out', fill: 'backwards' }));
        }
      } else {
        // Vào từ trang câu chuyện: tiêu đề nổi lên, folder lùa vào từ phải, rồi nút học + khoá liên quan.
        const rise = (el: HTMLElement | null, delay: number, dy: number, dur: number) => {
          if (!el) return;
          track(
            el.animate([{ opacity: 0, transform: `translateY(${dy}px)` }, { opacity: 1, transform: 'none' }], {
              duration: dur,
              delay,
              easing: RISE_EASE,
              fill: 'backwards',
            }),
          );
        };
        rise(headRef.current, 160, 24, 800);
        runner.startEnter();
        rise(ctaRef.current, 1050, 24, 800);
        rise(lineRef.current, 1150, 24, 800);
        rise(relatedRef.current, 1230, 40, 900);
      }
    }
    setMounted(true);

    const onResize = () => runner.layout();
    window.addEventListener('resize', onResize);
    const animList = anims.current;
    const timerList = timers.current;
    return () => {
      window.removeEventListener('resize', onResize);
      timerList.forEach((t) => window.clearTimeout(t));
      // Route đã đổi (sang player): gỡ thẻ bay sau khi player vẽ tem của nó.
      removeFlySoon();
      animList.forEach((a) => a.cancel());
    };
    // Chỉ chạy một lần lúc mount; tiến độ đổi sau đó chỉ đổi màu folder.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- đọc cho trình đọc màn hình khi người dùng đổi chương ----
  useEffect(() => {
    if (!userMoved.current || !chapters[sel]) return;
    const t = window.setTimeout(() => {
      setAnnounce(`Chương ${sel + 1}: ${chapters[sel].title} — ${STATE[states[sel]].label}`);
    }, 250);
    return () => window.clearTimeout(t);
    // states đổi theo tiến độ, không cần đọc lại
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, chapters]);

  // ---- vào trang học ----
  const restore = useCallback(() => {
    anims.current.splice(0).forEach((a) => a.cancel());
    activeFly?.remove();
    activeFly = null;
    for (const el of folderRefs.current) {
      if (!el) continue;
      el.classList.remove('is-pulled');
      const card = el.querySelector<HTMLElement>('.lfolder__card');
      if (card) card.style.visibility = '';
    }
    setLeaving(false);
    busy.current = false;
  }, []);

  const enter = useCallback(
    (i: number) => {
      const ch = chapters[i];
      if (!ch || busy.current) return;
      const href = `/story/${characterSlug}/${storySlug}/${ch.slug}`;
      const st = states[i];
      const stampSrc = STATE[st].stamp;
      lastVisit = { key: storyKey, index: i, at: Date.now() };
      if (reducedMotion()) {
        router.push(href);
        return;
      }
      busy.current = true;
      router.prefetch(href);
      runner.goTo(i);
      setLeaving(true);

      const folder = folderRefs.current[i];
      const card = folder?.querySelector<HTMLElement>('.lfolder__card');
      // 1. header + trang chi tiết (trừ folder đang chọn) mờ đi, nền gradient tan
      const chrome = Array.from(document.querySelectorAll<HTMLElement>('[data-paper-header],[data-paper-chrome]'));
      const outs = [...chrome, headRef.current, ctaRef.current, lineRef.current, relatedRef.current].concat(
        folderRefs.current.filter((f) => f !== folder),
      );
      for (const el of outs) {
        if (el) track(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: 'ease-out', fill: 'forwards' }));
      }
      const go = () => {
        setStampHandoff({ href, stampSrc });
        router.push(href);
        // Điều hướng bị huỷ/hỏng: trả trang về như cũ.
        timers.current.push(window.setTimeout(restore, NAV_FALLBACK_MS));
      };
      if (!folder || !card) {
        timers.current.push(window.setTimeout(go, FADE_MS));
        return;
      }
      // 2. rút tem lên khỏi túi (vẫn nằm sau thân folder), thân folder + nhãn mờ dần
      const lift = card.offsetHeight * 0.62;
      track(
        card.animate(
          [{ transform: 'rotate(-2.5deg)' }, { transform: `translateY(-${lift}px) rotate(-2.5deg)` }],
          { duration: PULL, delay: 180, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'both' },
        ),
      );
      for (const part of ['.lfolder__body', '.lfolder__badge']) {
        const el = folder.querySelector<HTMLElement>(part);
        if (el) track(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: PULL - 120, delay: 300, easing: 'ease-in', fill: 'both' }));
      }
      folder.classList.add('is-pulled'); // bóng dưới chân tan theo thân folder

      // 3. tách khỏi folder: thẻ bay (cùng chỗ, cùng cỡ) trượt về giữa màn, xoay thẳng, viền trắng tan
      timers.current.push(
        window.setTimeout(() => {
          const r = card.getBoundingClientRect();
          const rad = (2.5 * Math.PI) / 180;
          const k = r.width / (card.offsetWidth * (Math.cos(rad) + Math.sin(rad))); // cỡ thẻ trên kệ / cỡ gốc
          const stamp = introStampSize(window.innerWidth);
          const size = stamp / 0.84; // thẻ bay = tem + viền trắng 8%
          const left = window.innerWidth / 2 - size / 2;
          const top = window.innerHeight / 2 - size / 2;

          // Style inline: CSS của route này có thể bị gỡ khi sang player.
          const fly = document.createElement('div');
          fly.setAttribute('aria-hidden', 'true');
          fly.className = 'lesson-fly';
          fly.style.cssText = `position:fixed;z-index:60;pointer-events:none;border-radius:8px;left:${left}px;top:${top}px;width:${size}px;height:${size}px`;
          const img = document.createElement('img');
          img.src = stampSrc;
          img.alt = '';
          img.style.cssText = 'position:absolute;left:8%;top:8%;width:84%;height:84%;display:block';
          fly.appendChild(img);
          activeFly?.remove();
          activeFly = fly;
          document.body.appendChild(fly);
          card.style.visibility = 'hidden';

          const sc = (card.offsetWidth * k) / size;
          const dx = r.left + r.width / 2 - (left + size / 2);
          const dy = r.top + r.height / 2 - (top + size / 2);
          // Thẻ "Nhảy cóc" có lớp xám 15% trên nền trắng.
          const from = st === 'skip' ? 'rgb(217,217,217)' : 'rgb(255,255,255)';
          fly
            .animate(
              [
                { transform: `translate(${dx}px,${dy}px) scale(${sc}) rotate(-2.5deg)`, backgroundColor: from },
                { transform: 'none', backgroundColor: 'rgba(255,255,255,0)' },
              ],
              { duration: GLIDE_IN, easing: 'cubic-bezier(.33,0,.15,1)', fill: 'both' },
            )
            .finished.then(go, () => {});
        }, 180 + PULL),
      );
    },
    [chapters, characterSlug, storySlug, states, storyKey, router, runner, track, restore],
  );

  // ---- kéo, vuốt trackpad (listener gốc: wheel cần passive: false) ----
  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    let drag: { id: number; x: number; y: number; on: boolean; step: number; start: number } | null = null;
    const gate = createWheelGate(); // mỗi cú vuốt trackpad đúng 1 folder

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || busy.current) return;
      dragged.current = false;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false, step: runner.stepPx(), start: 0 };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          drag = null; // cuộn dọc trang
          return;
        }
        drag.on = true;
        dragged.current = true;
        drag.x = e.clientX;
        drag.start = runner.hold(); // bắt từ chỗ kệ đang chạy, không giật
        shelf.dataset.dragging = 'true';
        return;
      }
      runner.dragTo(drag.start - dx / drag.step);
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      delete shelf.dataset.dragging;
      if (!d.on) return;
      runner.release(d.start);
      userMoved.current = true;
      setSel(runner.targetIndex);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if ((drag && drag.on) || busy.current) return;
      const dx = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX;
      const dir = gate(dx, performance.now());
      if (dir) {
        const n = Math.max(0, Math.min(count - 1, runner.targetIndex + dir));
        runner.goTo(n);
        userMoved.current = true;
        setSel(n);
      }
    };
    const noDrag = (e: Event) => e.preventDefault();

    shelf.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    shelf.addEventListener('wheel', onWheel, { passive: false });
    shelf.addEventListener('dragstart', noDrag);
    return () => {
      shelf.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      shelf.removeEventListener('wheel', onWheel);
      shelf.removeEventListener('dragstart', noDrag);
    };
  }, [count, runner]);

  const onFolderClick = (i: number) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (busy.current) return;
    if (i === sel && runner.settledAt(i)) enter(i);
    else select(i, { fast: Math.abs(i - runner.targetIndex) >= 2 });
  };

  const onFolderKey = (e: React.KeyboardEvent, i: number) => {
    if (e.altKey || e.ctrlKey || e.metaKey || busy.current) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        e.preventDefault();
        // bấm liên tục thì cộng dồn folder đích
        select(runner.targetIndex + (e.key === 'ArrowRight' ? 1 : -1), { focus: true });
        break;
      case 'Home':
        e.preventDefault();
        select(0, { fast: runner.targetIndex >= 2, focus: true });
        break;
      case 'End':
        e.preventDefault();
        select(count - 1, { fast: count - 1 - runner.targetIndex >= 2, focus: true });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (i === sel) enter(i);
        else select(i);
        break;
    }
  };

  const cur = chapters[sel];
  const centre = chapters[at] ?? cur;
  const tint = states[at] ?? 'go';

  return (
    <main
      id="main-content"
      ref={rootRef}
      className="lesson"
      data-tint={tint}
      data-ready={mounted ? '' : undefined}
      data-leaving={leaving ? '' : undefined}
    >
      <div className="lesson-tint" aria-hidden="true" />
      <noscript>
        <style>{'.lesson [data-rise]{opacity:1!important}'}</style>
      </noscript>

      <div className="lesson__head" ref={headRef} data-rise>
        <div className="lesson__titles">
          {centre && <p className="lesson__part">{centre.partName}</p>}
          <h1 className="lesson__title paper-serif">{title}</h1>
        </div>
        {teaser && <p className="lesson__quote">“{teaser}”</p>}
        <div className="lesson__meta">
          <span>
            {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh 24px */}
            <img src="/paper/lesson-icon-chapters.svg" alt="" width={24} height={24} />
            <span>{count} chương</span>
          </span>
          {estimatedTime && (
            <span>
              {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh 24px */}
              <img src="/paper/lesson-icon-clock.svg" alt="" width={24} height={24} />
              <span>{estimatedTime}</span>
            </span>
          )}
        </div>
      </div>

      {count > 0 && (
        <>
          <div ref={shelfRef} className="lshelf" role="listbox" aria-label="Các chương" aria-orientation="horizontal">
            {chapters.map((ch, i) => {
              const st = states[i];
              const s = STATE[st];
              return (
                <div
                  key={ch.id}
                  ref={(el) => {
                    folderRefs.current[i] = el;
                  }}
                  className={`lfolder lfolder--${st}`}
                  role="option"
                  aria-selected={i === sel}
                  aria-label={`Chương ${i + 1}: ${ch.title} — ${s.label}`}
                  tabIndex={i === sel ? 0 : -1}
                  onClick={() => onFolderClick(i)}
                  onKeyDown={(e) => onFolderKey(e, i)}
                >
                  <div className="lfolder__stamp">
                    <div className="lfolder__card">
                      {/* eslint-disable-next-line @next/next/no-img-element -- tem tĩnh, JS đo kích thước thật */}
                      <img src={s.stamp} alt="" width={210} height={210} />
                      <i className="lfolder__shade" />
                    </div>
                  </div>
                  <div className="lfolder__body">
                    {/* eslint-disable-next-line @next/next/no-img-element -- ảnh thân folder tĩnh */}
                    <img src={s.union} alt="" width={300} height={220} />
                    <i className="lfolder__shade" />
                    <div className="lfolder__text">
                      {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh */}
                      <img src={s.star} alt="" width={22} height={22} />
                      <p className="lfolder__title paper-serif">{ch.title}</p>
                    </div>
                  </div>
                  <span className="lfolder__badge" aria-hidden="true">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <noscript>
            <ol>
              {chapters.map((ch, i) => (
                <li key={ch.id}>
                  <a href={`/story/${characterSlug}/${storySlug}/${ch.slug}`}>
                    Chương {i + 1}: {ch.title}
                  </a>
                </li>
              ))}
            </ol>
          </noscript>
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {announce}
          </div>

          {cur && (
            <Link
              ref={ctaRef}
              className="lesson__cta"
              href={`/story/${characterSlug}/${storySlug}/${cur.slug}`}
              data-rise
              aria-label={`${STATE[states[sel]].cta}: Chương ${sel + 1}, ${cur.title}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                enter(sel);
              }}
            >
              <span>{STATE[states[sel]].cta}</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh */}
              <img src="/paper/lesson-icon-cta.svg" alt="" width={28} height={28} />
            </Link>
          )}
        </>
      )}

      {children && (
        <>
          <div className="lesson__line" ref={lineRef} aria-hidden="true" data-rise />
          <div ref={relatedRef} data-rise>
            {children}
          </div>
        </>
      )}
    </main>
  );
}

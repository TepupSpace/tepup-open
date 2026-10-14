'use client';

import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { ChevronLeft, X, Loader2 } from 'lucide-react';
import type { EntryFull, EntryPreview } from '@/lib/library/entry-service';
import { isValidEntrySlug } from '@/lib/library/refs';
import EntryView from './EntryView';
import Citation from './Citation';

/**
 * Trình đọc tham chiếu thư viện (docs/design-reference-library.md §6).
 *
 * Mọi link tham chiếu đều là `<a href="/tv/<slug>" data-tv="<slug>">` — dù đến từ
 * rich text (đã qua sanitize-html) hay từ markdown (renderInlineMarkdown). Vì rich
 * text được chèn bằng dangerouslySetInnerHTML nên không thể gắn component React vào
 * từng link; thay vào đó component này nghe sự kiện ở cấp document (event delegation):
 *
 * - Chuột: rê vào 150 ms → xem nhanh; bấm → mở bảng bên.
 * - Bàn phím: focus → xem nhanh; Enter → mở bảng bên.
 * - Cảm ứng: chạm một lần → xem nhanh có nút "Mở"; không dùng chạm hai lần.
 * - Link trong bảng bên mở bảng hẹp hơn chồng lên (tối đa 4); Esc đóng từng lớp.
 * - Ngăn xếp bảng nằm trên URL (`?tv=a,b`) để chia sẻ/tải lại được.
 *
 * Bảng và thẻ xem nhanh được render NGAY TRONG cây này (không dùng portal), để vẫn
 * nằm trong `.reader` và nhận cài đặt sáng/tối, phông, cỡ chữ.
 */

const MAX_DEPTH = 4;
const HOVER_DELAY = 150;
const HIDE_DELAY = 150;

type Layer = { slug: string; section?: number };
type Hover = { slug: string; rect: DOMRect; mode: 'hover' | 'tap'; anchor: HTMLAnchorElement };

/**
 * Mở một mục trong bảng bên từ code (vd. thẻ "Bài đọc" — block library-document).
 * null khi không có ReferenceProvider đang bật: nơi gọi tự dùng cách hiển thị cũ.
 */
const OpenEntryContext = createContext<((slug: string, from?: HTMLElement | null) => void) | null>(null);
export const useOpenEntry = () => useContext(OpenEntryContext);

function parseStackParam(raw: string | null): Layer[] {
  if (!raw) return [];
  return raw
    .split(',')
    .filter(isValidEntrySlug)
    .slice(0, MAX_DEPTH)
    .map((slug) => ({ slug }));
}

export default function ReferenceProvider({
  slugs,
  enabled,
  children,
}: {
  /** Slug xuất hiện trong nội dung trang, để tải sẵn phần xem nhanh một lần. */
  slugs: string[];
  /** Tắt (cờ TEPUP_TV_REFERENCES) thì link /tv/ chỉ là link thường tới trang mục. */
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [previews, setPreviews] = useState<Record<string, EntryPreview | null>>({});
  const [entries, setEntries] = useState<Record<string, EntryFull | null>>({});
  const [hover, setHover] = useState<Hover | null>(null);
  const [stack, setStack] = useState<Layer[]>([]);
  const cardId = useId();
  const requested = useRef(new Set<string>());
  const requestedFull = useRef(new Set<string>());
  const lastPointer = useRef<string>('mouse');
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const hoverRef = useRef<Hover | null>(null);
  const stackRef = useRef<Layer[]>([]);
  const panelHeadingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  /**
   * Khi đóng hết bảng, focus-trap trả focus về link đã mở bảng — focus thì hiện xem
   * nhanh, nên một thẻ xem nhanh bật lên ngay sau khi đóng (khó chịu với chuột, và giành
   * chỗ với thẻ của link người học vừa rê tới). Bỏ qua xem nhanh do focus trong chốc lát.
   */
  const suppressFocusPreviewUntil = useRef(0);

  useEffect(() => {
    hoverRef.current = hover;
    stackRef.current = stack;
  }, [hover, stack]);

  // ---------- Tải dữ liệu ----------

  const loadPreviews = useCallback((list: string[]) => {
    const missing = [...new Set(list)].filter((s) => isValidEntrySlug(s) && !requested.current.has(s));
    if (!missing.length) return;
    missing.forEach((s) => requested.current.add(s));
    fetch(`/api/tv/preview?slugs=${missing.join(',')}`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j: { data: EntryPreview[] }) => {
        const found = Object.fromEntries(j.data.map((p) => [p.slug, p]));
        setPreviews((prev) => ({ ...prev, ...Object.fromEntries(missing.map((s) => [s, found[s] ?? null])) }));
      })
      .catch(() => missing.forEach((s) => requested.current.delete(s)));
  }, []);

  const loadEntry = useCallback((slug: string) => {
    if (requestedFull.current.has(slug)) return;
    requestedFull.current.add(slug);
    fetch(`/api/tv/entry/${slug}`)
      .then((r) => (r.ok ? r.json() : { data: null }))
      .then((j: { data: EntryFull | null }) => setEntries((prev) => ({ ...prev, [slug]: j.data })))
      .catch(() => requestedFull.current.delete(slug));
  }, []);

  const slugKey = slugs.join(',');
  useEffect(() => {
    if (enabled) loadPreviews(slugKey ? slugKey.split(',') : []);
  }, [enabled, slugKey, loadPreviews]);

  useEffect(() => {
    stack.forEach((l) => loadEntry(l.slug));
  }, [stack, loadEntry]);

  // ---------- Ngăn xếp bảng bên + URL ----------

  // Mở lại đúng các bảng khi tải trang có ?tv=… (sau khi hydrate, để không lệch SSR).
  useEffect(() => {
    if (!enabled) return;
    const frame = requestAnimationFrame(() => {
      const initial = parseStackParam(new URLSearchParams(window.location.search).get('tv'));
      if (initial.length) setStack(initial);
    });
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  const firstSync = useRef(true);
  useEffect(() => {
    if (!enabled) return;
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    const url = new URL(window.location.href);
    if (stack.length) url.searchParams.set('tv', stack.map((l) => l.slug).join(','));
    else url.searchParams.delete('tv');
    window.history.replaceState(window.history.state, '', url);
  }, [stack, enabled]);

  const openPanel = useCallback((layer: Layer, from?: HTMLElement | null) => {
    setStack((s) => {
      if (s.length === 0 && from) opener.current = from;
      const top = s[s.length - 1];
      if (top && top.slug === layer.slug) return s;
      const next = [...s, layer];
      // Quá 4 lớp: thay lớp trên cùng thay vì chồng tiếp, để bảng không che hết bài.
      return next.length > MAX_DEPTH ? [...s.slice(0, MAX_DEPTH - 1), layer] : next;
    });
  }, []);

  const muteReturnFocus = () => {
    suppressFocusPreviewUntil.current = Date.now() + 400;
  };
  const popPanel = useCallback(() => {
    setStack((s) => {
      if (s.length === 1) muteReturnFocus();
      return s.slice(0, -1);
    });
  }, []);
  const closeAll = useCallback(() => {
    muteReturnFocus();
    setStack([]);
  }, []);

  // Focus vào tiêu đề bảng trên cùng mỗi khi ngăn xếp đổi.
  useLayoutEffect(() => {
    if (stack.length) panelHeadingRefs.current[stack.length - 1]?.focus();
  }, [stack.length]);

  // ---------- Xem nhanh ----------

  const hide = useCallback(() => {
    const h = hoverRef.current;
    if (h) h.anchor.removeAttribute('aria-describedby');
    setHover(null);
  }, []);

  const show = useCallback(
    (anchor: HTMLAnchorElement, mode: Hover['mode']) => {
      const slug = anchor.dataset.tv;
      if (!slug || !isValidEntrySlug(slug)) return;
      loadPreviews([slug]);
      const prev = hoverRef.current;
      if (prev && prev.anchor !== anchor) prev.anchor.removeAttribute('aria-describedby');
      if (mode === 'hover') anchor.setAttribute('aria-describedby', cardId);
      setHover({ slug, rect: anchor.getBoundingClientRect(), mode, anchor });
    },
    [cardId, loadPreviews],
  );

  const clearTimers = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };
  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(hide, HIDE_DELAY);
  }, [hide]);

  // ---------- Sự kiện ở cấp document ----------

  useEffect(() => {
    if (!enabled) return;
    const refAnchor = (t: EventTarget | null) =>
      t instanceof Element ? (t.closest('a[data-tv]') as HTMLAnchorElement | null) : null;
    const inCard = (t: EventTarget | null) => t instanceof Element && !!t.closest('[data-tv-card]');

    const onPointerDown = (e: PointerEvent) => {
      lastPointer.current = e.pointerType;
    };
    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const a = refAnchor(e.target);
      if (a) {
        clearTimers();
        showTimer.current = setTimeout(() => show(a, 'hover'), HOVER_DELAY);
      } else if (inCard(e.target)) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
      }
    };
    const onPointerOut = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const from = refAnchor(e.target) ?? (inCard(e.target) ? e.target : null);
      if (!from) return;
      const to = e.relatedTarget;
      if (to instanceof Node && (from as Element).contains(to)) return;
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hoverRef.current?.mode === 'hover') scheduleHide();
    };
    const onFocusIn = (e: FocusEvent) => {
      const a = refAnchor(e.target);
      if (a && lastPointer.current !== 'touch' && Date.now() > suppressFocusPreviewUntil.current) {
        clearTimers();
        show(a, 'hover');
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!refAnchor(e.target)) return;
      if (inCard(e.relatedTarget)) return;
      if (hoverRef.current?.mode === 'hover') scheduleHide();
    };
    const onClick = (e: MouseEvent) => {
      const a = refAnchor(e.target);
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      clearTimers();
      const slug = a.dataset.tv!;
      const section = a.dataset.tvSection !== undefined ? Number(a.dataset.tvSection) : undefined;
      // `detail === 0`: kích hoạt bằng bàn phím (Enter), luôn mở bảng.
      if ((lastPointer.current === 'touch' || lastPointer.current === 'pen') && e.detail !== 0) {
        const h = hoverRef.current;
        if (h && h.anchor === a && h.mode === 'tap') hide();
        else show(a, 'tap');
        return;
      }
      hide();
      openPanel({ slug, section }, stackRef.current.length ? null : a);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (hoverRef.current) {
        hide();
        e.stopPropagation();
      } else if (stackRef.current.length) {
        popPanel();
        e.stopPropagation();
      }
    };
    const onScroll = (e: Event) => {
      // Cuộn trong thẻ xem nhanh thì giữ; cuộn trang thì thẻ lệch khỏi link nên ẩn.
      if (hoverRef.current && !inCard(e.target)) hide();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScroll, { capture: true });
      clearTimers();
    };
  }, [enabled, show, hide, scheduleHide, openPanel, popPanel]);

  const openEntry = useCallback(
    (slug: string, from?: HTMLElement | null) => {
      if (!isValidEntrySlug(slug)) return;
      hide();
      openPanel({ slug }, stackRef.current.length ? null : (from ?? null));
    },
    [hide, openPanel],
  );

  const titles = useMemo(
    () => stack.map((l) => entries[l.slug]?.title ?? previews[l.slug]?.title ?? '…'),
    [stack, entries, previews],
  );

  if (!enabled) return <>{children}</>;

  return (
    <>
      <OpenEntryContext.Provider value={openEntry}>{children}</OpenEntryContext.Provider>
      <FocusTrap
        active={stack.length > 0}
        focusTrapOptions={{
          // Bấm ra ngoài (vào bài học) = đóng mọi bảng.
          clickOutsideDeactivates: true,
          escapeDeactivates: false,
          fallbackFocus: () => document.body,
          initialFocus: false,
          setReturnFocus: () => opener.current ?? false,
          onDeactivate: closeAll,
        }}
      >
        <div>
          {stack.map((layer, i) => {
            const top = i === stack.length - 1;
            const entry = entries[layer.slug];
            return (
              <div
                key={`${i}-${layer.slug}`}
                role="dialog"
                aria-modal={top ? 'true' : undefined}
                aria-label={entry?.title ?? 'Mục thư viện'}
                inert={!top}
                style={{ zIndex: 70 + i, ['--tv-w' as string]: `${27.5 - 2 * i}rem` }}
                className={`fixed inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[var(--tv-w)] max-w-full bg-white shadow-2xl border-l border-gray-200 flex-col ${
                  top ? 'flex' : 'hidden md:flex'
                }`}
              >
                <PanelHeader
                  depth={stack.length}
                  index={i}
                  label={entry?.typeLabel ?? previews[layer.slug]?.typeLabel ?? 'Thư viện'}
                  title={titles[i]}
                  crumbs={titles}
                  headingRef={(el) => {
                    panelHeadingRefs.current[i] = el;
                  }}
                  onBack={popPanel}
                  onClose={closeAll}
                  onCrumb={(k) => setStack((s) => s.slice(0, k + 1))}
                />
                <div className="flex-1 overflow-y-auto px-5 py-5" data-tv-scroll>
                  {entry === undefined ? (
                    <p className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Đang tải…
                    </p>
                  ) : entry === null ? (
                    <p className="text-gray-700">Mục này không còn trong thư viện.</p>
                  ) : (
                    <SectionScroller section={layer.section} idPrefix={`tv-${i}-${layer.slug}`}>
                      <EntryView entry={entry} idPrefix={`tv-${i}-${layer.slug}`} />
                    </SectionScroller>
                  )}
                </div>
              </div>
            );
          })}
          {hover && (
            <PreviewCard
              id={cardId}
              hover={hover}
              preview={previews[hover.slug]}
              onOpen={() => {
                const a = hover.anchor;
                hide();
                openPanel(
                  { slug: hover.slug, section: a.dataset.tvSection !== undefined ? Number(a.dataset.tvSection) : undefined },
                  stackRef.current.length ? null : a,
                );
              }}
              onClose={hide}
            />
          )}
        </div>
      </FocusTrap>
    </>
  );
}

function PanelHeader({
  depth,
  index,
  label,
  title,
  crumbs,
  headingRef,
  onBack,
  onClose,
  onCrumb,
}: {
  depth: number;
  index: number;
  label: string;
  title: string;
  crumbs: string[];
  headingRef: (el: HTMLHeadingElement | null) => void;
  onBack: () => void;
  onClose: () => void;
  onCrumb: (k: number) => void;
}) {
  // Vuốt xuống trên phần đầu bảng (điện thoại) = quay lại một lớp.
  const startY = useRef<number | null>(null);
  return (
    <div
      className="border-b border-gray-200 px-3 pt-3 pb-2"
      onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (startY.current !== null && e.changedTouches[0].clientY - startY.current > 80) onBack();
        startY.current = null;
      }}
    >
      {depth > 1 && (
        <nav aria-label="Các mục đang mở" className="md:hidden mb-1">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-600">
            <li>Bài học</li>
            {crumbs.slice(0, -1).map((c, k) => (
              <li key={k} className="flex items-center gap-1">
                <span aria-hidden="true">›</span>
                <button type="button" onClick={() => onCrumb(k)} className="underline hover:text-gray-900">
                  {c}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-start gap-1">
        {index > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Quay lại mục trước"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        <div className="flex-1 min-w-0 px-1 py-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{label}</p>
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
          aria-label={depth > 1 ? 'Đóng mọi mục đang mở' : 'Đóng'}
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** Cuộn tới phần được chỉ định trong link (`/tv/slug#n`) khi bảng vừa có nội dung. */
function SectionScroller({ section, idPrefix, children }: { section?: number; idPrefix: string; children: React.ReactNode }) {
  useEffect(() => {
    if (section === undefined) return;
    document.getElementById(`${idPrefix}-s${section}`)?.scrollIntoView({ block: 'start' });
  }, [section, idPrefix]);
  return <>{children}</>;
}

function PreviewCard({
  id,
  hover,
  preview,
  onOpen,
  onClose,
}: {
  id: string;
  hover: Hover;
  preview: EntryPreview | null | undefined;
  onOpen: () => void;
  onClose: () => void;
}) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(320, vw - 32);
  const left = Math.max(16, Math.min(hover.rect.left, vw - width - 16));
  const below = hover.rect.top < vh * 0.55;
  const pos = below ? { top: hover.rect.bottom + 8 } : { bottom: vh - hover.rect.top + 8 };
  const tap = hover.mode === 'tap';

  return (
    <div
      id={id}
      data-tv-card
      role={tap ? 'dialog' : 'tooltip'}
      aria-label={tap ? preview?.title ?? 'Xem nhanh' : undefined}
      style={{ position: 'fixed', left, width, zIndex: 90, ...pos }}
      className="rounded-xl border border-gray-200 bg-white shadow-xl p-4 text-left max-h-[60vh] overflow-y-auto"
    >
      {preview === undefined ? (
        <p className="text-sm text-gray-600">Đang tải…</p>
      ) : preview === null ? (
        <p className="text-sm text-gray-700">Mục này không còn trong thư viện.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
            {preview.typeLabel}
            {preview.subtitle && <span className="normal-case font-medium text-gray-600"> · {preview.subtitle}</span>}
          </p>
          <p className="font-semibold text-gray-900">{preview.title}</p>
          {preview.citation && (
            <p className="text-sm text-gray-700">
              <Citation citation={preview.citation} />
            </p>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">{preview.summary}</p>
          {preview.type === 'TOOL' && (
            <p className="text-xs text-gray-600">
              Cập nhật {preview.updatedAt}
              {preview.overdue && <span className="ml-2 font-semibold text-amber-800">Cần rà soát</span>}
            </p>
          )}
        </div>
      )}
      {tap && (
        <div className="mt-3 flex gap-2">
          {preview && (
            <button
              type="button"
              onClick={onOpen}
              className="flex-1 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            >
              Mở
            </button>
          )}
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}

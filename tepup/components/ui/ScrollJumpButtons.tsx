'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowDown, ArrowUp } from 'lucide-react';

/** Hiện nút khi còn cách đầu/cuối trang hơn khoảng này (điểm ảnh). */
const THRESHOLD = 400;

/**
 * Phần tử đang cuộn: thường là tài liệu; trình đọc bài học đôi khi cuộn chính <main>
 * (xem getScroller trong LessonPlayer), nên ưu tiên <main id="main-content"> nếu nó cuộn được.
 */
function scroller(): HTMLElement {
  const main = document.getElementById('main-content');
  if (main && main.scrollHeight > main.clientHeight + 1) {
    const oy = getComputedStyle(main).overflowY;
    if (oy === 'auto' || oy === 'scroll') return main;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

/**
 * Nút "Lên đầu trang" / "Xuống cuối trang" cho trang dài, góc dưới bên trái (bên phải là
 * nút chat). Chỉ hiện nút có ích: lên khi đã cuộn xuống, xuống khi còn xa cuối trang.
 * Né thanh tab và chân trang dính trên điện thoại (`above-bottom-chrome`). Không hiện ở
 * trang quản trị/cộng tác viên (trình soạn có thanh công cụ riêng ở góc).
 */
export default function ScrollJumpButtons() {
  const pathname = usePathname() ?? '';
  const [state, setState] = useState({ up: false, down: false });

  const update = useCallback(() => {
    const el = scroller();
    const top = el.scrollTop;
    const rest = el.scrollHeight - el.clientHeight - top;
    setState((s) => {
      const next = { up: top > THRESHOLD, down: rest > THRESHOLD };
      return next.up === s.up && next.down === s.down ? s : next;
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(update);
    // capture: bắt cả cuộn của <main> lẫn của tài liệu.
    window.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update, { passive: true });
    // Nội dung mở dần (bài học hiện từng khối) đổi chiều cao trang mà không cuộn.
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [update, pathname]);

  if (/^\/(admin|contributor)(\/|$)/.test(pathname)) return null;
  if (!state.up && !state.down) return null;

  const jump = (to: 'top' | 'bottom') => {
    const el = scroller();
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ top: to === 'top' ? 0 : el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  const btn =
    'flex items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-300 text-gray-700 shadow-md hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600';

  return (
    <div className="above-bottom-chrome fixed left-4 sm:left-6 z-[54] flex flex-col gap-2 print:hidden">
      {state.up && (
        <button type="button" onClick={() => jump('top')} className={btn} aria-label="Lên đầu trang" title="Lên đầu trang">
          <ArrowUp className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
      {state.down && (
        <button type="button" onClick={() => jump('bottom')} className={btn} aria-label="Xuống cuối trang" title="Xuống cuối trang">
          <ArrowDown className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Câu thông báo cho vùng `aria-live` của một block.
 *
 * Vùng live phải luôn có mặt trong DOM, chỉ đổi chữ bên trong — nếu nó xuất hiện
 * cùng lúc với nội dung thì trình đọc màn hình thường bỏ qua. Mỗi block render
 * `<p className="sr-only" aria-live="polite">{message}</p>` một lần và gọi
 * `announce(...)` khi có kết quả mới.
 */
export function useAnnouncer() {
  const [message, setMessage] = useState('');
  const announce = useCallback((text: string) => {
    // Cùng một câu hai lần liên tiếp ("Sai rổ, thử lại") thì DOM không đổi và
    // trình đọc màn hình im lặng; thêm khoảng trắng không ngắt để nó vẫn đọc.
    setMessage((prev) => (prev === text ? `${text} ` : text));
  }, []);
  return [message, announce] as const;
}

/**
 * Đưa focus tới phần tử thay chỗ cho nút vừa bấm (nút bị gỡ khỏi DOM thì focus rơi
 * về <body> và lần Tab sau bắt đầu lại từ đầu trang). Chỉ cuộn khi phần tử nằm ngoài
 * màn hình, và cuộn tức thì nếu người dùng chọn giảm chuyển động.
 */
function focusInView(el: HTMLElement | null) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
  el.focus({ preventScroll: true });
  if (!inView) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }
}

/**
 * Hẹn focus một phần tử ở lần render tới — phần tử đó thường chưa tồn tại lúc
 * handler chạy. Gọi `focusAfterRender(() => ref.current)` ngay trong handler.
 */
export function useFocusAfterRender() {
  const pending = useRef<(() => HTMLElement | null) | null>(null);
  useEffect(() => {
    const get = pending.current;
    if (!get) return;
    pending.current = null;
    focusInView(get());
  });
  return useCallback((get: () => HTMLElement | null) => {
    pending.current = get;
  }, []);
}

/** Bỏ cú pháp markdown inline (`**`, `*`, `` ` ``, `[chữ](url)`) để đọc thành lời. */
export function toPlainText(md: string | undefined): string {
  if (!md) return '';
  return md.replace(/\[([^\]\n]+)\]\([^\s)]+\)/g, '$1').replace(/\*\*|[*`]/g, '');
}

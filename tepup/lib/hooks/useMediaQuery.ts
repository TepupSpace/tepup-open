'use client';

import { useEffect, useState } from 'react';

/**
 * Theo dõi một media query.
 *
 * Thay cho việc đọc window.innerWidth một lần: cách đó không cập nhật khi xoay
 * máy, và chạm vào window trong lúc render sẽ vỡ ở phía server.
 *
 * Luôn trả về false ở lần render đầu để markup của server và của trình duyệt
 * khớp nhau; giá trị thật xuất hiện ngay sau khi gắn vào DOM.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Khớp với breakpoint `sm` của Tailwind (640px). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/** Trang đang chạy trong app đã cài chứ không phải trong tab trình duyệt. */
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const check = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      // Safari trên iOS không hỗ trợ display-mode, phải hỏi thuộc tính riêng của nó.
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setStandalone(check());
  }, []);

  return standalone;
}

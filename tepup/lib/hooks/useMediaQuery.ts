'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Theo dõi một media query.
 *
 * Thay cho việc đọc window.innerWidth một lần: cách đó không cập nhật khi xoay
 * máy, và chạm vào window trong lúc render sẽ vỡ ở phía server.
 *
 * Luôn trả về false khi render ở server và lúc hydrate, để markup hai bên khớp nhau;
 * giá trị thật xuất hiện ngay sau đó (useSyncExternalStore lo việc này, không cần
 * setState trong effect).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

/** Khớp với breakpoint `sm` của Tailwind (640px). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/** Trang đang chạy trong app đã cài chứ không phải trong tab trình duyệt. */
export function useIsStandalone(): boolean {
  const displayStandalone = useMediaQuery('(display-mode: standalone)');
  // Safari trên iOS không hỗ trợ display-mode, phải hỏi thuộc tính riêng của nó.
  const iosStandalone = useSyncExternalStore(
    noSubscribe,
    () => (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
    () => false,
  );
  return displayStandalone || iosStandalone;
}

/** Giá trị không đổi trong suốt phiên: không cần lắng nghe. */
const noSubscribe = () => () => {};

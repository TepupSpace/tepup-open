'use client';

/**
 * Theo dõi "đang có điều hướng chạy dở" cho cả app.
 *
 * Tên phải là NavigationProgress chứ không phải ProgressProvider — cái tên đó đã
 * thuộc về `lib/contexts/ProgressContext.tsx` (tiến độ học của người dùng).
 *
 * Next không có API router-events. Có hai nguồn báo bận:
 *   1. `AppLink` — đọc `useLinkStatus()` bên trong cây con của <Link>.
 *   2. `useNavigate()` — bọc `router.push` trong `useTransition`.
 * Cả hai đều gọi `setBusy()` và nhận về một hàm dọn dẹp.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

interface NavigationProgressValue {
  busy: boolean;
  /** Báo bắt đầu một điều hướng. Gọi hàm trả về để báo kết thúc. */
  setBusy: () => () => void;
}

const NavigationProgressContext = createContext<NavigationProgressValue>({
  busy: false,
  setBusy: () => () => {},
});

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

/** Chốt chặn: điều hướng lâu bất thường thì tự tắt thanh, không để nó chạy mãi. */
const MAX_BUSY_MS = 15_000;

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  // Bộ đếm chứ không phải cờ bật/tắt: hai link có thể cùng báo bận (một cú bấm
  // vào giữa lúc cú trước chưa xong), và cú kết thúc trước không được phép tắt
  // thanh trong khi cú sau vẫn đang chạy.
  const pathname = usePathname();
  const [busyCount, setBusyCount] = useState(0);
  const [seenPathname, setSeenPathname] = useState(pathname);

  // Điều chỉnh state ngay trong lúc render — đúng khuôn mẫu React khuyến nghị cho
  // "reset khi prop đổi", và tránh được một vòng render thừa so với việc dùng
  // effect. Điều hướng bị huỷ hoặc bị redirect có thể để lại trạng thái pending
  // không bao giờ được nhả; path đổi nghĩa là đã tới nơi.
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    setBusyCount(0);
  }

  const setBusy = useCallback(() => {
    setBusyCount((count) => count + 1);

    let released = false;
    return () => {
      if (released) return;
      released = true;
      setBusyCount((count) => Math.max(0, count - 1));
    };
  }, []);

  const busy = busyCount > 0;

  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => setBusyCount(0), MAX_BUSY_MS);
    return () => clearTimeout(timer);
  }, [busy]);

  const value = useMemo(() => ({ busy, setBusy }), [busy, setBusy]);

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
    </NavigationProgressContext.Provider>
  );
}

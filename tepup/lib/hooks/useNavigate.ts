'use client';

/**
 * Điều hướng bằng lệnh (`router.push`) nhưng có biết là đang chạy.
 *
 * `router.push` trần không trả về gì và không báo trạng thái, nên nút bấm xong cứ
 * đứng im như chưa ăn. Bọc trong `useTransition` thì `isPending` bám theo đúng
 * vòng đời điều hướng của App Router, đồng thời đẩy tín hiệu lên thanh progress.
 */

import { useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigationProgress } from '@/lib/contexts/NavigationProgressContext';

export function useNavigate() {
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();
  const { setBusy } = useNavigationProgress();
  const pathname = usePathname();

  // `router.back()` đi qua popstate, `useTransition` không bám được vòng đời đó,
  // nên nhánh này phải tự giữ cờ bận. Không có cờ thì nút lùi không khoá được và
  // hai cú nhấp liên tiếp sẽ lùi hai bước.
  const [goingBack, setGoingBack] = useState(false);

  // Về tới nơi thì nhả cờ. Điều chỉnh ngay trong render theo khuôn mẫu "reset khi
  // prop đổi" của React — dùng effect ở đây sẽ tốn thêm một vòng render thừa.
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    setGoingBack(false);
  }

  // Hạn chót phòng khi không có gì để lùi và popstate không bao giờ xảy ra.
  useEffect(() => {
    if (!goingBack) return;
    const timer = setTimeout(() => setGoingBack(false), 3_000);
    return () => clearTimeout(timer);
  }, [goingBack]);

  const isPending = isTransitioning || goingBack;

  useEffect(() => {
    if (!isPending) return;
    return setBusy();
  }, [isPending, setBusy]);

  const navigate = (href: string, options?: { replace?: boolean }) => {
    startTransition(() => {
      if (options?.replace) router.replace(href);
      else router.push(href);
    });
  };

  const goBack = () => {
    setGoingBack(true);
    router.back();
  };

  return { navigate, goBack, isPending, router };
}

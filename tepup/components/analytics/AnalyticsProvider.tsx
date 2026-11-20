'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { flush, track } from '@/lib/analytics/client';
import { classifyPath } from '@/lib/analytics/buckets';
import { safeDigest, scrubErrorMessage, scrubErrorName } from '@/lib/analytics/scrub';

/**
 * Gắn một lần trong Providers: `page_view` mỗi lần đổi trang, bắt lỗi toàn cục, và gửi
 * nốt hàng đợi khi tab bị ẩn/đóng. Không render gì, không đọc gì ở server (an toàn
 * với cache Cloudflare của trang công khai). Khu vực nhân viên bị bỏ qua trong client.ts.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const { routeType, slug } = classifyPath(pathname);
    track({ name: 'page_view', routeType, ...(slug ? { slug } : {}) });
  }, [pathname]);

  useEffect(() => {
    const routeType = () => classifyPath(window.location.pathname).routeType;
    const onError = (e: ErrorEvent) => {
      // Lỗi tải script/ảnh của bên khác không có `error`; bỏ qua cho đỡ nhiễu.
      if (!e.error && !e.message) return;
      track({
        name: 'error',
        source: 'window',
        routeType: routeType(),
        errorName: scrubErrorName(e.error),
        message: scrubErrorMessage(e.error ?? e.message),
      });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      track({
        name: 'error',
        source: 'rejection',
        routeType: routeType(),
        errorName: scrubErrorName(e.reason),
        message: scrubErrorMessage(e.reason),
      });
    };
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };
    const onPageHide = () => flush(true);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  return null;
}

/** Cho các màn báo lỗi (ErrorState, global-error). */
export function trackBoundaryError(error: Error & { digest?: string }, source: 'boundary' | 'global') {
  track({
    name: 'error',
    source,
    routeType: classifyPath(window.location.pathname).routeType,
    errorName: scrubErrorName(error),
    message: scrubErrorMessage(error),
    ...(safeDigest(error.digest) ? { digest: safeDigest(error.digest) } : {}),
  });
  flush(false);
}

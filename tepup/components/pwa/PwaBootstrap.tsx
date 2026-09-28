'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PROGRESS_UPDATE_EVENT } from '@/lib/contexts/ProgressContext';
import {
  PROGRESS_STORAGE_KEY,
  SEED_PARAM,
  decodeProgressSeed,
  encodeProgressSeed,
} from '@/lib/pwa/progress-seed';

/**
 * Lo hai việc chỉ chạy được ở phía trình duyệt cho phần PWA:
 *
 *   1. Đăng ký service worker, để Chrome/Android chịu hiện nút Cài đặt.
 *   2. Bắc cầu tiến độ giữa trình duyệt và app đã cài — ghi seed vào href của thẻ
 *      manifest trước khi cài, và nạp seed lại từ URL ở lần đầu mở app.
 */
export default function PwaBootstrap() {
  const pathname = usePathname();

  // Nạp tiến độ mang sang từ trình duyệt. Chạy một lần, càng sớm càng tốt.
  useEffect(() => {
    const url = new URL(window.location.href);
    const seed = url.searchParams.get(SEED_PARAM);
    if (!seed) return;

    // Xoá tham số khỏi thanh địa chỉ dù có nạp được hay không — start_url mang
    // seed theo mọi lần khởi động, không nên để nó nằm lại trong lịch sử.
    const clearParam = () => {
      url.searchParams.delete(SEED_PARAM);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    };

    try {
      // Chỉ nạp khi máy chưa có tiến độ nào. Cài lại app không được phép ghi đè
      // những gì người học đã làm bên trong app.
      const existing = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        const hasProgress = Object.values(parsed?.progress ?? {}).some(
          (item) => (item as { completed?: boolean })?.completed
        );
        if (hasProgress) {
          clearParam();
          return;
        }
      }

      const restored = decodeProgressSeed(seed);
      if (restored) {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(restored));
        // Provider đã đọc localStorage lúc khởi tạo rồi, nên phải báo cho nó
        // đọc lại — nếu không, giao diện vẫn trắng cho tới lần tải trang sau.
        window.dispatchEvent(
          new CustomEvent(PROGRESS_UPDATE_EVENT, { detail: restored })
        );
      }
    } catch {
      // Seed hỏng thì bỏ qua, thà mất tiến độ còn hơn làm hỏng dữ liệu đang có.
    }

    clearParam();
  }, []);

  // Đăng ký service worker.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Không đăng ký được thì trang vẫn chạy bình thường, chỉ mất nút cài trên Android.
    });
  }, []);

  // Giữ cho href của thẻ manifest luôn mang tiến độ mới nhất. Chạy lại theo
  // pathname vì App Router có thể dựng lại thẻ head khi chuyển trang.
  useEffect(() => {
    const syncManifestHref = () => {
      const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (!link) return;

      let seed: string | null = null;
      try {
        seed = encodeProgressSeed(localStorage.getItem(PROGRESS_STORAGE_KEY));
      } catch {
        seed = null;
      }

      const next = seed
        ? `/manifest.webmanifest?${SEED_PARAM}=${encodeURIComponent(seed)}`
        : '/manifest.webmanifest';

      // So sánh trước khi gán: đổi href làm trình duyệt tải lại manifest.
      if (!link.href.endsWith(next)) link.setAttribute('href', next);
    };

    syncManifestHref();
    window.addEventListener(PROGRESS_UPDATE_EVENT, syncManifestHref);
    return () => window.removeEventListener(PROGRESS_UPDATE_EVENT, syncManifestHref);
  }, [pathname]);

  return null;
}

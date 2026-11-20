'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPlayerPath } from '@/lib/navigation-history';

/**
 * Giữ nội dung luôn mới khi Tépup chạy như ứng dụng đã cài (PWA), và cả ở tab
 * trình duyệt để mở lâu.
 *
 * Vì sao cần: app đã cài không có thanh địa chỉ hay nút tải lại, iOS còn không
 * kéo-để-tải-lại được. Mở app từ màn hình chính thường chỉ ĐÁNH THỨC trang cũ
 * trong bộ nhớ (có khi từ hôm qua) chứ không tải lại, nên bài mới không bao giờ
 * hiện. Service worker không phải thủ phạm: nó không cache gì (public/sw.js).
 *
 * Làm gì:
 *  - Trang hiện lại sau ≥ STALE_MS ở nền, trang được khôi phục từ bfcache, hoặc
 *    có mạng trở lại → hỏi /api/version.
 *      · Server đã có bản deploy mới → tải lại toàn trang (code + nội dung mới).
 *      · Cùng bản → `router.refresh()`: lấy lại dữ liệu server của trang đang
 *        xem, giữ nguyên trạng thái phía client.
 *  - Đang ở trang học (player) thì không làm gì giữa chừng: đổi nội dung dưới
 *    tay người đang học sẽ lệch bước. Ghi nhớ lại, chuyển sang trang khác mới làm.
 *  - Đang mở lâu thì cứ CHECK_EVERY_MS kiểm tra một lần (chỉ khi trang đang hiện).
 *
 * Nội dung trên server vẫn có độ trễ riêng tới ~10 phút (Cloudflare 5 phút +
 * ISR `revalidate = 300`, xem CLAUDE.md › Edge caching); phần này chỉ đảm bảo
 * app hỏi lại server thay vì đứng yên mãi với bản cũ.
 */

const STALE_MS = 2 * 60 * 1000;
const CHECK_EVERY_MS = 15 * 60 * 1000;
const BUILD = process.env.NEXT_PUBLIC_BUILD_ID;

/** Phát từ nút "Tải nội dung mới nhất" (bảng Cài đặt) để làm mới ngay. */
export const REFRESH_NOW_EVENT = 'tepup:refresh-now';

/**
 * Chốt chống tải lại liên tục: ngay sau deploy, Cloudflare có thể còn giữ HTML cũ
 * (≤5 phút) nên tải lại vẫn ra bản cũ. Đã tải lại vì bản X trong 10 phút qua thì
 * lần này chỉ refresh dữ liệu.
 */
const RELOAD_KEY = 'tepup:fresh-reload';
const RELOAD_GUARD_MS = 10 * 60 * 1000;
function mayReloadFor(build: string): boolean {
  try {
    const raw = sessionStorage.getItem(RELOAD_KEY);
    const last = raw ? (JSON.parse(raw) as { build: string; at: number }) : null;
    if (last && last.build === build && Date.now() - last.at < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, JSON.stringify({ build, at: Date.now() }));
  } catch {
    // Không có sessionStorage: vẫn cho tải lại (các lần kiểm tra cách nhau ≥ 2 phút).
  }
  return true;
}

async function serverBuild(): Promise<string | null> {
  try {
    const res = await fetch('/api/version', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { build?: string };
    return data.build ?? null;
  } catch {
    return null; // mất mạng: để lần sau
  }
}

export default function FreshContent() {
  const router = useRouter();
  const pathname = usePathname();
  const hiddenAt = useRef<number | null>(null);
  const lastCheck = useRef(Date.now());
  const pending = useRef<'refresh' | 'reload' | null>(null);
  const pathRef = useRef(pathname);

  useEffect(() => {
    pathRef.current = pathname;
    // Vừa rời trang học: làm nốt việc đã hoãn.
    if (pending.current && !isPlayerPath(pathname)) {
      const what = pending.current;
      pending.current = null;
      // Hoãn từ trang học: lúc này đã sang trang khác, tải lại toàn trang cho đủ code mới.
      if (what === 'reload') window.location.reload();
      else router.refresh();
    }
  }, [pathname, router]);

  useEffect(() => {
    let busy = false;

    /**
     * `skipThrottle`: bỏ qua giới hạn STALE_MS (sự kiện mở lại app, có mạng lại).
     * `manual`: người dùng tự bấm "Tải nội dung mới nhất" → làm ngay, kể cả ở trang học.
     */
    const check = async ({ skipThrottle = false, manual = false } = {}) => {
      if (busy) return;
      if (manual) {
        // Người dùng tự yêu cầu: tải lại toàn trang là chắc chắn nhất (code + dữ liệu).
        window.location.reload();
        return;
      }
      if (!skipThrottle && Date.now() - lastCheck.current < STALE_MS) return;
      busy = true;
      lastCheck.current = Date.now();
      try {
        const build = await serverBuild();
        const newer = !!(build && BUILD && build !== BUILD);
        const what: 'refresh' | 'reload' = newer ? 'reload' : 'refresh';
        if (build === null && !manual) return; // không hỏi được server thì đừng làm gì
        if (isPlayerPath(pathRef.current) && !manual) {
          // Đã có việc reload chờ thì không hạ xuống refresh.
          if (pending.current !== 'reload') pending.current = what;
          return;
        }
        if (what === 'reload' && build && mayReloadFor(build)) window.location.reload();
        else router.refresh();
      } finally {
        busy = false;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now();
        return;
      }
      const away = hiddenAt.current ? Date.now() - hiddenAt.current : 0;
      hiddenAt.current = null;
      if (away >= STALE_MS) void check({ skipThrottle: true });
    };
    // Khôi phục từ bfcache (Safari hay làm khi mở lại app): trang có thể rất cũ.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void check({ skipThrottle: true });
    };
    const onOnline = () => void check({ skipThrottle: true });
    const onRefreshNow = () => {
      pending.current = null;
      void check({ manual: true });
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void check();
    }, CHECK_EVERY_MS);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('online', onOnline);
    window.addEventListener(REFRESH_NOW_EVENT, onRefreshNow);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('online', onOnline);
      window.removeEventListener(REFRESH_NOW_EVENT, onRefreshNow);
    };
  }, [router]);

  return null;
}

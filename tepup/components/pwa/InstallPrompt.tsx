'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { Download, X } from 'lucide-react';
import {
  detectPlatform,
  getInstallPrompt,
  isStandalone,
  openSettings,
  runInstallPrompt,
  subscribeInstallPrompt,
} from '@/lib/pwa/platform';

const DISMISSED_KEY = 'tepup_install_dismissed';

/** Đọc một lần từ trình duyệt; ở server coi như đã tắt (không hiện gì). */
const noSubscribe = () => () => {};
const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Phần tử focus được kế tiếp sau `el` (focus về đó khi `el` biến mất). */
function nextFocusableAfter(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  return (
    Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
      (c) =>
        !el.contains(c) &&
        !c.closest('[inert]') &&
        Boolean(el.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING),
    ) ?? null
  );
}

/**
 * Lời mời cài Tépup ở cuối /courses (chỉ trên điện thoại, chưa cài, chưa tắt).
 *
 * Hướng dẫn đầy đủ (iOS / Android, trình duyệt trong Facebook/Zalo…) nằm trong
 * bảng Cài đặt ở header (components/settings). Ở đây chỉ là lối tắt: Android
 * cho cài một chạm thì cài luôn, còn lại mở bảng Cài đặt đúng phần hướng dẫn.
 * Tiến độ học theo sang bản cài nhờ seed trong start_url (lib/pwa/progress-seed.ts).
 */
export default function InstallPrompt() {
  const platform = useSyncExternalStore(noSubscribe, detectPlatform, () => 'other' as const);
  const installed = useSyncExternalStore(noSubscribe, isStandalone, () => true);
  const canPrompt = useSyncExternalStore(subscribeInstallPrompt, () => !!getInstallPrompt(), () => false);
  const storedDismissed = useSyncExternalStore(noSubscribe, readDismissed, () => true);
  const [dismissedNow, setDismissedNow] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const dismiss = () => {
    const next = nextFocusableAfter(sectionRef.current);
    setDismissedNow(true);
    if (next) requestAnimationFrame(() => next.focus());
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Chặn lưu trữ thì chấp nhận hỏi lại lần sau.
    }
  };

  if (installed || storedDismissed || dismissedNow) return null;
  if (platform === 'other' && !canPrompt) return null;

  const oneTap = platform === 'android' && canPrompt;

  return (
    <section ref={sectionRef} aria-labelledby="install-prompt-title" className="install-card">
      <button type="button" onClick={dismiss} aria-label="Ẩn lời mời cài đặt" className="install-card__x">
        <X aria-hidden="true" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element -- favicon SVG tĩnh */}
      <img src="/paper/favicon.svg" alt="" width={56} height={56} className="install-card__icon" />
      <div className="install-card__text">
        <h2 id="install-prompt-title">Cài Tépup về máy</h2>
        <p>Mở nhanh từ màn hình chính như một ứng dụng, toàn màn hình, tiến độ học được mang theo.</p>
        <div className="install-card__actions">
          {oneTap ? (
            <button
              type="button"
              className="paper-btn"
              onClick={async () => {
                if (await runInstallPrompt()) dismiss();
              }}
            >
              <Download aria-hidden="true" className="install-card__btn-icon" />
              Cài đặt ngay
            </button>
          ) : (
            <button type="button" className="paper-btn" aria-haspopup="dialog" onClick={() => openSettings('install')}>
              Xem hướng dẫn cài
            </button>
          )}
          {oneTap && (
            <button type="button" className="install-card__link" onClick={() => openSettings('install')}>
              Hướng dẫn chi tiết
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

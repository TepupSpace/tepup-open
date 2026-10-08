'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import FocusTrap from 'focus-trap-react';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { useIsStandalone } from '@/lib/hooks/useMediaQuery';

const DISMISSED_KEY = 'tepup_install_dismissed';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** First focusable element after `el` in the page (focus goes there when `el` disappears). */
function nextFocusableAfter(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  return (
    Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
      (candidate) =>
        !el.contains(candidate) &&
        !candidate.closest('[inert]') &&
        Boolean(el.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING),
    ) ?? null
  );
}

/** Sự kiện riêng của Chromium, chưa nằm trong định nghĩa kiểu chuẩn. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Mời người học cài Tepup về màn hình chính.
 *
 * Hai nền tảng đi hai đường khác nhau: Chromium cho phép gọi hộp thoại cài đặt
 * bằng mã, còn iOS không có API nào tương đương — ở đó chỉ có thể vẽ lại đúng các
 * bước bấm tay trong Safari.
 *
 * Tiến độ học vẫn theo sang được nhờ seed trong start_url, nên mời muộn cũng không
 * mất gì — xem lib/pwa/progress-seed.ts.
 */
export default function InstallPrompt() {
  const isStandalone = useIsStandalone();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === '1');
    } catch {
      setDismissed(false);
    }

    // iPad từ iPadOS 13 khai báo mình là Macintosh, phải kiểm tra thêm cảm ứng.
    const ua = navigator.userAgent;
    const iosLike =
      /iPad|iPhone|iPod/.test(ua) ||
      (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    setIsIos(iosLike && isSafari);
  }, []);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // Chặn thanh mời mặc định để tự chọn thời điểm hỏi.
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const dismiss = () => {
    // The whole invitation disappears, focused button included: hand focus to what comes next.
    const next = nextFocusableAfter(sectionRef.current);
    setDismissed(true);
    setShowIosGuide(false);
    if (next) requestAnimationFrame(() => next.focus());
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Chặn lưu trữ thì chấp nhận hỏi lại ở lần sau.
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      dismiss();
      return;
    }
    setShowIosGuide(true);
  };

  // Đã cài rồi, đã từ chối rồi, hoặc nền tảng không cài được thì im lặng.
  if (isStandalone || dismissed) return null;
  if (!deferredPrompt && !isIos) return null;

  return (
    <>
      <section
        ref={sectionRef}
        aria-labelledby="install-prompt-title"
        className="relative mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Ẩn lời mời cài đặt"
          className="absolute right-3 top-3 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-start gap-4">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={56}
            height={56}
            className="flex-shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <h2 id="install-prompt-title" className="font-semibold text-gray-900">Cài Tepup về máy</h2>
            <p className="mt-1 text-sm text-gray-600">
              Thêm Tepup vào màn hình chính để mở nhanh như một ứng dụng, không còn
              thanh địa chỉ. Tiến độ học của bạn được mang theo.
            </p>
            <button
              type="button"
              onClick={handleInstall}
              aria-haspopup={isIos && !deferredPrompt ? 'dialog' : undefined}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Cài đặt
            </button>
          </div>
        </div>
      </section>

      {/* iOS không cho gọi hộp thoại cài đặt, chỉ còn cách chỉ lại các bước bấm tay.
          Hộp thoại modal: focus vào nút "Đã hiểu", Tab ở lại bên trong, Esc đóng, và focus
          trở lại nút "Cài đặt" (focus-trap tự trả). Nền tối chỉ là lối tắt cho chuột/chạm. */}
      {showIosGuide && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            onMouseDown={() => setShowIosGuide(false)}
            aria-hidden="true"
          />
          <FocusTrap
            focusTrapOptions={{
              allowOutsideClick: true,
              initialFocus: '#ios-guide-ok',
              onDeactivate: () => setShowIosGuide(false),
            }}
          >
            <div
              className="pointer-events-none fixed inset-0 z-[61] flex items-end justify-center p-3 sm:items-center"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="ios-guide-title"
                className="pointer-events-auto w-full max-w-sm rounded-2xl bg-white p-5 pb-safe-4 shadow-2xl"
              >
                <h2 id="ios-guide-title" className="font-semibold text-gray-900">
                  Thêm vào Màn hình chính
                </h2>
                <ol className="mt-4 space-y-4 text-sm text-gray-700">
                  <li className="flex items-center gap-3">
                    <Share className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden="true" />
                    <span>
                      Bấm nút <strong>Chia sẻ</strong> ở thanh dưới của Safari
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <SquarePlus className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden="true" />
                    <span>
                      Chọn <strong>Thêm vào Màn hình chính</strong>
                    </span>
                  </li>
                </ol>
                <button
                  id="ios-guide-ok"
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="mt-6 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </FocusTrap>
        </>
      )}
    </>
  );
}

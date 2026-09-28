'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { useIsStandalone } from '@/lib/hooks/useMediaQuery';

const DISMISSED_KEY = 'tepup_install_dismissed';

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
    setDismissed(true);
    setShowIosGuide(false);
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
      <section className="relative mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
        <button
          onClick={dismiss}
          aria-label="Ẩn lời mời cài đặt"
          className="absolute right-3 top-3 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
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
            <h2 className="font-semibold text-gray-900">Cài Tepup về máy</h2>
            <p className="mt-1 text-sm text-gray-600">
              Thêm Tepup vào màn hình chính để mở nhanh như một ứng dụng, không còn
              thanh địa chỉ. Tiến độ học của bạn được mang theo.
            </p>
            <button
              onClick={handleInstall}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-600 sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Cài đặt
            </button>
          </div>
        </div>
      </section>

      {/* iOS không cho gọi hộp thoại cài đặt, chỉ còn cách chỉ lại các bước bấm tay. */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Hướng dẫn cài đặt trên iPhone"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 pb-safe-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-900">Thêm vào Màn hình chính</h3>
            <ol className="mt-4 space-y-4 text-sm text-gray-700">
              <li className="flex items-center gap-3">
                <Share className="h-5 w-5 flex-shrink-0 text-blue-500" aria-hidden="true" />
                <span>
                  Bấm nút <strong>Chia sẻ</strong> ở thanh dưới của Safari
                </span>
              </li>
              <li className="flex items-center gap-3">
                <SquarePlus className="h-5 w-5 flex-shrink-0 text-blue-500" aria-hidden="true" />
                <span>
                  Chọn <strong>Thêm vào Màn hình chính</strong>
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-6 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}

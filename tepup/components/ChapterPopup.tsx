'use client';

import { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import type { ChapterDisplay } from '@/lib/types/content';
import { useNavigate } from '@/lib/hooks/useNavigate';
import Spinner from '@/components/ui/Spinner';

interface ChapterPopupProps {
  chapter: ChapterDisplay;
  /** Full destination path — the caller owns URL shape, this component does not. */
  href: string;
  isSkippingAhead: boolean;
  onClose: () => void;
  colorClass: string;
}

export default function ChapterPopup({ chapter, href, isSkippingAhead, onClose, colorClass }: ChapterPopupProps) {
  const { navigate, isPending, router } = useNavigate();

  // Popup là bước trung gian có chủ đích — kéo sẵn payload trong lúc người đọc
  // còn đang nhìn tên chương.
  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  // Extract color for button
  const colorName = colorClass.replace('text-', '').replace('-600', '');

  const buttonColors: Record<string, string> = {
    teal: 'bg-teal-500 hover:bg-teal-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  };

  const buttonColor = isSkippingAhead
    ? 'bg-orange-500 hover:bg-orange-600'
    : buttonColors[colorName] || 'bg-blue-500 hover:bg-blue-600';

  const handleStart = () => {
    if (isPending) return;
    navigate(href);
  };

  // Đang đi rồi thì đừng cho đóng — mất popup giữa chừng là mất luôn dấu hiệu
  // duy nhất cho thấy có gì đang chạy.
  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup */}
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true, onDeactivate: handleClose }}>
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chapter-popup-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[280px]">
            <h3 id="chapter-popup-title" className="text-lg font-bold text-gray-900 text-center mb-4">
              {chapter.title}
            </h3>

            <button
              onClick={handleStart}
              disabled={isPending}
              aria-busy={isPending}
              className={`w-full py-3 px-6 ${buttonColor} text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2`}
            >
              {isPending ? (
                <>
                  <Spinner size="sm" tone="onDark" />
                  Đang mở…
                </>
              ) : (
                isSkippingAhead ? 'Nhảy cóc' : 'Bắt đầu'
              )}
            </button>
          </div>
        </div>
      </FocusTrap>
    </>
  );
}

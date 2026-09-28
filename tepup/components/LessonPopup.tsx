'use client';

import { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import type { LessonDisplay } from '@/lib/types/content';
import { useNavigate } from '@/lib/hooks/useNavigate';
import Spinner from '@/components/ui/Spinner';

interface LessonPopupProps {
  lesson: LessonDisplay;
  /** Full destination path — the caller owns URL shape, this component does not. */
  href: string;
  isSkippingAhead: boolean;
  onClose: () => void;
}

export default function LessonPopup({ lesson, href, isSkippingAhead, onClose }: LessonPopupProps) {
  const { navigate, isPending, router } = useNavigate();

  // Popup là một bước trung gian có chủ đích: người học còn đọc tên bài rồi mới
  // bấm. Kéo sẵn payload trong khoảng chết đó thì lúc bấm gần như đã có hàng.
  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  const handleStart = () => {
    if (isPending) return;
    navigate(href);
  };

  // Đang đi rồi thì đừng cho đóng — popup biến mất giữa chừng sẽ để người dùng
  // ngồi trước màn hình cũ mà không còn dấu hiệu nào là có gì đang chạy.
  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  return (
    <>
      {/* Backdrop — phải nằm trên cả thanh tab lẫn nút chat, nếu không hai thứ đó
          vẫn sáng nguyên trong khi phần còn lại đã mờ đi. */}
      <div
        className="fixed inset-0 bg-black/20 z-[60]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup */}
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true, onDeactivate: handleClose }}>
        <div
          className="above-bottom-chrome fixed left-1/2 -translate-x-1/2 z-[61] w-[calc(100vw-2rem)] max-w-sm animate-slide-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lesson-popup-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h3 id="lesson-popup-title" className="text-lg font-bold text-gray-900 text-center mb-4">
              {lesson.name}
            </h3>

            <button
              onClick={handleStart}
              disabled={isPending}
              aria-busy={isPending}
              className={`w-full py-3 px-6 font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 ${
                isSkippingAhead
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
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

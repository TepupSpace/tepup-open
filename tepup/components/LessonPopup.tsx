'use client';

import { useEffect, type MouseEvent } from 'react';
import Link from 'next/link';
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

  // Nút chính là link thật để mở được trong tab mới. Ctrl/⌘/Shift-click (và
  // chuột giữa, vốn không gọi onClick) để trình duyệt tự lo; click thường thì
  // đi qua navigate() để còn trạng thái "Đang mở…".
  const handleStart = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
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

            {/* prefetch đã làm ở effect phía trên */}
            <Link
              href={href}
              prefetch={false}
              onClick={handleStart}
              aria-disabled={isPending || undefined}
              aria-busy={isPending}
              className={`w-full py-3 px-6 font-semibold rounded-xl transition-all active:scale-[0.98] aria-disabled:opacity-70 aria-disabled:cursor-wait flex items-center justify-center gap-2 ${
                isSkippingAhead
                  ? 'bg-orange-700 text-white hover:bg-orange-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
            </Link>

            {/* Nút đóng nhìn thấy được: trước đây chỉ có nền mờ (ẩn với trình
                đọc màn hình) và phím Esc. */}
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 w-full min-h-11 py-2 px-6 font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </FocusTrap>
    </>
  );
}

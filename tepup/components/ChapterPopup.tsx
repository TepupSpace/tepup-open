'use client';

import { useEffect, type MouseEvent } from 'react';
import Link from 'next/link';
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

  // Chữ trắng cần nền đủ đậm (4.5:1): blue từ -600, teal/orange từ -700.
  const buttonColors: Record<string, string> = {
    teal: 'bg-teal-700 hover:bg-teal-800',
    blue: 'bg-blue-600 hover:bg-blue-700',
    orange: 'bg-orange-700 hover:bg-orange-800',
  };

  const buttonColor = isSkippingAhead
    ? 'bg-orange-700 hover:bg-orange-800'
    : buttonColors[colorName] || 'bg-blue-600 hover:bg-blue-700';

  // Nút chính là link thật để mở được trong tab mới. Ctrl/⌘/Shift-click (và
  // chuột giữa, vốn không gọi onClick) để trình duyệt tự lo; click thường thì
  // đi qua navigate() để còn trạng thái "Đang mở…".
  const handleStart = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
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
      {/* Backdrop — giống LessonPopup: phải nằm trên cả thanh tab lẫn nút chat. */}
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
          aria-labelledby="chapter-popup-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h3 id="chapter-popup-title" className="text-lg font-bold text-gray-900 text-center mb-4">
              {chapter.title}
            </h3>

            {/* prefetch đã làm ở effect phía trên */}
            <Link
              href={href}
              prefetch={false}
              onClick={handleStart}
              aria-disabled={isPending || undefined}
              aria-busy={isPending}
              className={`w-full py-3 px-6 ${buttonColor} text-white font-semibold rounded-xl transition-all active:scale-[0.98] aria-disabled:opacity-70 aria-disabled:cursor-wait flex items-center justify-center gap-2`}
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

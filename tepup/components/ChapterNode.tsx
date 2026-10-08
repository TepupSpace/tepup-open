'use client';

import { Check, BookOpen } from 'lucide-react';
import type { ChapterDisplay } from '@/lib/types/content';

interface ChapterNodeProps {
  chapter: ChapterDisplay;
  isActive: boolean;
  isCurrent: boolean;
  isSkippingAhead: boolean;
  /** Popup của nút này đang mở — cho aria-expanded. */
  isOpen: boolean;
  onClick: () => void;
  colorClass: string;
}

export default function ChapterNode({ chapter, isActive, isCurrent, isSkippingAhead, isOpen, onClick, colorClass }: ChapterNodeProps) {
  const isCompleted = chapter.isCompleted;
  const isHere = (isCurrent || isActive) && !isCompleted;

  // Extract color from colorClass (e.g., "text-teal-600" -> "teal")
  const colorName = colorClass.replace('text-', '').replace('-600', '');

  // Determine visual styles based on state
  const getNodeStyle = () => {
    if (isCompleted) {
      // green-700: dấu tick trắng trên green-500 chỉ đạt 2.2:1
      return 'bg-green-700 text-white';
    }
    if (isCurrent || isActive) {
      return `bg-white border-4 border-${colorName}-500 shadow-lg shadow-${colorName}-200`;
    }
    // Chương phía trước — vẫn mở, chỉ là chưa đọc tới
    return 'bg-gray-100 text-gray-500 hover:bg-gray-200';
  };

  // Trạng thái chỉ thể hiện bằng màu và icon (đã ẩn với trình đọc màn hình),
  // nên phải nói thành lời trong tên của nút.
  const stateLabel = isCompleted ? ', đã hoàn thành' : isHere ? ', chương đang học' : ', chưa học';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-current={isHere ? 'step' : undefined}
      className="relative flex flex-col items-center gap-2 group cursor-pointer"
    >
      {/* Node Circle — span, vì <div> không hợp lệ bên trong <button> */}
      <span
        className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
          ${getNodeStyle()}
        `}
        style={(isCurrent || isActive) && !isCompleted ? { borderColor: `var(--color-${colorName}-500, #3b82f6)` } : {}}
      >
        {isCompleted ? (
          <Check className="w-8 h-8" />
        ) : (isCurrent || isActive) ? (
          <span
            className={`w-4 h-4 rounded-full bg-${colorName}-500`}
            style={{ backgroundColor: `var(--color-${colorName}-500, #3b82f6)` }}
          />
        ) : (
          // Không dùng ổ khoá: mọi chương đều mở, icon khoá khiến người đọc tưởng bị chặn.
          <BookOpen className="w-6 h-6" />
        )}
      </span>

      {/* Active Ring Animation - show for current chapter, centered on circle */}
      {isHere && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center pointer-events-none">
          <span className={`w-20 h-20 rounded-full border-2 border-${colorName}-400 animate-ping opacity-30`} />
        </span>
      )}

      {/* Chapter Title */}
      <span
        className={`
          text-sm font-medium text-center max-w-[120px]
          ${isSkippingAhead && !isCompleted && !isCurrent && !isActive ? 'text-gray-500' : 'text-gray-700'}
        `}
      >
        {chapter.title}
        <span className="sr-only">{stateLabel}</span>
      </span>
    </button>
  );
}

'use client';

import { Check, BookOpen, Star } from 'lucide-react';
import type { LessonDisplay } from '@/lib/types/content';

interface LessonNodeProps {
  lesson: LessonDisplay;
  isActive: boolean;
  isCurrent: boolean;
  isSkippingAhead: boolean;
  /** Bài đang hiện trên thẻ "Bắt đầu học" ở đáy. */
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Tên ngắn trên lộ trình: phần trước " — " ("Correlation ≠ Causation — Cùng xảy ra…"
 * → "Correlation ≠ Causation"). Tên đầy đủ nằm ở thẻ đáy và trong tên của nút.
 */
export function shortLessonName(name: string): string {
  const head = name.split(/\s+[—–]\s+/)[0]?.trim();
  return head || name;
}

/**
 * Một nút bài trên lộ trình khoá (giao diện giấy, app/(paper)/courses/[slug]/course.css):
 * đĩa tròn lớn + tên ngắn bên cạnh, xếp so le, nhiều khoảng trống. Màu giống kệ chương
 * câu chuyện: đỏ = học tiếp, xanh = hoàn thành, xám = chưa học.
 */
export default function LessonNode({ lesson, isActive, isCurrent, isSkippingAhead, isSelected, onClick }: LessonNodeProps) {
  const isCompleted = lesson.isCompleted;
  const isHere = (isCurrent || isActive) && !isCompleted;
  const state = isCompleted ? 'done' : isHere ? 'go' : isSkippingAhead ? 'ahead' : 'idle';

  // Trạng thái thể hiện bằng màu và icon (ẩn với trình đọc màn hình): nói thành lời.
  const stateLabel = isCompleted ? ', đã hoàn thành' : isHere ? ', bài đang học' : ', chưa học';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-current={isHere ? 'step' : undefined}
      className={`cp-node cp-node--${state}`}
    >
      <span className="cp-node__disc" aria-hidden="true">
        {isCompleted ? <Check /> : isHere ? <Star /> : <BookOpen />}
      </span>
      <span className="cp-node__name">
        <span aria-hidden="true">{shortLessonName(lesson.name)}</span>
        <span className="sr-only">
          {lesson.name}
          {stateLabel}
        </span>
      </span>
    </button>
  );
}

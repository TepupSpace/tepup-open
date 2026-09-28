'use client';

import { Check, Lock } from 'lucide-react';
import type { LessonDisplay } from '@/lib/types/content';

interface LessonNodeProps {
  lesson: LessonDisplay;
  isActive: boolean;
  isCurrent: boolean;
  isSkippingAhead: boolean;
  onClick: () => void;
}

export default function LessonNode({ lesson, isActive, isCurrent, isSkippingAhead, onClick }: LessonNodeProps) {
  const isCompleted = lesson.isCompleted;

  // Determine visual styles based on state
  const getNodeStyle = () => {
    if (isCompleted) {
      return 'bg-green-500 text-white';
    }
    if (isCurrent || isActive) {
      return 'bg-white border-4 border-blue-500 shadow-lg shadow-blue-200';
    }
    // Future lessons (skipping ahead) - locked style but still clickable
    return 'bg-gray-100 text-gray-400 hover:bg-gray-200';
  };

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 group cursor-pointer"
    >
      {/* Node Circle */}
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
          ${getNodeStyle()}
        `}
      >
        {isCompleted ? (
          <Check className="w-8 h-8" />
        ) : (isCurrent || isActive) ? (
          <div className="w-4 h-4 rounded-full bg-blue-500" />
        ) : (
          <Lock className="w-6 h-6" />
        )}
      </div>

      {/* Active Ring Animation - show for current lesson, centered on circle */}
      {(isCurrent || isActive) && !isCompleted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
        </div>
      )}

      {/* Lesson Name */}
      <span
        className={`
          text-sm font-medium text-center max-w-[120px]
          ${isSkippingAhead && !isCompleted && !isCurrent && !isActive ? 'text-gray-400' : 'text-gray-700'}
        `}
      >
        {lesson.name}
      </span>
    </button>
  );
}

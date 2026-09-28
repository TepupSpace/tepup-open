'use client';

import { Check, Lock } from 'lucide-react';
import type { ChapterDisplay } from '@/lib/types/content';

interface ChapterNodeProps {
  chapter: ChapterDisplay;
  isActive: boolean;
  isCurrent: boolean;
  isSkippingAhead: boolean;
  onClick: () => void;
  colorClass: string;
}

export default function ChapterNode({ chapter, isActive, isCurrent, isSkippingAhead, onClick, colorClass }: ChapterNodeProps) {
  const isCompleted = chapter.isCompleted;

  // Extract color from colorClass (e.g., "text-teal-600" -> "teal")
  const colorName = colorClass.replace('text-', '').replace('-600', '');

  // Determine visual styles based on state
  const getNodeStyle = () => {
    if (isCompleted) {
      return 'bg-green-500 text-white';
    }
    if (isCurrent || isActive) {
      return `bg-white border-4 border-${colorName}-500 shadow-lg shadow-${colorName}-200`;
    }
    // Future chapters (skipping ahead) - locked style but still clickable
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
        style={(isCurrent || isActive) && !isCompleted ? { borderColor: `var(--color-${colorName}-500, #3b82f6)` } : {}}
      >
        {isCompleted ? (
          <Check className="w-8 h-8" />
        ) : (isCurrent || isActive) ? (
          <div
            className={`w-4 h-4 rounded-full bg-${colorName}-500`}
            style={{ backgroundColor: `var(--color-${colorName}-500, #3b82f6)` }}
          />
        ) : (
          <Lock className="w-6 h-6" />
        )}
      </div>

      {/* Active Ring Animation - show for current chapter, centered on circle */}
      {(isCurrent || isActive) && !isCompleted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center pointer-events-none">
          <div className={`w-20 h-20 rounded-full border-2 border-${colorName}-400 animate-ping opacity-30`} />
        </div>
      )}

      {/* Chapter Title */}
      <span
        className={`
          text-sm font-medium text-center max-w-[120px]
          ${isSkippingAhead && !isCompleted && !isCurrent && !isActive ? 'text-gray-400' : 'text-gray-700'}
        `}
      >
        {chapter.title}
      </span>
    </button>
  );
}

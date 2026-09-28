'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';

/**
 * Quiz block. Two modes: 'single' (one right answer, radio) and 'multiple'
 * (several, checkbox). `mode` is absent on everything authored before the option
 * existed, and absent means 'single' — the pre-existing look and feel is kept
 * byte-for-byte in that case.
 *
 * Multiple choice is graded all-or-nothing: the learner must pick the exact set of
 * correct answers. When they miss one, the answer they skipped is called out
 * explicitly rather than just marked green, so the gap is legible.
 */
export function QuestionBlockComponent({
  block,
  onSelect,
  isChecked,
  selectedAnswer,
  isCorrect,
  explanationRef,
}: {
  block: {
    type: 'question';
    question: string;
    mode?: 'single' | 'multiple';
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation?: string;
  };
  onSelect: (optionId: string) => void;
  isChecked: boolean;
  selectedAnswer: string[];
  isCorrect: boolean | null;
  explanationRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const isMultiple = block.mode === 'multiple';

  return (
    <div className="mb-6">
      <p className="text-lg text-gray-900 mb-2 font-medium whitespace-pre-line">{renderInlineMarkdown(block.question)}</p>

      {isMultiple && (
        <p className="text-sm text-gray-500 mb-4">Chọn tất cả đáp án đúng.</p>
      )}

      <div className={isMultiple ? 'space-y-3 mt-2' : 'space-y-3 mt-4'}>
        {block.options.map((option, idx) => {
          const optionId = option.id ?? String(idx);
          const isSelected = selectedAnswer.includes(optionId);

          // Single choice reveals the right answer solid green whether or not it was
          // picked (unchanged behaviour). Multiple choice keeps solid green for
          // "you got this one" and uses the dashed `missed` style for the gaps.
          const showCorrect = isChecked && option.isCorrect && (isSelected || !isMultiple);
          const showWrong = isChecked && isSelected && !option.isCorrect;
          const showMissed = isChecked && isMultiple && option.isCorrect && !isSelected;

          return (
            <button
              key={optionId}
              onClick={() => !isChecked && onSelect(optionId)}
              disabled={isChecked}
              aria-pressed={isSelected}
              className={`
                w-full p-4 text-left rounded-xl border-2 transition-all
                ${
                  showCorrect
                    ? 'border-green-500 bg-green-50'
                    : showMissed
                    ? 'border-green-400 border-dashed bg-green-50/60'
                    : showWrong
                    ? 'border-red-500 bg-red-50'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${isChecked ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-6 h-6 border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${isMultiple ? 'rounded-md' : 'rounded-full'}
                    ${
                      showCorrect
                        ? 'border-green-500 bg-green-500'
                        : showMissed
                        ? 'border-green-400 border-dashed'
                        : showWrong
                        ? 'border-red-500 bg-red-500'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }
                  `}
                >
                  {showCorrect && <Check className="w-4 h-4 text-white" aria-hidden="true" />}
                  {showMissed && <Check className="w-4 h-4 text-green-500" aria-hidden="true" />}
                  {showWrong && <X className="w-4 h-4 text-white" aria-hidden="true" />}
                  {isSelected && !isChecked && (
                    isMultiple
                      ? <Check className="w-4 h-4 text-white" aria-hidden="true" />
                      : <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className={`${showCorrect ? 'text-green-700 font-medium' : showMissed ? 'text-green-700' : showWrong ? 'text-red-700' : isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  {renderInlineMarkdown(option.text)}
                </span>
                {showMissed && (
                  <span className="ml-auto flex-shrink-0 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Còn thiếu
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation after checking */}
      <div aria-live="polite" aria-atomic="true">
        {isChecked && block.explanation && (
          <div
            ref={explanationRef}
            className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}
          >
            <p className={`${isCorrect ? 'text-green-700' : 'text-blue-700'} whitespace-pre-line`}>
              <span className="font-semibold">{isCorrect ? 'Chính xác! ' : 'Giải thích: '}</span>
              {renderInlineMarkdown(block.explanation)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

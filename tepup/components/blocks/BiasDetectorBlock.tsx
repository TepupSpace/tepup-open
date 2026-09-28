'use client';

import { useState } from 'react';
import type { BiasDetectorBlock as BiasDetectorBlockType } from '@/lib/types/content';
import { AlertTriangle, Check, X, ChevronDown } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import BlockShell from './BlockShell';

interface Props {
  block: BiasDetectorBlockType;
  onComplete?: () => void;
}

interface SegmentState {
  selectedBias: string | null;
  checked: boolean;
  correct: boolean;
}

export default function BiasDetectorBlockComponent({ block, onComplete }: Props) {
  const [segmentStates, setSegmentStates] = useState<Record<string, SegmentState>>({});
  const [allChecked, setAllChecked] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const handleSelectBias = (segmentId: string, biasId: string) => {
    setSegmentStates(prev => ({
      ...prev,
      [segmentId]: { selectedBias: biasId, checked: false, correct: false },
    }));
    setActiveSegment(null);
  };

  const handleCheckAll = () => {
    const newStates: Record<string, SegmentState> = {};
    let allCorrect = true;

    block.segments.forEach(seg => {
      const state = segmentStates[seg.id];
      const correct = state?.selectedBias === seg.biasType;
      if (!correct) allCorrect = false;
      newStates[seg.id] = {
        selectedBias: state?.selectedBias || null,
        checked: true,
        correct,
      };
    });

    setSegmentStates(newStates);
    setAllChecked(true);
    onComplete?.();
  };

  const allSegmentsAnswered = block.segments.every(seg => segmentStates[seg.id]?.selectedBias);
  const correctCount = allChecked
    ? block.segments.filter(seg => segmentStates[seg.id]?.correct).length
    : 0;

  // Build article text with highlighted segments
  const renderArticle = () => {
    const text = block.article.text;
    const segments = [...block.segments].sort((a, b) => a.startIndex - b.startIndex);

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    segments.forEach((seg) => {
      // Text before this segment
      if (seg.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>{text.slice(lastIndex, seg.startIndex)}</span>
        );
      }

      const state = segmentStates[seg.id];
      const isActive = activeSegment === seg.id;
      const hasAnswer = state?.selectedBias;
      const isChecked = state?.checked;
      const isCorrect = state?.correct;

      const biasLabel = hasAnswer
        ? block.biasOptions.find(o => o.id === state.selectedBias)?.label
        : null;

      parts.push(
        <span key={`seg-${seg.id}`} className="relative inline">
          <button
            onClick={() => !allChecked && setActiveSegment(isActive ? null : seg.id)}
            disabled={allChecked}
            className={`
              inline px-1 py-0.5 rounded transition-all underline decoration-2 decoration-wavy
              ${isChecked
                ? isCorrect
                  ? 'bg-green-100 decoration-green-500 text-green-800'
                  : 'bg-red-100 decoration-red-400 text-red-800'
                : hasAnswer
                ? 'bg-amber-100 decoration-amber-400 text-amber-800 cursor-pointer'
                : isActive
                ? 'bg-yellow-200 decoration-yellow-500 text-yellow-900'
                : 'bg-yellow-50 decoration-yellow-300 text-yellow-900 hover:bg-yellow-100 cursor-pointer'
              }
            `}
          >
            {seg.text}
          </button>
          {/* Bias label tag */}
          {hasAnswer && (
            <span className={`
              inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
              ${isChecked
                ? isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                : 'bg-amber-200 text-amber-800'
              }
            `}>
              {isChecked && (isCorrect ? <Check className="w-2.5 h-2.5" aria-hidden="true" /> : <X className="w-2.5 h-2.5" aria-hidden="true" />)}
              {biasLabel}
            </span>
          )}
          {/* Dropdown — neo theo đoạn văn thì trên màn hẹp danh sách tràn khỏi mép
              phải khi đoạn được bôi nằm cuối dòng. Ở mobile nó chuyển thành phiếu
              nổi bám đáy màn hình: luôn vừa khung và nằm trong tầm ngón cái. */}
          {isActive && !allChecked && (
            <div className="fixed inset-x-3 bottom-[calc(0.75rem+var(--bottom-chrome,0px)+var(--safe-bottom))] z-[58] max-h-[55dvh] overflow-y-auto bg-white border-2 border-yellow-300 rounded-xl shadow-2xl p-2 sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-1 sm:z-10 sm:max-h-none sm:w-max sm:min-w-[200px] sm:shadow-lg">
              <p className="text-xs text-gray-500 px-2 mb-1 font-medium">Chọn loại bias:</p>
              {block.biasOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleSelectBias(seg.id, option.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${state?.selectedBias === option.id
                      ? 'bg-yellow-100 text-yellow-800 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </span>
      );

      lastIndex = seg.startIndex + seg.text.length;
    });

    // Remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`text-end`}>{text.slice(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <BlockShell skin="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600" aria-hidden="true" />
        <h3 className="text-lg font-bold text-gray-900">{block.title || 'Phát hiện thiên lệch'}</h3>
      </div>

      <p className="text-gray-600 text-sm mb-4">{block.instruction}</p>

      {/* Article */}
      <div className="bg-white/80 rounded-xl p-5 mb-4 border border-yellow-100">
        <div className="text-gray-800 leading-relaxed text-[15px]">
          {renderArticle()}
        </div>
        {block.article.source && (
          <p className="mt-3 text-xs text-gray-400 italic">— {block.article.source}</p>
        )}
      </div>

      {/* Instructions / Legend */}
      {!allChecked && (
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-yellow-50 border border-yellow-300 rounded" />
            Click vào cụm từ highlight
          </span>
          <span className="flex items-center gap-1">
            <ChevronDown className="w-3 h-3" aria-hidden="true" />
            Chọn loại bias
          </span>
        </div>
      )}

      {/* Check button */}
      {!allChecked && allSegmentsAnswered && (
        <button
          onClick={handleCheckAll}
          className="w-full py-3 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-colors"
        >
          Kiểm tra tất cả ({block.segments.length} cụm từ)
        </button>
      )}

      {!allChecked && !allSegmentsAnswered && (
        <p className="text-sm text-gray-400 text-center">
          Đã phân loại {Object.keys(segmentStates).filter(k => segmentStates[k].selectedBias).length}/{block.segments.length} cụm từ
        </p>
      )}

      {/* Results */}
      {allChecked && (
        <div className="space-y-3" aria-live="polite">
          <div className={`p-4 rounded-xl ${correctCount === block.segments.length ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`font-semibold ${correctCount === block.segments.length ? 'text-green-700' : 'text-blue-700'}`}>
              Kết quả: {correctCount}/{block.segments.length} đúng
            </p>
          </div>

          {/* Explanations for wrong answers */}
          {block.segments.filter(seg => !segmentStates[seg.id]?.correct).map(seg => (
            <div key={seg.id} className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm">
                <span className="font-semibold text-red-700">"{seg.text}"</span>
                <span className="text-gray-600"> — Đáp án đúng: </span>
                <span className="font-semibold text-red-700">{block.biasOptions.find(o => o.id === seg.biasType)?.label}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">{renderInlineMarkdown(seg.explanation)}</p>
            </div>
          ))}

          {/* Explanations for correct answers */}
          {block.segments.filter(seg => segmentStates[seg.id]?.correct).map(seg => (
            <div key={seg.id} className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm">
                <span className="font-semibold text-green-700">"{seg.text}"</span>
                <span className="text-gray-600"> — </span>
                <span className="font-semibold text-green-700">{block.biasOptions.find(o => o.id === seg.biasType)?.label}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">{renderInlineMarkdown(seg.explanation)}</p>
            </div>
          ))}
        </div>
      )}
    </BlockShell>
  );
}

'use client';

import { useState } from 'react';
import type { PerspectiveSwitchBlock as PerspectiveSwitchBlockType } from '@/lib/types/content';
import { Users, Check, X, Eye } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import BlockShell from './BlockShell';

interface Props {
  block: PerspectiveSwitchBlockType;
  onComplete?: () => void;
}

/**
 * `icon` is meant to hold an emoji, but seeded content sometimes carries a
 * lucide-style name instead ('thumbs-up'). Map the ones in use; drop anything
 * else rather than printing the raw name next to the role.
 */
const ICON_NAME_TO_EMOJI: Record<string, string> = {
  'thumbs-up': '👍',
  'thumbs-down': '👎',
  'user': '🧑',
  'users': '👥',
  'scale': '⚖️',
  'brain': '🧠',
  'eye': '👁️',
  'heart': '❤️',
  'shield': '🛡️',
  'search': '🔍',
};

function resolveIcon(icon?: string): string | null {
  if (!icon) return null;
  if (/^[a-z][a-z0-9-]*$/.test(icon)) return ICON_NAME_TO_EMOJI[icon] ?? null;
  return icon;
}

export default function PerspectiveSwitchBlockComponent({ block, onComplete }: Props) {
  const [activeTab, setActiveTab] = useState(block.perspectives[0]?.id || '');
  const [readTabs, setReadTabs] = useState<Set<string>>(new Set([block.perspectives[0]?.id || '']));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const allRead = readTabs.size === block.perspectives.length;

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setReadTabs(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const isCorrect = checked && block.question.options.find(o => o.id === selectedAnswer)?.isCorrect;

  // Completion is gated on answering, not on answering correctly — same rule as a
  // plain question block. Options lock after checking, so requiring a correct answer
  // would strand anyone who picks wrong with no way to continue the lesson.
  const handleCheck = () => {
    setChecked(true);
    onComplete?.();
  };

  const activePerspective = block.perspectives.find(p => p.id === activeTab);

  // Icon/color per role for visual distinction
  const roleColors = ['bg-blue-100 text-blue-700 border-blue-300', 'bg-rose-100 text-rose-700 border-rose-300', 'bg-amber-100 text-amber-700 border-amber-300', 'bg-purple-100 text-purple-700 border-purple-300'];

  return (
    <BlockShell skin="bg-gradient-to-br from-violet-50 to-fuchsia-50 border-2 border-violet-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-6 h-6 text-violet-600" aria-hidden="true" />
        <h3 className="text-lg font-bold text-gray-900">{block.title || 'Đa góc nhìn'}</h3>
      </div>

      {/* Event description */}
      <div className="bg-white/60 rounded-xl p-4 mb-4 border border-violet-100">
        <p className="text-gray-800 leading-relaxed font-medium">{renderInlineMarkdown(block.event)}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {block.perspectives.map((p, i) => {
          const isActive = activeTab === p.id;
          const isRead = readTabs.has(p.id);
          const colorClass = roleColors[i % roleColors.length];
          const tabIcon = resolveIcon(p.icon);

          return (
            <button
              key={p.id}
              onClick={() => handleTabClick(p.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all whitespace-nowrap snap-start
                ${isActive
                  ? `${colorClass} border-current shadow-sm`
                  : isRead
                  ? 'bg-gray-100 text-gray-600 border-gray-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {tabIcon && <span className="text-lg">{tabIcon}</span>}
              <span>{p.role}</span>
              {isRead && !isActive && <Eye className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {/* Read progress */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${(readTabs.size / block.perspectives.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{readTabs.size}/{block.perspectives.length} góc nhìn</span>
      </div>

      {/* Active perspective content */}
      {activePerspective && (
        <div className="bg-white/80 rounded-xl p-5 mb-4 border border-violet-100 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            {resolveIcon(activePerspective.icon) && (
              <span className="text-2xl">{resolveIcon(activePerspective.icon)}</span>
            )}
            <h4 className="font-bold text-gray-900">{activePerspective.role}</h4>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {renderInlineMarkdown(activePerspective.narrative)}
          </p>
        </div>
      )}

      {/* Question (unlocked only after reading all) */}
      {allRead ? (
        <div className="bg-white/60 rounded-xl p-4 border-2 border-violet-200">
          <p className="text-gray-900 font-medium mb-3">{renderInlineMarkdown(block.question.text)}</p>

          <div className="space-y-2">
            {block.question.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const showCorrect = checked && option.isCorrect;
              const showWrong = checked && isSelected && !option.isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => !checked && setSelectedAnswer(option.id)}
                  disabled={checked}
                  className={`
                    w-full p-3 text-left rounded-xl border-2 transition-all text-sm
                    ${showCorrect ? 'border-green-500 bg-green-50'
                      : showWrong ? 'border-red-500 bg-red-50'
                      : isSelected ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${checked ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${showCorrect ? 'border-green-500 bg-green-500'
                        : showWrong ? 'border-red-500 bg-red-500'
                        : isSelected ? 'border-violet-500 bg-violet-500'
                        : 'border-gray-300'}
                    `}>
                      {showCorrect && <Check className="w-3 h-3 text-white" aria-hidden="true" />}
                      {showWrong && <X className="w-3 h-3 text-white" aria-hidden="true" />}
                      {isSelected && !checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className={`${showCorrect ? 'text-green-700 font-medium' : showWrong ? 'text-red-700' : isSelected ? 'text-violet-700 font-medium' : 'text-gray-700'}`}>
                      {renderInlineMarkdown(option.text)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {!checked && selectedAnswer && (
            <button
              onClick={handleCheck}
              className="mt-3 px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
            >
              Kiểm tra
            </button>
          )}

          {checked && (
            <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`} aria-live="polite">
              <p className={`${isCorrect ? 'text-green-700' : 'text-blue-700'} leading-relaxed`}>
                <span className="font-semibold">{isCorrect ? 'Chính xác! ' : 'Giải thích: '}</span>
                {renderInlineMarkdown(block.question.explanation)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300 text-center">
          <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Đọc tất cả {block.perspectives.length} góc nhìn để mở câu hỏi</p>
        </div>
      )}
    </BlockShell>
  );
}

function Lock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

'use client';

import { useState, useMemo } from 'react';
import type { BudgetAllocatorBlock as BudgetAllocatorBlockType } from '@/lib/types/content';
import { PieChart, Minus, Plus, BarChart3, ArrowRight } from 'lucide-react';
import { useBlockInteraction } from '@/lib/hooks/useBlockInteraction';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { evaluateCondition } from '@/lib/security/safe-expr';
import BlockShell from './BlockShell';

interface Props {
  block: BudgetAllocatorBlockType;
  onComplete?: () => void;
}

function safeBoolEval(condition: string, vars: Record<string, number>): boolean {
  return evaluateCondition(condition, vars);
}

const colorMap: Record<string, { bg: string; bar: string; text: string; light: string }> = {
  blue: { bg: 'bg-blue-100', bar: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
  red: { bg: 'bg-red-100', bar: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50' },
  green: { bg: 'bg-green-100', bar: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50' },
  amber: { bg: 'bg-amber-100', bar: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50' },
  purple: { bg: 'bg-purple-100', bar: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50' },
  pink: { bg: 'bg-pink-100', bar: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-50' },
  cyan: { bg: 'bg-cyan-100', bar: 'bg-cyan-500', text: 'text-cyan-700', light: 'bg-cyan-50' },
  orange: { bg: 'bg-orange-100', bar: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50' },
};

const outcomeStyles = {
  good: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '✅' },
  neutral: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: '➡️' },
  bad: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '⚠️' },
};

export default function BudgetAllocatorBlockComponent({ block, onComplete }: Props) {
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    block.categories.forEach(cat => {
      initial[cat.id] = cat.defaultValue;
    });
    return initial;
  });
  const [submitted, setSubmitted] = useState(false);
  const { markInteracted } = useBlockInteraction(onComplete);

  const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + v, 0);
  const remaining = block.totalBudget - totalAllocated;
  const isOverBudget = remaining < 0;
  const isExact = remaining === 0;

  const step = block.totalBudget >= 100 ? Math.round(block.totalBudget / 100) : 1;

  const handleChange = (catId: string, delta: number) => {
    setAllocations(prev => {
      const newVal = Math.max(
        block.categories.find(c => c.id === catId)?.minValue || 0,
        (prev[catId] || 0) + delta
      );
      return { ...prev, [catId]: newVal };
    });
    markInteracted();
  };

  const activeOutcomes = useMemo(() => {
    if (!submitted) return [];
    return block.outcomes.filter(o => safeBoolEval(o.condition, allocations));
  }, [submitted, allocations, block.outcomes]);

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete?.();
  };

  const handleReset = () => {
    setSubmitted(false);
    const initial: Record<string, number> = {};
    block.categories.forEach(cat => {
      initial[cat.id] = cat.defaultValue;
    });
    setAllocations(initial);
  };

  return (
    <BlockShell skin="bg-gradient-to-br from-lime-50 to-green-50 border-2 border-lime-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <PieChart className="w-6 h-6 text-lime-600" aria-hidden="true" />
        <h3 className="text-lg font-bold text-gray-900">{block.title || 'Phân bổ ngân sách'}</h3>
      </div>

      {block.description && (
        <p className="text-gray-600 text-sm mb-4">{renderInlineMarkdown(block.description)}</p>
      )}

      {/* Budget bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Tổng ngân sách</span>
          <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : isExact ? 'text-green-600' : 'text-gray-600'}`}>
            Còn lại: {remaining.toLocaleString('vi-VN')} {block.unit || ''}
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          {block.categories.map(cat => {
            const pct = (allocations[cat.id] / block.totalBudget) * 100;
            const colors = colorMap[cat.color] || colorMap.blue;
            return (
              <div
                key={cat.id}
                className={`${colors.bar} transition-all duration-200 first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${Math.min(pct, 100)}%` }}
                title={`${cat.label}: ${allocations[cat.id].toLocaleString('vi-VN')}`}
              />
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3 mb-5">
        {block.categories.map(cat => {
          const colors = colorMap[cat.color] || colorMap.blue;
          const pct = ((allocations[cat.id] / block.totalBudget) * 100).toFixed(1);

          return (
            <div key={cat.id} className={`p-3 rounded-xl ${colors.light} border border-gray-100`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {cat.icon && <span className="text-lg">{cat.icon}</span>}
                  <span className={`font-medium text-sm ${colors.text}`}>{cat.label}</span>
                </div>
                <span className="text-xs text-gray-500">{pct}%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChange(cat.id, -step)}
                  disabled={submitted || allocations[cat.id] <= (cat.minValue || 0)}
                  aria-label={`Giảm ${cat.label}`}
                  className="p-2.5 sm:p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" aria-hidden="true" />
                </button>

                <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${colors.bar}`}
                    style={{ width: `${Math.min((allocations[cat.id] / block.totalBudget) * 100, 100)}%` }}
                  />
                </div>

                <button
                  onClick={() => handleChange(cat.id, step)}
                  disabled={submitted}
                  aria-label={`Tăng ${cat.label}`}
                  className="p-2.5 sm:p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" aria-hidden="true" />
                </button>

                <span className="text-sm tabular-nums font-bold text-gray-700 min-w-[64px] sm:min-w-[80px] text-right">
                  {allocations[cat.id].toLocaleString('vi-VN')}
                </span>
              </div>

              {cat.description && (
                <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={isOverBudget}
          className={`
            w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2
            ${isOverBudget
              ? 'bg-red-100 text-red-500 cursor-not-allowed'
              : 'bg-lime-600 text-white hover:bg-lime-700'
            }
          `}
        >
          {isOverBudget ? 'Vượt ngân sách!' : <>Xem kết quả <ArrowRight className="w-4 h-4" aria-hidden="true" /></>}
        </button>
      )}

      {/* Outcomes */}
      {submitted && (
        <div className="space-y-3" aria-live="polite">
          <h4 className="font-semibold text-gray-800">Kết quả phân bổ:</h4>

          {activeOutcomes.map((outcome, i) => {
            const style = outcomeStyles[outcome.variant];
            return (
              <div key={i} className={`p-4 rounded-xl border ${style.bg} ${style.border}`}>
                <p className={`font-semibold ${style.text} mb-1`}>
                  {style.icon} {outcome.title}
                </p>
                <p className={`text-sm ${style.text} leading-relaxed`}>{outcome.description}</p>
              </div>
            );
          })}

          {activeOutcomes.length === 0 && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-gray-600">Phân bổ này khá cân bằng. Hãy thử điều chỉnh để thấy các kết quả khác nhau!</p>
            </div>
          )}

          {/* Comparison */}
          {block.comparison && (
            <div className="p-4 bg-white/80 rounded-xl border border-lime-200">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-lime-600" aria-hidden="true" />
                <h5 className="font-semibold text-gray-800">So sánh: {block.comparison.label}</h5>
              </div>
              <div className="space-y-2">
                {block.categories.map(cat => {
                  const yours = allocations[cat.id];
                  const theirs = block.comparison!.values[cat.id] || 0;
                  const colors = colorMap[cat.color] || colorMap.blue;

                  return (
                    <div key={cat.id} className="text-sm">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-gray-600">{cat.label}</span>
                        <div className="flex gap-3 text-xs tabular-nums">
                          <span className="text-gray-700">Bạn: {yours.toLocaleString('vi-VN')}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">Thực tế: {theirs.toLocaleString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className={`${colors.bar} rounded-full transition-all`} style={{ width: `${(yours / block.totalBudget) * 100}%` }} />
                        <div className={`${colors.bar} opacity-30 rounded-full`} style={{ width: `${(theirs / block.totalBudget) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Thử lại với phân bổ khác
          </button>
        </div>
      )}
    </BlockShell>
  );
}

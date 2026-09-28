'use client';

import { useState, useMemo } from 'react';
import type { SliderSimulatorBlock as SliderSimulatorBlockType } from '@/lib/types/content';
import { SlidersHorizontal, AlertCircle, Lightbulb, CheckCircle } from 'lucide-react';
import { useBlockInteraction } from '@/lib/hooks/useBlockInteraction';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { evaluateExpr, evaluateCondition } from '@/lib/security/safe-expr';
import BlockShell from './BlockShell';

interface Props {
  block: SliderSimulatorBlockType;
  onComplete?: () => void;
}

/** Công thức của tác giả → số hữu hạn, hoặc 0 khi lỗi (hành vi cũ giữ nguyên). */
function safeEval(formula: string, vars: Record<string, number>): number {
  const result = evaluateExpr(formula, vars);
  return typeof result === 'number' && isFinite(result) ? result : 0;
}

function safeBoolEval(condition: string, vars: Record<string, number>): boolean {
  return evaluateCondition(condition, vars);
}

/**
 * `bar.color` từng đi thẳng vào className — tác giả chèn được `fixed inset-0 …` phủ
 * lên cả trang. Giờ chỉ nhận một lớp nền Tailwind (`bg-red-400`) hoặc mã hex
 * (`#2563eb`, áp bằng style); mọi giá trị khác rơi về màu mặc định.
 */
const BAR_CLASS = /^bg-[a-z]+-\d{2,3}$/;
const BAR_HEX = /^#[0-9a-f]{3,8}$/i;
function barClass(color: string | undefined, fallback: string): string {
  if (color && BAR_CLASS.test(color)) return color;
  return color && BAR_HEX.test(color) ? '' : fallback;
}
function barStyle(color: string | undefined): React.CSSProperties {
  return color && BAR_HEX.test(color) ? { backgroundColor: color } : {};
}

function formatOutput(value: number, format?: 'number' | 'percent' | 'currency'): string {
  switch (format) {
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return value.toLocaleString('vi-VN') + ' VNĐ';
    default:
      return value.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  }
}

export default function SliderSimulatorBlockComponent({ block, onComplete }: Props) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    block.sliders.forEach(s => {
      initial[s.id] = s.defaultValue;
    });
    return initial;
  });
  const { markInteracted } = useBlockInteraction(onComplete);

  const outputs = useMemo(() => {
    return block.outputs.map(o => ({
      ...o,
      computedValue: safeEval(o.formula, values),
    }));
  }, [values, block.outputs]);

  const chartBars = useMemo(() => {
    if (!block.chart) return null;
    return block.chart.bars.map(bar => ({
      ...bar,
      computedValue: safeEval(bar.formula, values),
    }));
  }, [values, block.chart]);

  const activeBreakpoints = useMemo(() => {
    if (!block.breakpoints) return [];
    return block.breakpoints.filter(bp => safeBoolEval(bp.condition, values));
  }, [values, block.breakpoints]);

  const handleSliderChange = (id: string, value: number) => {
    setValues(prev => ({ ...prev, [id]: value }));
    markInteracted();
  };

  const maxBarValue = chartBars ? Math.max(...chartBars.map(b => Math.abs(b.computedValue)), 1) : 1;

  const breakpointIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    info: Lightbulb,
    warning: AlertCircle,
    success: CheckCircle,
  };
  const breakpointColors: Record<string, { bg: string; border: string; text: string }> = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  };

  return (
    <BlockShell skin="bg-gradient-to-br from-sky-50 to-indigo-50 border-2 border-sky-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-6 h-6 text-sky-600" aria-hidden="true" />
        <h3 className="text-lg font-bold text-gray-900">{block.title || 'Mô phỏng'}</h3>
      </div>

      {block.description && (
        <p className="text-gray-600 text-sm mb-4">{renderInlineMarkdown(block.description)}</p>
      )}

      {/* Sliders */}
      <div className="space-y-4 mb-6">
        {block.sliders.map(slider => (
          <div key={slider.id}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">{slider.label}</label>
              <span className="text-sm font-bold tabular-nums text-sky-700">
                {(values[slider.id] ?? slider.defaultValue).toLocaleString('vi-VN')}{slider.unit ? ` ${slider.unit}` : ''}
              </span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={values[slider.id]}
              onChange={e => handleSliderChange(slider.id, parseFloat(e.target.value))}
              aria-label={slider.label}
              className="range-touch w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600 text-sky-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>{slider.min.toLocaleString('vi-VN')}{slider.unit ? ` ${slider.unit}` : ''}</span>
              <span>{slider.max.toLocaleString('vi-VN')}{slider.unit ? ` ${slider.unit}` : ''}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {outputs.map(output => (
          <div key={output.id} className="bg-white/80 rounded-xl p-3 border border-sky-100">
            <p className="text-xs text-gray-500">{output.label}</p>
            <p className="text-xl font-bold tabular-nums text-gray-900">
              {formatOutput(output.computedValue, output.format)}
              {output.unit && <span className="text-sm text-gray-500 ml-1">{output.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {chartBars && (
        <div className="bg-white/80 rounded-xl p-4 border border-sky-100 mb-4">
          <div className="space-y-3">
            {chartBars.map((bar, i) => {
              const widthPct = (Math.abs(bar.computedValue) / maxBarValue) * 100;
              const colors = ['bg-sky-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500'];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{bar.label}</span>
                    <span className="text-xs tabular-nums text-gray-700">
                      {bar.computedValue.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                    </span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all duration-300 ${barClass(bar.color, colors[i % colors.length])}`}
                      style={{ width: `${Math.min(widthPct, 100)}%`, ...barStyle(bar.color) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakpoint callouts */}
      <div aria-live="polite">
      {activeBreakpoints.map((bp, i) => {
        const colors = breakpointColors[bp.variant] || breakpointColors.info;
        const Icon = breakpointIcons[bp.variant] || Lightbulb;
        return (
          <div key={i} className={`p-3 rounded-xl border ${colors.bg} ${colors.border} mb-2 animate-fade-in`}>
            <div className="flex items-start gap-2">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.text}`} aria-hidden="true" />
              <p className={`text-sm leading-relaxed ${colors.text}`}>{bp.message}</p>
            </div>
          </div>
        );
      })}
      </div>
    </BlockShell>
  );
}

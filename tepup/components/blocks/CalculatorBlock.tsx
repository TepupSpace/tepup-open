'use client';

import { useState, useMemo } from 'react';
import type { CalculatorBlock as CalculatorBlockType } from '@/lib/types/content';
import { Calculator, Lightbulb, Zap } from 'lucide-react';
import { useBlockInteraction } from '@/lib/hooks/useBlockInteraction';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { evaluateExpr } from '@/lib/security/safe-expr';
import BlockShell from './BlockShell';

interface Props {
  block: CalculatorBlockType;
  onComplete?: () => void;
}

/** Công thức của tác giả → số hữu hạn, hoặc 0 khi lỗi (hành vi cũ giữ nguyên). */
function safeEval(formula: string, vars: Record<string, number>): number {
  const result = evaluateExpr(formula, vars);
  return typeof result === 'number' && isFinite(result) ? result : 0;
}

function formatValue(value: number, unit?: string): string {
  const formatted = value.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
  return unit ? `${formatted} ${unit}` : formatted;
}

export default function CalculatorBlockComponent({ block, onComplete }: Props) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    block.inputs.forEach(input => {
      initial[input.id] = input.defaultValue;
    });
    return initial;
  });
  const { hasInteracted, markInteracted } = useBlockInteraction(onComplete);

  const outputs = useMemo(() => {
    return block.outputs.map(output => ({
      ...output,
      computedValue: safeEval(output.formula, values),
    }));
  }, [values, block.outputs]);

  const handleChange = (inputId: string, value: number) => {
    setValues(prev => ({ ...prev, [inputId]: value }));
    markInteracted();
  };

  const handlePreset = (presetValues: Record<string, number>) => {
    setValues(prev => ({ ...prev, ...presetValues }));
    markInteracted();
  };

  return (
    <BlockShell skin="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-6 h-6 text-cyan-600" aria-hidden="true" />
        <h3 className="text-lg font-bold text-gray-900">{block.title || 'Máy tính'}</h3>
      </div>

      {block.description && (
        <p className="text-gray-600 text-sm mb-4">{renderInlineMarkdown(block.description)}</p>
      )}

      {/* Presets */}
      {block.presets && block.presets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-gray-500 self-center">Thử nhanh:</span>
          {block.presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => handlePreset(preset.values)}
              className="px-3 py-1.5 bg-white border border-cyan-200 text-cyan-700 rounded-lg text-sm font-medium hover:bg-cyan-50 transition-colors"
            >
              <Zap className="w-3 h-3 inline mr-1" aria-hidden="true" />
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nhập liệu</h4>
          {block.inputs.map(input => (
            <div key={input.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {input.label}
                {input.unit && <span className="text-gray-400 ml-1">({input.unit})</span>}
              </label>
              {input.type === 'select' && input.options ? (
                <select
                  value={values[input.id]}
                  onChange={e => handleChange(input.id, parseFloat(e.target.value))}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none bg-white"
                >
                  {input.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={values[input.id]}
                  onChange={e => handleChange(input.id, parseFloat(e.target.value) || 0)}
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none tabular-nums"
                />
              )}
            </div>
          ))}
        </div>

        {/* Outputs */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Kết quả</h4>
          {outputs.map(output => (
            <div
              key={output.id}
              className={`p-3 rounded-xl transition-all ${
                output.highlight
                  ? 'bg-cyan-100 border-2 border-cyan-300'
                  : 'bg-white/80 border border-gray-200'
              }`}
            >
              <p className="text-sm text-gray-600">{output.label}</p>
              <p className={`font-bold tabular-nums ${output.highlight ? 'text-2xl text-cyan-800' : 'text-xl text-gray-900'}`}>
                {formatValue(output.computedValue, output.unit)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Insight */}
      {block.insight && hasInteracted && (
        <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-xl" aria-live="polite">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-cyan-800 text-sm leading-relaxed">{renderInlineMarkdown(block.insight)}</p>
          </div>
        </div>
      )}
    </BlockShell>
  );
}

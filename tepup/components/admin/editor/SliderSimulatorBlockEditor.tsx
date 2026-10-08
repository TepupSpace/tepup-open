'use client';

import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SliderSimulatorBlock } from './BlockEditor';

interface Props {
  block: SliderSimulatorBlock;
  onChange: (block: SliderSimulatorBlock) => void;
}

export default function SliderSimulatorBlockEditor({ block, onChange }: Props) {
  const uid = useId();

  // --- Sliders ---
  function addSlider() {
    const id = `slider${Date.now()}`;
    onChange({
      ...block,
      sliders: [
        ...block.sliders,
        { id, label: '', min: 0, max: 100, step: 1, defaultValue: 50, unit: '' },
      ],
    });
  }

  function updateSlider(index: number, field: string, value: string | number) {
    const sliders = block.sliders.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    );
    onChange({ ...block, sliders });
  }

  function removeSlider(index: number) {
    if (block.sliders.length <= 1) return;
    onChange({ ...block, sliders: block.sliders.filter((_, i) => i !== index) });
  }

  // --- Outputs ---
  function addOutput() {
    const id = `out${Date.now()}`;
    onChange({
      ...block,
      outputs: [...block.outputs, { id, label: '', formula: '', unit: '', format: 'number' }],
    });
  }

  function updateOutput(index: number, field: string, value: string) {
    const outputs = block.outputs.map((o, i) =>
      i === index ? { ...o, [field]: value } : o,
    );
    onChange({ ...block, outputs });
  }

  function removeOutput(index: number) {
    if (block.outputs.length <= 1) return;
    onChange({ ...block, outputs: block.outputs.filter((_, i) => i !== index) });
  }

  // --- Chart bars ---
  function addBar() {
    const bars = [...(block.chart?.bars ?? []), { label: '', formula: '', color: 'bg-blue-500' }];
    onChange({ ...block, chart: { type: 'bar', ...(block.chart ?? {}), bars } });
  }

  function updateBar(index: number, field: string, value: string) {
    const bars = (block.chart?.bars ?? []).map((b, i) =>
      i === index ? { ...b, [field]: value } : b,
    );
    onChange({ ...block, chart: { type: 'bar', ...(block.chart ?? {}), bars } });
  }

  function removeBar(index: number) {
    const bars = (block.chart?.bars ?? []).filter((_, i) => i !== index);
    onChange({ ...block, chart: { type: 'bar', ...(block.chart ?? {}), bars } });
  }

  // --- Breakpoints ---
  function addBreakpoint() {
    onChange({
      ...block,
      breakpoints: [
        ...(block.breakpoints ?? []),
        { condition: '', message: '', variant: 'info' },
      ],
    });
  }

  function updateBreakpoint(index: number, field: string, value: string) {
    const breakpoints = (block.breakpoints ?? []).map((bp, i) =>
      i === index ? { ...bp, [field]: value } : bp,
    );
    onChange({ ...block, breakpoints });
  }

  function removeBreakpoint(index: number) {
    onChange({ ...block, breakpoints: (block.breakpoints ?? []).filter((_, i) => i !== index) });
  }

  const hasChart = !!block.chart;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor={`${uid}-title`} className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-title`}
          type="text"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="VD: Đường cong Laffer — Thuế suất vs Thu ngân sách"
          aria-required="true"
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor={`${uid}-description`} className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          id={`${uid}-description`}
          value={block.description ?? ''}
          onChange={(e) => onChange({ ...block, description: e.target.value || undefined })}
          placeholder="Hướng dẫn cho người học..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Sliders */}
      <div role="group" aria-labelledby={`${uid}-sliders`}>
        <p id={`${uid}-sliders`} className="block text-sm font-medium text-gray-700 mb-2">
          Thanh trượt (sliders) <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">(bắt buộc)</span>
        </p>
        <div className="space-y-3">
          {block.sliders.map((s, index) => (
            <div
              key={index} // not the id: it is edited in this row, and re-keying would drop focus
              role="group"
              aria-label={`Thanh trượt ${index + 1}`}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={s.id}
                  onChange={(e) => updateSlider(index, 'id', e.target.value)}
                  placeholder="id (VD: taxRate)"
                  aria-label={`id thanh trượt ${index + 1}`}
                  className="w-28 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => updateSlider(index, 'label', e.target.value)}
                  placeholder="Nhãn"
                  aria-label={`Nhãn thanh trượt ${index + 1}`}
                  className="flex-1 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={s.unit ?? ''}
                  onChange={(e) => updateSlider(index, 'unit', e.target.value)}
                  placeholder="Đơn vị"
                  aria-label={`Đơn vị thanh trượt ${index + 1}`}
                  className="w-20 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {block.sliders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlider(index)}
                    aria-label={`Xoá thanh trượt ${index + 1}`}
                    className="p-1.5 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['min', 'max', 'step', 'defaultValue'] as const).map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={`${uid}-slider-${index}-${field}`}
                      lang="en"
                      className="block text-xs text-gray-500 mb-0.5"
                    >
                      {field}
                    </label>
                    <input
                      id={`${uid}-slider-${index}-${field}`}
                      type="number"
                      value={s[field] ?? 0}
                      onChange={(e) => updateSlider(index, field, Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSlider}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm slider</span>
        </button>
      </div>

      {/* Outputs */}
      <div role="group" aria-labelledby={`${uid}-outputs`}>
        <p id={`${uid}-outputs`} className="block text-sm font-medium text-gray-700 mb-2">
          Đầu ra (outputs) <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">(bắt buộc)</span>
        </p>
        <div className="space-y-2">
          {block.outputs.map((out, index) => (
            <div
              key={index} // not the id: it is edited in this row, and re-keying would drop focus
              role="group"
              aria-label={`Đầu ra ${index + 1}`}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={out.id}
                  onChange={(e) => updateOutput(index, 'id', e.target.value)}
                  placeholder="id"
                  aria-label={`id đầu ra ${index + 1}`}
                  className="w-24 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <input
                  type="text"
                  value={out.label}
                  onChange={(e) => updateOutput(index, 'label', e.target.value)}
                  placeholder="Nhãn"
                  aria-label={`Nhãn đầu ra ${index + 1}`}
                  className="flex-1 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={out.unit ?? ''}
                  onChange={(e) => updateOutput(index, 'unit', e.target.value)}
                  placeholder="Đơn vị"
                  aria-label={`Đơn vị đầu ra ${index + 1}`}
                  className="w-20 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <select
                  value={out.format ?? 'number'}
                  onChange={(e) => updateOutput(index, 'format', e.target.value)}
                  aria-label={`Định dạng đầu ra ${index + 1}`}
                  className="w-28 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="number">Số</option>
                  <option value="percent">Phần trăm</option>
                  <option value="currency">Tiền tệ</option>
                </select>
                {block.outputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOutput(index)}
                    aria-label={`Xoá đầu ra ${index + 1}`}
                    className="p-1.5 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={out.formula}
                onChange={(e) => updateOutput(index, 'formula', e.target.value)}
                placeholder="Công thức (VD: taxRate * (100 - taxRate) * 0.4)"
                aria-label={`Công thức đầu ra ${index + 1}`}
                className="w-full px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOutput}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm output</span>
        </button>
      </div>

      {/* Chart (optional) */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <span id={`${uid}-chart`} className="text-sm font-medium text-gray-700">Biểu đồ (tùy chọn)</span>
          {/* On/off switch: the name comes from the heading, the state from aria-checked
              (visible Bật/Tắt text is hidden from AT so it isn't read twice). */}
          <button
            type="button"
            role="switch"
            aria-checked={hasChart}
            aria-labelledby={`${uid}-chart`}
            onClick={() => {
              if (hasChart) {
                onChange({ ...block, chart: undefined });
              } else {
                onChange({ ...block, chart: { type: 'bar', bars: [] } });
              }
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              hasChart
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span aria-hidden="true">{hasChart ? 'Bật ✓' : 'Tắt'}</span>
          </button>
        </div>
        {hasChart && (
          <div role="group" aria-labelledby={`${uid}-bars`} className="space-y-2">
            <div id={`${uid}-bars`} className="text-xs text-gray-500 mb-2">Các thanh biểu đồ:</div>
            {(block.chart?.bars ?? []).map((bar, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={bar.label}
                  onChange={(e) => updateBar(index, 'label', e.target.value)}
                  placeholder="Nhãn thanh"
                  aria-label={`Nhãn thanh ${index + 1}`}
                  className="flex-1 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={bar.formula}
                  onChange={(e) => updateBar(index, 'formula', e.target.value)}
                  placeholder="Công thức"
                  aria-label={`Công thức thanh ${index + 1}`}
                  className="flex-1 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <input
                  type="text"
                  value={bar.color ?? 'bg-blue-500'}
                  onChange={(e) => updateBar(index, 'color', e.target.value)}
                  placeholder="bg-blue-500"
                  aria-label={`Màu thanh ${index + 1} (class Tailwind)`}
                  className="w-28 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => removeBar(index)}
                  aria-label={`Xoá thanh ${index + 1}`}
                  className="p-1.5 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addBar}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Thêm thanh</span>
            </button>
          </div>
        )}
      </div>

      {/* Breakpoints */}
      <div role="group" aria-labelledby={`${uid}-breakpoints`}>
        <p id={`${uid}-breakpoints`} className="block text-sm font-medium text-gray-700 mb-2">
          Breakpoints (thông điệp theo ngưỡng)
        </p>
        <div className="space-y-2">
          {(block.breakpoints ?? []).map((bp, index) => (
            <div
              key={index}
              role="group"
              aria-label={`Breakpoint ${index + 1}`}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={bp.condition}
                    onChange={(e) => updateBreakpoint(index, 'condition', e.target.value)}
                    placeholder="Điều kiện (VD: taxRate <= 10)"
                    aria-label={`Điều kiện breakpoint ${index + 1}`}
                    className="w-full px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                  <textarea
                    value={bp.message}
                    onChange={(e) => updateBreakpoint(index, 'message', e.target.value)}
                    placeholder="Thông điệp hiển thị..."
                    rows={2}
                    aria-label={`Thông điệp breakpoint ${index + 1}`}
                    className="w-full px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                  <select
                    value={bp.variant ?? 'info'}
                    onChange={(e) => updateBreakpoint(index, 'variant', e.target.value)}
                    aria-label={`Kiểu thông điệp breakpoint ${index + 1}`}
                    className="px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeBreakpoint(index)}
                  aria-label={`Xoá breakpoint ${index + 1}`}
                  className="p-1.5 text-gray-500 hover:text-red-600 shrink-0"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBreakpoint}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm breakpoint</span>
        </button>
      </div>
    </div>
  );
}

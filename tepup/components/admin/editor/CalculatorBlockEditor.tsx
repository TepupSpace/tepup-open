'use client';

import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CalculatorBlock } from './BlockEditor';

interface Props {
  block: CalculatorBlock;
  onChange: (block: CalculatorBlock) => void;
}

export default function CalculatorBlockEditor({ block, onChange }: Props) {
  const uid = useId();

  // --- Inputs ---
  function addInput() {
    const id = `input${Date.now()}`;
    onChange({
      ...block,
      inputs: [
        ...block.inputs,
        { id, label: '', type: 'number', unit: '', defaultValue: 0, min: 0, max: 100, step: 1 },
      ],
    });
  }

  function updateInput(index: number, field: string, value: string | number) {
    const inputs = block.inputs.map((inp, i) =>
      i === index ? { ...inp, [field]: value } : inp,
    );
    onChange({ ...block, inputs });
  }

  function removeInput(index: number) {
    if (block.inputs.length <= 1) return;
    onChange({ ...block, inputs: block.inputs.filter((_, i) => i !== index) });
  }

  // --- Outputs ---
  function addOutput() {
    const id = `output${Date.now()}`;
    onChange({
      ...block,
      outputs: [...block.outputs, { id, label: '', formula: '', unit: '' }],
    });
  }

  function updateOutput(index: number, field: string, value: string | boolean) {
    const outputs = block.outputs.map((out, i) =>
      i === index ? { ...out, [field]: value } : out,
    );
    onChange({ ...block, outputs });
  }

  function removeOutput(index: number) {
    if (block.outputs.length <= 1) return;
    onChange({ ...block, outputs: block.outputs.filter((_, i) => i !== index) });
  }

  // --- Presets ---
  function addPreset() {
    onChange({
      ...block,
      presets: [...(block.presets ?? []), { label: '', values: {} }],
    });
  }

  function updatePresetLabel(index: number, label: string) {
    const presets = (block.presets ?? []).map((p, i) =>
      i === index ? { ...p, label } : p,
    );
    onChange({ ...block, presets });
  }

  function updatePresetValues(index: number, json: string) {
    try {
      const values = JSON.parse(json);
      const presets = (block.presets ?? []).map((p, i) =>
        i === index ? { ...p, values } : p,
      );
      onChange({ ...block, presets });
    } catch {
      // invalid JSON — ignore until valid
    }
  }

  function removePreset(index: number) {
    onChange({ ...block, presets: (block.presets ?? []).filter((_, i) => i !== index) });
  }

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
          placeholder="VD: Tính thuế thu nhập cá nhân"
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
          placeholder="Hướng dẫn ngắn cho người học..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Calculator type */}
      <div>
        <label htmlFor={`${uid}-type`} className="block text-sm font-medium text-gray-700 mb-1">Loại máy tính</label>
        <select
          id={`${uid}-type`}
          value={block.calculatorType ?? 'custom'}
          onChange={(e) => onChange({ ...block, calculatorType: e.target.value as CalculatorBlock['calculatorType'] })}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="custom">Tùy chỉnh</option>
          <option value="tax">Thuế (tax)</option>
          <option value="compound-interest">Lãi kép (compound-interest)</option>
          <option value="inflation">Lạm phát (inflation)</option>
        </select>
      </div>

      {/* Inputs */}
      <div role="group" aria-labelledby={`${uid}-inputs`}>
        <p id={`${uid}-inputs`} className="block text-sm font-medium text-gray-700 mb-2">
          Đầu vào (inputs) <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">(bắt buộc)</span>
        </p>
        <div className="space-y-3">
          {block.inputs.map((inp, index) => (
            <div
              key={index} // not inp.id: the id is edited below, and re-keying would drop focus
              role="group"
              aria-label={`Đầu vào ${index + 1}`}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inp.id}
                  onChange={(e) => updateInput(index, 'id', e.target.value)}
                  placeholder="id (VD: income)"
                  aria-label={`id đầu vào ${index + 1}`}
                  className="w-28 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <input
                  type="text"
                  value={inp.label}
                  onChange={(e) => updateInput(index, 'label', e.target.value)}
                  placeholder="Nhãn hiển thị"
                  aria-label={`Nhãn hiển thị đầu vào ${index + 1}`}
                  className="flex-1 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={inp.unit ?? ''}
                  onChange={(e) => updateInput(index, 'unit', e.target.value)}
                  placeholder="Đơn vị"
                  aria-label={`Đơn vị đầu vào ${index + 1}`}
                  className="w-24 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {block.inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    aria-label={`Xoá đầu vào ${index + 1}`}
                    className="p-1.5 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {(['defaultValue', 'min', 'max', 'step'] as const).map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={`${uid}-input-${index}-${field}`}
                      lang="en"
                      className="block text-xs text-gray-500 mb-0.5"
                    >
                      {field}
                    </label>
                    <input
                      id={`${uid}-input-${index}-${field}`}
                      type="number"
                      value={(inp as Record<string, number | string>)[field] ?? 0}
                      onChange={(e) => updateInput(index, field, Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addInput}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm input</span>
        </button>
      </div>

      {/* Formula */}
      <div>
        <label htmlFor={`${uid}-formula`} className="block text-sm font-medium text-gray-700 mb-1">
          Công thức chính (formula)
        </label>
        <input
          id={`${uid}-formula`}
          type="text"
          value={block.formula ?? ''}
          onChange={(e) => onChange({ ...block, formula: e.target.value })}
          placeholder="VD: income - 11 - dependents * 4.4"
          aria-describedby={`${uid}-formula-hint`}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p id={`${uid}-formula-hint`} className="text-xs text-gray-500 mt-1">Dùng id của inputs làm biến (VD: income, dependents)</p>
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
                  className="w-28 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <input
                  type="text"
                  value={out.label}
                  onChange={(e) => updateOutput(index, 'label', e.target.value)}
                  placeholder="Nhãn hiển thị"
                  aria-label={`Nhãn hiển thị đầu ra ${index + 1}`}
                  className="flex-1 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={out.unit ?? ''}
                  onChange={(e) => updateOutput(index, 'unit', e.target.value)}
                  placeholder="Đơn vị"
                  aria-label={`Đơn vị đầu ra ${index + 1}`}
                  className="w-24 px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
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
                placeholder="Công thức (VD: Math.max(0, income - 11))"
                aria-label={`Công thức đầu ra ${index + 1}`}
                className="w-full px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={out.highlight ?? false}
                  onChange={(e) => updateOutput(index, 'highlight', e.target.checked)}
                  className="rounded"
                />
                Highlight (làm nổi bật kết quả này)
              </label>
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

      {/* Presets */}
      <div role="group" aria-labelledby={`${uid}-presets`}>
        <p id={`${uid}-presets`} className="block text-sm font-medium text-gray-700 mb-2">
          Presets (giá trị mẫu nhanh)
        </p>
        <div className="space-y-2">
          {(block.presets ?? []).map((preset, index) => (
            <div
              key={index}
              role="group"
              aria-label={`Preset ${index + 1}`}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={preset.label}
                  onChange={(e) => updatePresetLabel(index, e.target.value)}
                  placeholder="Tên preset (VD: Sinh viên mới ra trường)"
                  aria-label={`Tên preset ${index + 1}`}
                  className="flex-1 px-3 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removePreset(index)}
                  aria-label={`Xoá preset ${index + 1}`}
                  className="p-1.5 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div>
                <label htmlFor={`${uid}-preset-${index}-values`} className="block text-xs text-gray-500 mb-0.5">
                  Giá trị (JSON): {`{ "inputId": value, ... }`}
                </label>
                <input
                  id={`${uid}-preset-${index}-values`}
                  type="text"
                  defaultValue={JSON.stringify(preset.values)}
                  onBlur={(e) => updatePresetValues(index, e.target.value)}
                  placeholder={`{ "income": 10, "dependents": 0 }`}
                  className="w-full px-2 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPreset}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm preset</span>
        </button>
      </div>

      {/* Insight */}
      <div>
        <label htmlFor={`${uid}-insight`} className="block text-sm font-medium text-gray-700 mb-1">
          Insight / Bình luận sau kết quả
        </label>
        <textarea
          id={`${uid}-insight`}
          value={block.insight ?? ''}
          onChange={(e) => onChange({ ...block, insight: e.target.value || undefined })}
          placeholder="Nhận xét / phân tích hiển thị sau kết quả tính toán..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

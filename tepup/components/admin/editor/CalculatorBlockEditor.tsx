'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { CalculatorBlock } from './BlockEditor';

interface Props {
  block: CalculatorBlock;
  onChange: (block: CalculatorBlock) => void;
}

export default function CalculatorBlockEditor({ block, onChange }: Props) {
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="VD: Tính thuế thu nhập cá nhân"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          value={block.description ?? ''}
          onChange={(e) => onChange({ ...block, description: e.target.value || undefined })}
          placeholder="Hướng dẫn ngắn cho người học..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Calculator type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Loại máy tính</label>
        <select
          value={block.calculatorType ?? 'custom'}
          onChange={(e) => onChange({ ...block, calculatorType: e.target.value as CalculatorBlock['calculatorType'] })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="custom">Tùy chỉnh</option>
          <option value="tax">Thuế (tax)</option>
          <option value="compound-interest">Lãi kép (compound-interest)</option>
          <option value="inflation">Lạm phát (inflation)</option>
        </select>
      </div>

      {/* Inputs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đầu vào (inputs) <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {block.inputs.map((inp, index) => (
            <div key={inp.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inp.id}
                  onChange={(e) => updateInput(index, 'id', e.target.value)}
                  placeholder="id (VD: income)"
                  className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <input
                  type="text"
                  value={inp.label}
                  onChange={(e) => updateInput(index, 'label', e.target.value)}
                  placeholder="Nhãn hiển thị"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={inp.unit ?? ''}
                  onChange={(e) => updateInput(index, 'unit', e.target.value)}
                  placeholder="Đơn vị"
                  className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {block.inputs.length > 1 && (
                  <button onClick={() => removeInput(index)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {(['defaultValue', 'min', 'max', 'step'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-0.5">{field}</label>
                    <input
                      type="number"
                      value={(inp as Record<string, number | string>)[field] ?? 0}
                      onChange={(e) => updateInput(index, field, Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addInput}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm input</span>
        </button>
      </div>

      {/* Formula */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Công thức chính (formula)
        </label>
        <input
          type="text"
          value={block.formula ?? ''}
          onChange={(e) => onChange({ ...block, formula: e.target.value })}
          placeholder="VD: income - 11 - dependents * 4.4"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">Dùng id của inputs làm biến (VD: income, dependents)</p>
      </div>

      {/* Outputs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đầu ra (outputs) <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {block.outputs.map((out, index) => (
            <div key={out.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={out.id}
                  onChange={(e) => updateOutput(index, 'id', e.target.value)}
                  placeholder="id"
                  className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <input
                  type="text"
                  value={out.label}
                  onChange={(e) => updateOutput(index, 'label', e.target.value)}
                  placeholder="Nhãn hiển thị"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={out.unit ?? ''}
                  onChange={(e) => updateOutput(index, 'unit', e.target.value)}
                  placeholder="Đơn vị"
                  className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {block.outputs.length > 1 && (
                  <button onClick={() => removeOutput(index)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={out.formula}
                onChange={(e) => updateOutput(index, 'formula', e.target.value)}
                placeholder="Công thức (VD: Math.max(0, income - 11))"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
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
          onClick={addOutput}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm output</span>
        </button>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Presets (giá trị mẫu nhanh)
        </label>
        <div className="space-y-2">
          {(block.presets ?? []).map((preset, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={preset.label}
                  onChange={(e) => updatePresetLabel(index, e.target.value)}
                  placeholder="Tên preset (VD: Sinh viên mới ra trường)"
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button onClick={() => removePreset(index)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">
                  Giá trị (JSON): {`{ "inputId": value, ... }`}
                </label>
                <input
                  type="text"
                  defaultValue={JSON.stringify(preset.values)}
                  onBlur={(e) => updatePresetValues(index, e.target.value)}
                  placeholder={`{ "income": 10, "dependents": 0 }`}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addPreset}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm preset</span>
        </button>
      </div>

      {/* Insight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Insight / Bình luận sau kết quả
        </label>
        <textarea
          value={block.insight ?? ''}
          onChange={(e) => onChange({ ...block, insight: e.target.value || undefined })}
          placeholder="Nhận xét / phân tích hiển thị sau kết quả tính toán..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

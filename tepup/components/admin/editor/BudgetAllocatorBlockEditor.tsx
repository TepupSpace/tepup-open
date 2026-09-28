'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { BudgetAllocatorBlock } from './BlockEditor';

interface Props {
  block: BudgetAllocatorBlock;
  onChange: (block: BudgetAllocatorBlock) => void;
}

const COLOR_OPTIONS = ['blue', 'green', 'red', 'amber', 'purple', 'cyan', 'orange', 'pink'];

export default function BudgetAllocatorBlockEditor({ block, onChange }: Props) {
  // --- Categories ---
  function addCategory() {
    const id = `cat${Date.now()}`;
    onChange({
      ...block,
      categories: [
        ...block.categories,
        { id, label: '', icon: '📌', color: 'blue', defaultValue: 10, minValue: 0, description: '' },
      ],
    });
  }

  function updateCategory(index: number, field: string, value: string | number) {
    const categories = block.categories.map((c, i) =>
      i === index ? { ...c, [field]: value } : c,
    );
    onChange({ ...block, categories });
  }

  function removeCategory(index: number) {
    if (block.categories.length <= 2) return;
    onChange({ ...block, categories: block.categories.filter((_, i) => i !== index) });
  }

  // --- Outcomes ---
  function addOutcome() {
    onChange({
      ...block,
      outcomes: [
        ...(block.outcomes ?? []),
        { condition: '', title: '', description: '', variant: 'neutral' },
      ],
    });
  }

  function updateOutcome(index: number, field: string, value: string) {
    const outcomes = (block.outcomes ?? []).map((o, i) =>
      i === index ? { ...o, [field]: value } : o,
    );
    onChange({ ...block, outcomes });
  }

  function removeOutcome(index: number) {
    onChange({ ...block, outcomes: (block.outcomes ?? []).filter((_, i) => i !== index) });
  }

  // --- Comparison ---
  const hasComparison = !!block.comparison;

  function updateComparisonLabel(label: string) {
    onChange({ ...block, comparison: { label, values: block.comparison?.values ?? {} } });
  }

  function updateComparisonValues(json: string) {
    try {
      const values = JSON.parse(json);
      onChange({ ...block, comparison: { label: block.comparison?.label ?? '', values } });
    } catch {
      // ignore invalid JSON
    }
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
          placeholder="VD: Phân bổ ngân sách quốc gia"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Kịch bản</label>
        <textarea
          value={block.description ?? ''}
          onChange={(e) => onChange({ ...block, description: e.target.value || undefined })}
          placeholder="VD: Bạn là Thủ tướng với 100 tỷ VNĐ. Hãy phân bổ cho các lĩnh vực — và xem hệ quả!"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Budget + Unit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tổng ngân sách <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={block.totalBudget}
            min={1}
            onChange={(e) => onChange({ ...block, totalBudget: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
          <input
            type="text"
            value={block.unit ?? ''}
            onChange={(e) => onChange({ ...block, unit: e.target.value || undefined })}
            placeholder="VD: tỷ VNĐ, điểm"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục phân bổ <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {block.categories.map((cat, index) => (
            <div key={cat.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cat.icon ?? ''}
                  onChange={(e) => updateCategory(index, 'icon', e.target.value)}
                  placeholder="Icon"
                  className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={cat.id}
                  onChange={(e) => updateCategory(index, 'id', e.target.value)}
                  placeholder="id (VD: education)"
                  className="w-32 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <input
                  type="text"
                  value={cat.label}
                  onChange={(e) => updateCategory(index, 'label', e.target.value)}
                  placeholder="Nhãn"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <select
                  value={cat.color ?? 'blue'}
                  onChange={(e) => updateCategory(index, 'color', e.target.value)}
                  className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {block.categories.length > 2 && (
                  <button onClick={() => removeCategory(index)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Giá trị mặc định</label>
                  <input
                    type="number"
                    value={cat.defaultValue ?? 0}
                    min={0}
                    onChange={(e) => updateCategory(index, 'defaultValue', Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Giá trị tối thiểu</label>
                  <input
                    type="number"
                    value={cat.minValue ?? 0}
                    min={0}
                    onChange={(e) => updateCategory(index, 'minValue', Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <input
                type="text"
                value={cat.description ?? ''}
                onChange={(e) => updateCategory(index, 'description', e.target.value)}
                placeholder="Mô tả ngắn danh mục..."
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addCategory}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Outcomes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kết quả (outcomes) theo điều kiện
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Điều kiện dùng id của danh mục làm biến (VD: <code>education &gt;= 30</code>)
        </p>
        <div className="space-y-2">
          {(block.outcomes ?? []).map((outcome, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={outcome.condition}
                    onChange={(e) => updateOutcome(index, 'condition', e.target.value)}
                    placeholder="Điều kiện (VD: education >= 30)"
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                  <input
                    type="text"
                    value={outcome.title}
                    onChange={(e) => updateOutcome(index, 'title', e.target.value)}
                    placeholder="Tiêu đề kết quả"
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <textarea
                    value={outcome.description}
                    onChange={(e) => updateOutcome(index, 'description', e.target.value)}
                    placeholder="Mô tả kết quả..."
                    rows={2}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                  <select
                    value={outcome.variant ?? 'neutral'}
                    onChange={(e) => updateOutcome(index, 'variant', e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="good">Tốt (good)</option>
                    <option value="bad">Xấu (bad)</option>
                    <option value="neutral">Trung lập (neutral)</option>
                  </select>
                </div>
                <button onClick={() => removeOutcome(index)} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addOutcome}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm kết quả</span>
        </button>
      </div>

      {/* Comparison (optional) */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">So sánh với thực tế (tùy chọn)</label>
          <button
            onClick={() => {
              if (hasComparison) {
                onChange({ ...block, comparison: undefined });
              } else {
                onChange({ ...block, comparison: { label: '', values: {} } });
              }
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              hasComparison
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {hasComparison ? 'Bật ✓' : 'Tắt'}
          </button>
        </div>
        {hasComparison && (
          <div className="space-y-2">
            <input
              type="text"
              value={block.comparison?.label ?? ''}
              onChange={(e) => updateComparisonLabel(e.target.value)}
              placeholder="Nhãn so sánh (VD: Ngân sách VN 2023)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">
                Giá trị JSON: {`{ "categoryId": value, ... }`}
              </label>
              <input
                type="text"
                defaultValue={JSON.stringify(block.comparison?.values ?? {})}
                onBlur={(e) => updateComparisonValues(e.target.value)}
                placeholder={`{ "education": 20, "health": 15 }`}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

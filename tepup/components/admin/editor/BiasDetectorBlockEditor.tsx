'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { BiasDetectorBlock } from './BlockEditor';

interface Props {
  block: BiasDetectorBlock;
  onChange: (block: BiasDetectorBlock) => void;
}

export default function BiasDetectorBlockEditor({ block, onChange }: Props) {
  // --- Bias options ---
  function addBiasOption() {
    const id = `bias${Date.now()}`;
    onChange({
      ...block,
      biasOptions: [...block.biasOptions, { id, label: '' }],
    });
  }

  function updateBiasOption(index: number, field: 'id' | 'label', value: string) {
    const biasOptions = block.biasOptions.map((o, i) =>
      i === index ? { ...o, [field]: value } : o,
    );
    onChange({ ...block, biasOptions });
  }

  function removeBiasOption(index: number) {
    if (block.biasOptions.length <= 1) return;
    onChange({ ...block, biasOptions: block.biasOptions.filter((_, i) => i !== index) });
  }

  // --- Segments ---
  function addSegment() {
    const id = `s${Date.now()}`;
    onChange({
      ...block,
      segments: [
        ...block.segments,
        { id, text: '', startIndex: 0, biasType: block.biasOptions[0]?.id ?? '', explanation: '' },
      ],
    });
  }

  function updateSegment(
    index: number,
    field: 'id' | 'text' | 'biasType' | 'explanation',
    value: string,
  ) {
    const segments = block.segments.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    );
    onChange({ ...block, segments });
  }

  function updateSegmentStartIndex(index: number, value: number) {
    const segments = block.segments.map((s, i) =>
      i === index ? { ...s, startIndex: value } : s,
    );
    onChange({ ...block, segments });
  }

  function removeSegment(index: number) {
    onChange({ ...block, segments: block.segments.filter((_, i) => i !== index) });
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
          placeholder="VD: Phát hiện thiên lệch truyền thông"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Instruction */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hướng dẫn <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={block.instruction}
          onChange={(e) => onChange({ ...block, instruction: e.target.value })}
          placeholder="VD: Đọc đoạn tin dưới đây. Click vào các cụm từ được highlight và chọn loại thiên lệch phù hợp."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Article */}
      <div className="border border-gray-200 rounded-lg p-3 space-y-3">
        <div className="text-sm font-medium text-gray-700">Bài báo / Văn bản phân tích</div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nội dung văn bản <span className="text-red-500">*</span></label>
          <textarea
            value={block.article.text}
            onChange={(e) =>
              onChange({ ...block, article: { ...block.article, text: e.target.value } })
            }
            placeholder="Dán nội dung bài báo / đoạn văn cần phân tích..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nguồn</label>
          <input
            type="text"
            value={block.article.source ?? ''}
            onChange={(e) =>
              onChange({ ...block, article: { ...block.article, source: e.target.value || undefined } })
            }
            placeholder="VD: Báo Tuổi Trẻ, 01/01/2024"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Bias option types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại thiên lệch (danh sách người học chọn) <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {block.biasOptions.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="text"
                value={option.id}
                onChange={(e) => updateBiasOption(index, 'id', e.target.value)}
                placeholder="id (VD: emotional)"
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateBiasOption(index, 'label', e.target.value)}
                placeholder="Nhãn hiển thị (VD: Ngôn ngữ cảm xúc)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {block.biasOptions.length > 1 && (
                <button onClick={() => removeBiasOption(index)} className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addBiasOption}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm loại thiên lệch</span>
        </button>
      </div>

      {/* Segments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Đoạn văn bản được đánh dấu
        </label>
        <p className="text-xs text-gray-500 mb-2">
          startIndex là vị trí ký tự bắt đầu trong văn bản (đếm từ 0). Dùng để highlight đúng vị trí.
        </p>
        <div className="space-y-3">
          {block.segments.map((seg, index) => (
            <div key={seg.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={seg.text}
                    onChange={(e) => updateSegment(index, 'text', e.target.value)}
                    placeholder="Cụm từ cần highlight (khớp chính xác với văn bản)"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-500">startIndex:</label>
                      <input
                        type="number"
                        value={seg.startIndex}
                        min={0}
                        onChange={(e) => updateSegmentStartIndex(index, Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <select
                      value={seg.biasType}
                      onChange={(e) => updateSegment(index, 'biasType', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- Chọn loại thiên lệch --</option>
                      {block.biasOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label || o.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={seg.explanation}
                    onChange={(e) => updateSegment(index, 'explanation', e.target.value)}
                    placeholder="Giải thích tại sao đây là thiên lệch..."
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                </div>
                <button onClick={() => removeSegment(index)} className="p-2 text-gray-400 hover:text-red-500 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addSegment}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm đoạn đánh dấu</span>
        </button>
      </div>
    </div>
  );
}

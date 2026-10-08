'use client';

import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BiasDetectorBlock } from './BlockEditor';

interface Props {
  block: BiasDetectorBlock;
  onChange: (block: BiasDetectorBlock) => void;
}

export default function BiasDetectorBlockEditor({ block, onChange }: Props) {
  const uid = useId();

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
        <label htmlFor={`${uid}-title`} className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-title`}
          type="text"
          aria-required="true"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="VD: Phát hiện thiên lệch truyền thông"
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Instruction */}
      <div>
        <label
          htmlFor={`${uid}-instruction`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Hướng dẫn <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-instruction`}
          type="text"
          aria-required="true"
          value={block.instruction}
          onChange={(e) => onChange({ ...block, instruction: e.target.value })}
          placeholder="VD: Đọc đoạn tin dưới đây. Click vào các cụm từ được highlight và chọn loại thiên lệch phù hợp."
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Article */}
      <div
        role="group"
        aria-labelledby={`${uid}-article-heading`}
        className="border border-gray-200 rounded-lg p-3 space-y-3"
      >
        <div id={`${uid}-article-heading`} className="text-sm font-medium text-gray-700">
          Bài báo / Văn bản phân tích
        </div>
        <div>
          <label htmlFor={`${uid}-article-text`} className="block text-xs text-gray-500 mb-1">
            Nội dung văn bản <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${uid}-article-text`}
            aria-required="true"
            value={block.article.text}
            onChange={(e) =>
              onChange({ ...block, article: { ...block.article, text: e.target.value } })
            }
            placeholder="Dán nội dung bài báo / đoạn văn cần phân tích..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          />
        </div>
        <div>
          <label htmlFor={`${uid}-article-source`} className="block text-xs text-gray-500 mb-1">
            Nguồn
          </label>
          <input
            id={`${uid}-article-source`}
            type="text"
            value={block.article.source ?? ''}
            onChange={(e) =>
              onChange({ ...block, article: { ...block.article, source: e.target.value || undefined } })
            }
            placeholder="VD: Báo Tuổi Trẻ, 01/01/2024"
            className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Bias option types */}
      <div>
        <p id={`${uid}-bias-heading`} className="block text-sm font-medium text-gray-700 mb-2">
          Loại thiên lệch (danh sách người học chọn){' '}
          <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">(bắt buộc)</span>
        </p>
        <div role="group" aria-labelledby={`${uid}-bias-heading`} className="space-y-2">
          {block.biasOptions.map((option, index) => (
            <div key={index} /* not option.id: the id is edited in this row */ className="flex items-center gap-2">
              <input
                type="text"
                aria-label={`Mã loại thiên lệch ${index + 1}`}
                value={option.id}
                onChange={(e) => updateBiasOption(index, 'id', e.target.value)}
                placeholder="id (VD: emotional)"
                className="w-32 px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
              <input
                type="text"
                aria-label={`Nhãn hiển thị loại thiên lệch ${index + 1}`}
                value={option.label}
                onChange={(e) => updateBiasOption(index, 'label', e.target.value)}
                placeholder="Nhãn hiển thị (VD: Ngôn ngữ cảm xúc)"
                className="flex-1 px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {block.biasOptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBiasOption(index)}
                  className="p-2 text-gray-500 hover:text-red-600"
                  aria-label={`Xoá loại thiên lệch ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBiasOption}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm loại thiên lệch</span>
        </button>
      </div>

      {/* Segments */}
      <div>
        <p id={`${uid}-seg-heading`} className="block text-sm font-medium text-gray-700 mb-1">
          Đoạn văn bản được đánh dấu
        </p>
        <p id={`${uid}-seg-hint`} className="text-xs text-gray-500 mb-2">
          startIndex là vị trí ký tự bắt đầu trong văn bản (đếm từ 0). Dùng để highlight đúng vị trí.
        </p>
        <div role="group" aria-labelledby={`${uid}-seg-heading`} className="space-y-3">
          {block.segments.map((seg, index) => (
            <div
              key={seg.id}
              role="group"
              aria-label={`Đoạn đánh dấu ${index + 1}`}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    aria-label={`Cụm từ cần highlight, đoạn ${index + 1}`}
                    value={seg.text}
                    onChange={(e) => updateSegment(index, 'text', e.target.value)}
                    placeholder="Cụm từ cần highlight (khớp chính xác với văn bản)"
                    className="w-full px-3 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor={`${uid}-seg-${index}-start`}
                        className="text-xs text-gray-500"
                      >
                        startIndex<span className="sr-only"> đoạn {index + 1}</span>:
                      </label>
                      <input
                        id={`${uid}-seg-${index}-start`}
                        aria-describedby={`${uid}-seg-hint`}
                        type="number"
                        value={seg.startIndex}
                        min={0}
                        onChange={(e) => updateSegmentStartIndex(index, Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <select
                      aria-label={`Loại thiên lệch của đoạn ${index + 1}`}
                      value={seg.biasType}
                      onChange={(e) => updateSegment(index, 'biasType', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    aria-label={`Giải thích đoạn ${index + 1}`}
                    value={seg.explanation}
                    onChange={(e) => updateSegment(index, 'explanation', e.target.value)}
                    placeholder="Giải thích tại sao đây là thiên lệch..."
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSegment(index)}
                  className="p-2 text-gray-500 hover:text-red-600 shrink-0"
                  aria-label={`Xoá đoạn đánh dấu ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSegment}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm đoạn đánh dấu</span>
        </button>
      </div>
    </div>
  );
}

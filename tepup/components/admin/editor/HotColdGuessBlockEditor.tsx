'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { HotColdGuessBlock } from './BlockEditor';

interface Props {
  block: HotColdGuessBlock;
  onChange: (block: HotColdGuessBlock) => void;
}

export default function HotColdGuessBlockEditor({ block, onChange }: Props) {
  function addHint() {
    onChange({ ...block, hints: [...(block.hints ?? []), ''] });
  }

  function updateHint(index: number, value: string) {
    const hints = [...(block.hints ?? [])];
    hints[index] = value;
    onChange({ ...block, hints });
  }

  function removeHint(index: number) {
    onChange({ ...block, hints: (block.hints ?? []).filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="VD: Bạn biết gì về kinh tế Việt Nam?"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Câu hỏi <span className="text-red-500">*</span>
        </label>
        <textarea
          value={block.question}
          onChange={(e) => onChange({ ...block, question: e.target.value })}
          placeholder="VD: GDP bình quân đầu người của Việt Nam năm 2023 là bao nhiêu USD?"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Answer + Unit + Tolerance */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đáp án đúng <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={block.answer}
            onChange={(e) => onChange({ ...block, answer: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
          <input
            type="text"
            value={block.unit ?? ''}
            onChange={(e) => onChange({ ...block, unit: e.target.value || undefined })}
            placeholder="VD: USD, triệu VNĐ"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sai số chấp nhận (%)
          </label>
          <input
            type="number"
            value={block.tolerance ?? 10}
            min={0}
            max={50}
            onChange={(e) => onChange({ ...block, tolerance: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Hints */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gợi ý (hiển thị từng cái một)
        </label>
        <div className="space-y-2">
          {(block.hints ?? []).map((hint, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5 shrink-0">{index + 1}.</span>
              <input
                type="text"
                value={hint}
                onChange={(e) => updateHint(index, e.target.value)}
                placeholder={`Gợi ý ${index + 1}...`}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeHint(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addHint}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm gợi ý</span>
        </button>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ngữ cảnh / Giải thích sau khi trả lời
        </label>
        <textarea
          value={block.context ?? ''}
          onChange={(e) => onChange({ ...block, context: e.target.value || undefined })}
          placeholder="Thông tin bổ sung hiển thị sau khi người học trả lời đúng..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

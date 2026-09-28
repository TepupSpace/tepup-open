'use client';

import { Plus, Trash2, Check } from 'lucide-react';
import type { PerspectiveSwitchBlock } from './BlockEditor';

interface Props {
  block: PerspectiveSwitchBlock;
  onChange: (block: PerspectiveSwitchBlock) => void;
}

export default function PerspectiveSwitchBlockEditor({ block, onChange }: Props) {
  // --- Perspectives ---
  function addPerspective() {
    const id = `p${Date.now()}`;
    onChange({
      ...block,
      perspectives: [
        ...block.perspectives,
        { id, role: '', icon: '👤', narrative: '' },
      ],
    });
  }

  function updatePerspective(
    index: number,
    field: 'id' | 'role' | 'icon' | 'narrative',
    value: string,
  ) {
    const perspectives = block.perspectives.map((p, i) =>
      i === index ? { ...p, [field]: value } : p,
    );
    onChange({ ...block, perspectives });
  }

  function removePerspective(index: number) {
    if (block.perspectives.length <= 2) return;
    onChange({ ...block, perspectives: block.perspectives.filter((_, i) => i !== index) });
  }

  // --- Question options ---
  function addOption() {
    const id = String((block.question?.options?.length ?? 0) + 1);
    onChange({
      ...block,
      question: {
        ...(block.question ?? { text: '', options: [] }),
        options: [
          ...(block.question?.options ?? []),
          { id, text: '', isCorrect: false },
        ],
      },
    });
  }

  function updateOptionText(index: number, text: string) {
    const options = (block.question?.options ?? []).map((o, i) =>
      i === index ? { ...o, text } : o,
    );
    onChange({ ...block, question: { ...(block.question ?? { text: '' }), options } });
  }

  function setCorrectOption(index: number) {
    const options = (block.question?.options ?? []).map((o, i) => ({
      ...o,
      isCorrect: i === index,
    }));
    onChange({ ...block, question: { ...(block.question ?? { text: '' }), options } });
  }

  function removeOption(index: number) {
    const options = (block.question?.options ?? []).filter((_, i) => i !== index);
    onChange({ ...block, question: { ...(block.question ?? { text: '' }), options } });
  }

  const question = block.question ?? { text: '', options: [] };

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
          placeholder="VD: Nhà máy dệt đóng cửa"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Event description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả sự kiện <span className="text-red-500">*</span>
        </label>
        <textarea
          value={block.event}
          onChange={(e) => onChange({ ...block, event: e.target.value })}
          placeholder="Mô tả sự kiện / tình huống mà các bên đang phân tích..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Perspectives */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Các góc nhìn <span className="text-red-500">*</span>
        </label>
        <div className="space-y-4">
          {block.perspectives.map((p, index) => (
            <div key={p.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={p.icon}
                  onChange={(e) => updatePerspective(index, 'icon', e.target.value)}
                  placeholder="Icon"
                  className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={p.role}
                  onChange={(e) => updatePerspective(index, 'role', e.target.value)}
                  placeholder="Vai trò (VD: Công nhân, Giám đốc...)"
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {block.perspectives.length > 2 && (
                  <button
                    onClick={() => removePerspective(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={p.narrative}
                onChange={(e) => updatePerspective(index, 'narrative', e.target.value)}
                placeholder="Lời kể từ góc nhìn này..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>
          ))}
        </div>
        {block.perspectives.length < 5 && (
          <button
            onClick={addPerspective}
            className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm góc nhìn</span>
          </button>
        )}
      </div>

      {/* Question */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Câu hỏi tổng kết (tùy chọn)
        </label>
        <textarea
          value={question.text}
          onChange={(e) =>
            onChange({ ...block, question: { ...question, text: e.target.value } })
          }
          placeholder="VD: Sau khi đọc cả 3 góc nhìn, điều gì khiến vấn đề này khó giải quyết nhất?"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
        />

        {/* Options */}
        <div className="space-y-2">
          {(question.options ?? []).map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <button
                onClick={() => setCorrectOption(index)}
                className={`p-2 rounded-lg border transition-colors ${
                  option.isCorrect
                    ? 'bg-green-100 border-green-300 text-green-600'
                    : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
                title={option.isCorrect ? 'Đáp án đúng' : 'Đặt làm đáp án đúng'}
              >
                <Check className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOptionText(index, e.target.value)}
                placeholder={`Lựa chọn ${index + 1}...`}
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  option.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              />
              {(question.options ?? []).length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {(question.options ?? []).length < 6 && (
          <button
            onClick={addOption}
            className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm lựa chọn</span>
          </button>
        )}

        {/* Explanation */}
        {(question.options ?? []).length > 0 && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giải thích đáp án
            </label>
            <textarea
              value={(question as { text: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation?: string }).explanation ?? ''}
              onChange={(e) =>
                onChange({
                  ...block,
                  question: { ...question, explanation: e.target.value || undefined },
                })
              }
              placeholder="Giải thích lý do đáp án đúng..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

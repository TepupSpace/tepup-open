'use client';

import { useId } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import type { PerspectiveSwitchBlock } from './BlockEditor';

interface Props {
  block: PerspectiveSwitchBlock;
  onChange: (block: PerspectiveSwitchBlock) => void;
}

export default function PerspectiveSwitchBlockEditor({ block, onChange }: Props) {
  const uid = useId();

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
        <label htmlFor={`${uid}-title`} className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-title`}
          type="text"
          aria-required="true"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="VD: Nhà máy dệt đóng cửa"
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Event description */}
      <div>
        <label htmlFor={`${uid}-event`} className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả sự kiện <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${uid}-event`}
          aria-required="true"
          value={block.event}
          onChange={(e) => onChange({ ...block, event: e.target.value })}
          placeholder="Mô tả sự kiện / tình huống mà các bên đang phân tích..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Perspectives */}
      <div>
        <p
          id={`${uid}-perspectives-heading`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Các góc nhìn <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">(bắt buộc)</span>
        </p>
        <div
          role="group"
          aria-labelledby={`${uid}-perspectives-heading`}
          className="space-y-4"
        >
          {block.perspectives.map((p, index) => (
            <div
              key={p.id}
              role="group"
              aria-label={`Góc nhìn ${index + 1}`}
              className="border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label={`Biểu tượng góc nhìn ${index + 1}`}
                  value={p.icon}
                  onChange={(e) => updatePerspective(index, 'icon', e.target.value)}
                  placeholder="Icon"
                  className="w-14 px-2 py-1.5 border border-gray-500 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  aria-label={`Vai trò góc nhìn ${index + 1}`}
                  value={p.role}
                  onChange={(e) => updatePerspective(index, 'role', e.target.value)}
                  placeholder="Vai trò (VD: Công nhân, Giám đốc...)"
                  className="flex-1 px-3 py-1.5 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {block.perspectives.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePerspective(index)}
                    className="p-1.5 text-gray-500 hover:text-red-600"
                    aria-label={`Xoá góc nhìn ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <textarea
                aria-label={`Lời kể góc nhìn ${index + 1}`}
                value={p.narrative}
                onChange={(e) => updatePerspective(index, 'narrative', e.target.value)}
                placeholder="Lời kể từ góc nhìn này..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>
          ))}
        </div>
        {block.perspectives.length < 5 && (
          <button
            type="button"
            onClick={addPerspective}
            className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Thêm góc nhìn</span>
          </button>
        )}
      </div>

      {/* Question */}
      <div className="border-t pt-4">
        <label
          htmlFor={`${uid}-question`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Câu hỏi tổng kết (tùy chọn)
        </label>
        <textarea
          id={`${uid}-question`}
          value={question.text}
          onChange={(e) =>
            onChange({ ...block, question: { ...question, text: e.target.value } })
          }
          placeholder="VD: Sau khi đọc cả 3 góc nhìn, điều gì khiến vấn đề này khó giải quyết nhất?"
          rows={2}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
        />

        {/* Options */}
        <div role="group" aria-label="Các lựa chọn của câu hỏi tổng kết" className="space-y-2">
          {(question.options ?? []).map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectOption(index)}
                aria-pressed={option.isCorrect}
                aria-label={`Lựa chọn ${index + 1} là đáp án đúng`}
                className={`p-2 rounded-lg border transition-colors ${
                  option.isCorrect
                    ? 'bg-green-100 border-green-600 text-green-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
                title={option.isCorrect ? 'Đáp án đúng' : 'Đặt làm đáp án đúng'}
              >
                <Check className="w-4 h-4" aria-hidden="true" />
              </button>
              <input
                type="text"
                aria-label={`Lựa chọn ${index + 1}`}
                value={option.text}
                onChange={(e) => updateOptionText(index, e.target.value)}
                placeholder={`Lựa chọn ${index + 1}...`}
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  option.isCorrect ? 'border-green-600 bg-green-50' : 'border-gray-500'
                }`}
              />
              {(question.options ?? []).length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-gray-500 hover:text-red-600"
                  aria-label={`Xoá lựa chọn ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        {(question.options ?? []).length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Thêm lựa chọn</span>
          </button>
        )}

        {/* Explanation */}
        {(question.options ?? []).length > 0 && (
          <div className="mt-3">
            <label
              htmlFor={`${uid}-explanation`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Giải thích đáp án
            </label>
            <textarea
              id={`${uid}-explanation`}
              value={(question as { text: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation?: string }).explanation ?? ''}
              onChange={(e) =>
                onChange({
                  ...block,
                  question: { ...question, explanation: e.target.value || undefined },
                })
              }
              placeholder="Giải thích lý do đáp án đúng..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

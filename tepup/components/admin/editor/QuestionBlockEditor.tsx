'use client';

import { Plus, Trash2, Check } from 'lucide-react';
import type { QuestionBlock } from './BlockEditor';

interface QuestionBlockEditorProps {
  block: QuestionBlock;
  onChange: (block: QuestionBlock) => void;
}

export default function QuestionBlockEditor({
  block,
  onChange,
}: QuestionBlockEditorProps) {
  function updateOptionText(index: number, text: string) {
    const options = [...block.options];
    options[index] = { ...options[index], text };
    onChange({ ...block, options });
  }

  const isMultiple = block.mode === 'multiple';
  const correctCount = block.options.filter((o) => o.isCorrect).length;

  function toggleCorrectOption(index: number) {
    // Single choice keeps radio semantics: marking one clears the rest.
    const options = block.options.map((opt, i) =>
      isMultiple
        ? i === index
          ? { ...opt, isCorrect: !opt.isCorrect }
          : opt
        : { ...opt, isCorrect: i === index }
    );
    onChange({ ...block, options });
  }

  function setMode(mode: 'single' | 'multiple') {
    if (mode === block.mode) return;
    if (mode === 'multiple') {
      onChange({ ...block, mode });
      return;
    }
    // Narrowing back to one answer: keep the first correct one, drop the others.
    let kept = false;
    const options = block.options.map((opt) => {
      if (opt.isCorrect && !kept) {
        kept = true;
        return opt;
      }
      return opt.isCorrect ? { ...opt, isCorrect: false } : opt;
    });
    onChange({ ...block, mode, options });
  }

  function addOption() {
    // Ids must stay unique — multi-select grades with `selected.includes(id)`, so a
    // duplicate would mark two options at once. Numeric-suffix ids can collide after
    // a middle option is deleted, hence max+1 rather than length+1.
    const maxId = block.options.reduce((max, o) => {
      const n = Number(o.id);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    const newId = String(maxId + 1);
    onChange({
      ...block,
      options: [...block.options, { id: newId, text: '', isCorrect: false }],
    });
  }

  function removeOption(index: number) {
    if (block.options.length <= 2) return;
    const options = block.options.filter((_, i) => i !== index);
    // Single choice must always have exactly one answer; multiple choice is allowed
    // to sit at zero while the author is still ticking boxes (warned about below).
    if (!isMultiple && !options.some((opt) => opt.isCorrect)) {
      options[0] = { ...options[0], isCorrect: true };
    }
    onChange({ ...block, options });
  }

  return (
    <div className="space-y-4">
      {/* Answer mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kiểu trả lời
        </label>
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
          {([
            { value: 'single', label: 'Một đáp án' },
            { value: 'multiple', label: 'Nhiều đáp án' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                (block.mode ?? 'single') === opt.value
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Câu hỏi <span className="text-red-500">*</span>
        </label>
        <textarea
          value={block.question}
          onChange={(e) => onChange({ ...block, question: e.target.value })}
          placeholder="Nhập câu hỏi..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Các lựa chọn
        </label>
        <p className="text-xs text-gray-500 mb-2">
          {isMultiple
            ? 'Tích vào TẤT CẢ đáp án đúng. Học viên phải chọn đủ mới được tính đúng.'
            : 'Chọn dấu tích để đánh dấu đáp án đúng'}
        </p>
        {isMultiple && correctCount === 0 && (
          <p className="text-xs text-amber-600 mb-2">
            Chưa có đáp án đúng nào — hãy tích ít nhất một lựa chọn.
          </p>
        )}
        <div className="space-y-2">
          {block.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <button
                onClick={() => toggleCorrectOption(index)}
                className={`p-2 border transition-colors ${
                  isMultiple ? 'rounded-md' : 'rounded-full'
                } ${
                  option.isCorrect
                    ? 'bg-green-100 border-green-300 text-green-600'
                    : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
                title={
                  option.isCorrect
                    ? isMultiple
                      ? 'Đáp án đúng — bấm để bỏ'
                      : 'Đáp án đúng'
                    : 'Đánh dấu là đáp án đúng'
                }
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
              {block.options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                  title="Xóa lựa chọn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {block.options.length < 6 && (
          <button
            onClick={addOption}
            className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm lựa chọn</span>
          </button>
        )}
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Giải thích (tùy chọn)
        </label>
        <textarea
          value={block.explanation || ''}
          onChange={(e) =>
            onChange({ ...block, explanation: e.target.value || undefined })
          }
          placeholder="Giải thích hiển thị sau khi trả lời..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

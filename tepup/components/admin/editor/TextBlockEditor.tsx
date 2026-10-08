'use client';

import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { TextBlock } from './BlockEditor';

interface TextBlockEditorProps {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
}

export default function TextBlockEditor({
  block,
  onChange,
}: TextBlockEditorProps) {
  const uid = useId();

  function updateTitle(title: string) {
    onChange({ ...block, title: title || undefined });
  }

  function updateParagraph(index: number, text: string) {
    const paragraphs = [...block.paragraphs];
    paragraphs[index] = text;
    onChange({ ...block, paragraphs });
  }

  function addParagraph() {
    onChange({ ...block, paragraphs: [...block.paragraphs, ''] });
  }

  function removeParagraph(index: number) {
    if (block.paragraphs.length <= 1) return;
    const paragraphs = block.paragraphs.filter((_, i) => i !== index);
    onChange({ ...block, paragraphs });
  }

  return (
    <div className="space-y-4">
      {/* Title (optional) */}
      <div>
        <label htmlFor={`${uid}-title`} className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề (tùy chọn)
        </label>
        <input
          id={`${uid}-title`}
          type="text"
          value={block.title || ''}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Tiêu đề phần..."
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Paragraphs */}
      <div role="group" aria-labelledby={`${uid}-content`}>
        <p id={`${uid}-content`} className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung
        </p>
        <div className="space-y-2">
          {block.paragraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                aria-label={`Đoạn ${index + 1}`}
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
                placeholder="Nhập nội dung..."
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {block.paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParagraph(index)}
                  className="p-2 text-gray-500 hover:text-red-600 self-start"
                  title="Xóa đoạn văn"
                  aria-label={`Xóa đoạn ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addParagraph}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Thêm đoạn văn</span>
        </button>
      </div>
    </div>
  );
}

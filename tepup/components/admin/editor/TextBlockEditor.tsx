'use client';

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề (tùy chọn)
        </label>
        <input
          type="text"
          value={block.title || ''}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Tiêu đề phần..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Paragraphs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung
        </label>
        <div className="space-y-2">
          {block.paragraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
                placeholder="Nhập nội dung..."
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {block.paragraphs.length > 1 && (
                <button
                  onClick={() => removeParagraph(index)}
                  className="p-2 text-gray-400 hover:text-red-500 self-start"
                  title="Xóa đoạn văn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addParagraph}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm đoạn văn</span>
        </button>
      </div>
    </div>
  );
}

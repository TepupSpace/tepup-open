'use client';

import { useId } from 'react';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { CalloutBlock } from './BlockEditor';

interface CalloutBlockEditorProps {
  block: CalloutBlock;
  onChange: (block: CalloutBlock) => void;
}

// `color` is the callout's own look (used by the preview); `selected` is the picker button's
// selected state, with a border dark enough (3:1) to see which one is chosen.
const variants = [
  { value: 'info', label: 'Thông tin', icon: Info, color: 'bg-blue-50 border-blue-200', selected: 'bg-blue-50 border-blue-600' },
  { value: 'warning', label: 'Cảnh báo', icon: AlertCircle, color: 'bg-yellow-50 border-yellow-200', selected: 'bg-yellow-50 border-yellow-700' },
  { value: 'success', label: 'Thành công', icon: CheckCircle, color: 'bg-green-50 border-green-200', selected: 'bg-green-50 border-green-700' },
];

export default function CalloutBlockEditor({
  block,
  onChange,
}: CalloutBlockEditorProps) {
  const uid = useId();
  const currentVariant = variants.find((v) => v.value === block.variant) || variants[0];

  return (
    <div className="space-y-4">
      {/* Variant */}
      <div>
        <p id={`${uid}-variant`} className="block text-sm font-medium text-gray-700 mb-1">
          Loại
        </p>
        <div role="group" aria-labelledby={`${uid}-variant`} className="flex gap-2">
          {variants.map((v) => {
            const Icon = v.icon;
            const isSelected = block.variant === v.value;
            return (
              <button
                key={v.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  onChange({
                    ...block,
                    variant: v.value as 'info' | 'warning' | 'success',
                  })
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  isSelected
                    ? v.selected + ' border-2'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor={`${uid}-title`} className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề (tùy chọn)
        </label>
        <input
          id={`${uid}-title`}
          type="text"
          value={block.title || ''}
          onChange={(e) =>
            onChange({ ...block, title: e.target.value || undefined })
          }
          placeholder="Tiêu đề callout..."
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Text */}
      <div>
        <label htmlFor={`${uid}-text`} className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${uid}-text`}
          aria-required="true"
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Nội dung callout..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Preview */}
      {block.text && (
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">
            Xem trước
          </p>
          <div className={`p-4 rounded-xl border ${currentVariant.color}`}>
            <div className="flex gap-3">
              <currentVariant.icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                {block.title && (
                  <p className="font-medium mb-1">{block.title}</p>
                )}
                <p className="text-sm whitespace-pre-line">{block.text}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

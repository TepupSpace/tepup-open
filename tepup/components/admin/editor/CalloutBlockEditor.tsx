'use client';

import { AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { CalloutBlock } from './BlockEditor';

interface CalloutBlockEditorProps {
  block: CalloutBlock;
  onChange: (block: CalloutBlock) => void;
}

const variants = [
  { value: 'info', label: 'Thông tin', icon: Info, color: 'bg-blue-50 border-blue-200' },
  { value: 'warning', label: 'Cảnh báo', icon: AlertCircle, color: 'bg-yellow-50 border-yellow-200' },
  { value: 'success', label: 'Thành công', icon: CheckCircle, color: 'bg-green-50 border-green-200' },
];

export default function CalloutBlockEditor({
  block,
  onChange,
}: CalloutBlockEditorProps) {
  const currentVariant = variants.find((v) => v.value === block.variant) || variants[0];

  return (
    <div className="space-y-4">
      {/* Variant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loại
        </label>
        <div className="flex gap-2">
          {variants.map((v) => {
            const Icon = v.icon;
            const isSelected = block.variant === v.value;
            return (
              <button
                key={v.value}
                onClick={() =>
                  onChange({
                    ...block,
                    variant: v.value as 'info' | 'warning' | 'success',
                  })
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  isSelected
                    ? v.color + ' border-2'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề (tùy chọn)
        </label>
        <input
          type="text"
          value={block.title || ''}
          onChange={(e) =>
            onChange({ ...block, title: e.target.value || undefined })
          }
          placeholder="Tiêu đề callout..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung <span className="text-red-500">*</span>
        </label>
        <textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Nội dung callout..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Preview */}
      {block.text && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xem trước
          </label>
          <div className={`p-4 rounded-xl border ${currentVariant.color}`}>
            <div className="flex gap-3">
              <currentVariant.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
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

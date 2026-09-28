'use client';

import type { CustomBlockInstance, EditorField } from '@/lib/types/custom-block';
import { Puzzle } from 'lucide-react';

interface Props {
  block: CustomBlockInstance;
  onChange: (updated: CustomBlockInstance) => void;
}

function updateField(block: CustomBlockInstance, key: string, value: unknown): CustomBlockInstance {
  return { ...block, fields: { ...block.fields, [key]: value } };
}

function renderField(
  field: EditorField,
  value: unknown,
  onChange: (val: unknown) => void
) {
  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={field.label}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClass + ' resize-y'}
          placeholder={field.label}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={(value as number) ?? field.defaultValue ?? 0}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={inputClass}
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(value as boolean) ?? field.defaultValue ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-500"
          />
          <span className="text-sm text-gray-600">{field.label}</span>
        </label>
      );

    case 'select':
      return (
        <select
          value={(value as string) ?? field.defaultValue ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass + ' bg-white'}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    default:
      return null;
  }
}

export default function CustomBlockEditor({ block, onChange }: Props) {
  const config = block.configSnapshot;

  if (!config) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500 flex items-center gap-2">
        <Puzzle className="w-4 h-4" />
        Block chưa có cấu hình.
      </div>
    );
  }

  if (!config.editorSchema || config.editorSchema.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
        Block này không có trường tuỳ chỉnh. Nội dung được tích hợp sẵn trong block.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Điền thông tin bên dưới để tuỳ chỉnh block <strong>{config.name}</strong> cho bài học này.
      </p>
      {config.editorSchema.map((field) => (
        <div key={field.key}>
          {field.type !== 'boolean' && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
          )}
          {renderField(
            field,
            block.fields[field.key] ?? field.defaultValue,
            (val) => onChange(updateField(block, field.key, val))
          )}
        </div>
      ))}
    </div>
  );
}

'use client';

import { Check } from 'lucide-react';

/** Màu của nhân vật: chữ (`value`) và nền nhạt đi kèm. Lưu dưới dạng class Tailwind. */
export const colorOptions = [
  { value: 'text-blue-600', bg: 'bg-blue-50', label: 'Xanh dương' },
  { value: 'text-green-600', bg: 'bg-green-50', label: 'Xanh lá' },
  { value: 'text-purple-600', bg: 'bg-purple-50', label: 'Tím' },
  { value: 'text-orange-600', bg: 'bg-orange-50', label: 'Cam' },
  { value: 'text-pink-600', bg: 'bg-pink-50', label: 'Hồng' },
  { value: 'text-red-600', bg: 'bg-red-50', label: 'Đỏ' },
];

/**
 * Bảng chọn màu cho trang thêm/sửa nhân vật.
 *
 * Mỗi ô là một nút có tên màu (aria-label) và `aria-pressed`; ô đang chọn có dấu ✓ và viền
 * đậm, không chỉ dựa vào màu hay độ phóng to.
 */
export default function CharacterColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string, bgColor: string) => void;
}) {
  return (
    <div role="group" aria-labelledby="character-color-label">
      <span id="character-color-label" className="block text-sm font-medium text-gray-700 mb-1">
        Màu sắc
      </span>
      <div className="flex gap-2">
        {colorOptions.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value, opt.bg)}
              aria-label={opt.label}
              aria-pressed={selected}
              title={opt.label}
              className={`relative w-10 h-10 rounded-xl ${opt.bg} border-2 transition-all ${
                selected ? 'border-gray-700 scale-110' : 'border-transparent hover:scale-105'
              }`}
            >
              {/* Ô màu là mẫu màu (swatch) cố ý, không phải chữ. */}
              <span className={`block w-4 h-4 rounded-full mx-auto ${opt.value.replace('text-', 'bg-')}`} />
              {selected && (
                <Check className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-700 p-0.5 text-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

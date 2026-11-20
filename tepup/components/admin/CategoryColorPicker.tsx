'use client';

import { useId } from 'react';
import FolderCard from '@/components/courses-hub/FolderCard';
import { fraunces, beVietnam } from '@/lib/fonts/paper';
import {
  CATEGORY_COLOR_LIST,
  categoryColorStyle,
  resolveCategoryColor,
  type CategoryColor,
} from '@/lib/paper/category-colors';

interface CategoryColorPickerProps {
  value: string;
  onChange: (color: CategoryColor) => void;
  /** Tên hiện trên folder trong bản xem trước (vd. tên danh mục đang nhập). */
  previewTitle?: string;
}

/**
 * Chọn màu chủ đạo của danh mục từ preset cố định (radio gốc, có tên màu, không chỉ
 * dựa vào màu), kèm bản xem trước một folder trên dải nền loang như ở /courses.
 */
export default function CategoryColorPicker({ value, onChange, previewTitle }: CategoryColorPickerProps) {
  const uid = useId();
  const hintId = `${uid}-hint`;
  const current = resolveCategoryColor(value);

  return (
    <fieldset aria-describedby={hintId}>
      <legend className="block text-sm font-medium text-gray-700 mb-1">Màu danh mục</legend>
      <p id={hintId} className="text-xs text-gray-600 mb-3">
        Màu của các folder và dải nền của danh mục ở trang /courses. Đỏ và Xanh lá đã dùng cho
        trạng thái chương và nút học, nên ưu tiên các màu khác trước.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CATEGORY_COLOR_LIST.map((preset) => (
          <label
            key={preset.key}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600"
          >
            <input
              type="radio"
              name={`${uid}-color`}
              value={preset.key}
              checked={current.key === preset.key}
              onChange={() => onChange(preset.key)}
              className="w-4 h-4 accent-gray-900"
            />
            <span className="w-5 h-5 rounded-full shrink-0 border border-gray-300" style={{ background: preset.base }} aria-hidden="true" />
            <span className="text-sm text-gray-800">{preset.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Xem trước (đang chọn: {current.label})</p>
        <CategoryFolderPreview color={current.key} title={previewTitle || 'Tên khoá học'} />
      </div>
    </fieldset>
  );
}

/**
 * Một folder trên dải nền loang màu danh mục, đúng kích thước ở /courses. Tĩnh,
 * `aria-hidden` (chỉ minh hoạ). Dùng ở form danh mục và form khoá học.
 */
export function CategoryFolderPreview({
  color,
  title,
  imageUrl,
  isNew = true,
}: {
  color: string;
  title: string;
  imageUrl?: string | null;
  isNew?: boolean;
}) {
  return (
    <div
      className={`relative w-[17rem] max-w-full h-[340px] ${fraunces.variable} ${beVietnam.variable}`}
      style={categoryColorStyle(color)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 bottom-0 h-[240px] rounded-[28px]"
        style={{
          backgroundImage:
            'linear-gradient(11.99deg, rgb(var(--cat-rgb) / 0.5) 5.98%, rgb(var(--cat-rgb) / 0.125) 50.18%, rgb(var(--cat-rgb) / 0) 94.38%)',
        }}
      />
      <div className="absolute left-6 bottom-8">
        <FolderCard as="div" title={title} imageUrl={imageUrl} isNew={isNew} />
      </div>
    </div>
  );
}

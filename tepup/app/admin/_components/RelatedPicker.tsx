'use client';

import { useId, useRef, type ElementType } from 'react';
import { X } from 'lucide-react';
import { useAnnouncer, useFocusAfterRender } from '@/components/blocks/useAnnouncer';

/**
 * Chọn nhiều mục liên quan (câu chuyện đề xuất cho khóa học, khóa học đề xuất cho câu chuyện).
 *
 * - Nhóm có tên (fieldset/legend) và lời giải thích gắn với ô chọn.
 * - Nút "bỏ" có tên ("Bỏ <tên>"); bỏ xong, focus về ô chọn thay vì rơi về <body>.
 * - Thêm/bỏ được đọc qua vùng live luôn có mặt.
 */
export default function RelatedPicker({
  legend,
  hint,
  icon: Icon,
  items,
  selectedIds,
  onAdd,
  onRemove,
  addPlaceholder,
  noun,
  chipClassName,
  removeHoverClassName,
}: {
  legend: string;
  hint: string;
  icon: ElementType;
  items: { id: string; label: string }[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  addPlaceholder: string;
  /** "câu chuyện", "khóa học" — dùng trong câu thông báo. */
  noun: string;
  chipClassName: string;
  removeHoverClassName: string;
}) {
  const hintId = useId();
  const selectId = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  const [message, announce] = useAnnouncer();
  const focusAfterRender = useFocusAfterRender();
  const labelOf = (id: string) => items.find((i) => i.id === id)?.label ?? '';

  return (
    <div className="pt-4 border-t border-gray-100">
    <fieldset>
      <legend className="flex items-center text-sm font-medium text-gray-700 mb-3">
        <Icon className="w-4 h-4 inline mr-2" />
        {legend}
      </legend>
      <p id={hintId} className="text-xs text-gray-500 mb-3">
        {hint}
      </p>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Selected */}
      {selectedIds.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-3" aria-label={`${legend} đã chọn`}>
          {selectedIds.map((id) => {
            const label = labelOf(id);
            if (!label) return null;
            return (
              <li
                key={id}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${chipClassName}`}
              >
                {label}
                <button
                  type="button"
                  onClick={() => {
                    onRemove(id);
                    announce(`Đã bỏ ${noun} ${label}.`);
                    focusAfterRender(() => selectRef.current);
                  }}
                  aria-label={`Bỏ ${label}`}
                  title={`Bỏ ${label}`}
                  className={`ml-1 rounded p-0.5 ${removeHoverClassName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Selector */}
      <label htmlFor={selectId} className="sr-only">
        Thêm {noun} đề xuất
      </label>
      <select
        id={selectId}
        ref={selectRef}
        value=""
        onChange={(e) => {
          if (e.target.value) {
            onAdd(e.target.value);
            announce(`Đã thêm ${noun} ${labelOf(e.target.value)}.`);
          }
        }}
        aria-describedby={hintId}
        className="w-full px-4 py-3 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      >
        <option value="">{addPlaceholder}</option>
        {items
          .filter((i) => !selectedIds.includes(i.id))
          .map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
      </select>
    </fieldset>
    </div>
  );
}

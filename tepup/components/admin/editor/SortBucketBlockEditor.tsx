'use client';

import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import type { SortBucketBlock } from './types';

interface Props {
  block: SortBucketBlock;
  onChange: (block: SortBucketBlock) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

function nextId(prefix: string, count: number): string {
  return `${prefix}${Date.now().toString(36)}${count}`;
}

export default function SortBucketBlockEditor({ block, onChange }: Props) {
  const buckets = block.buckets ?? [];
  const items = block.items ?? [];

  const orphanCount = items.filter((it) => !buckets.some((b) => b.id === it.bucketId)).length;

  function addBucket() {
    onChange({
      ...block,
      buckets: [...buckets, { id: nextId('b', buckets.length), label: '' }],
    });
  }

  /**
   * Deleting a bucket would strand every item pointing at it — those items become
   * unplaceable and the learner could never finish the block. Move them to the
   * first remaining bucket instead of leaving dangling references.
   */
  function removeBucket(index: number) {
    const removed = buckets[index];
    const remaining = buckets.filter((_, i) => i !== index);
    const fallback = remaining[0]?.id;
    onChange({
      ...block,
      buckets: remaining,
      items: items.map((it) =>
        it.bucketId === removed.id && fallback ? { ...it, bucketId: fallback } : it
      ),
    });
  }

  function addItem() {
    onChange({
      ...block,
      items: [
        ...items,
        { id: nextId('i', items.length), text: '', bucketId: buckets[0]?.id ?? '' },
      ],
    });
  }

  function updateItem(index: number, patch: Partial<SortBucketBlock['items'][number]>) {
    onChange({ ...block, items: items.map((it, i) => (i === index ? { ...it, ...patch } : it)) });
  }

  function removeItem(index: number) {
    onChange({ ...block, items: items.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
        <input
          type="text"
          value={block.title ?? ''}
          onChange={(e) => onChange({ ...block, title: e.target.value || undefined })}
          placeholder="VD: Xếp ví dụ vào đúng nhóm"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hướng dẫn</label>
        <input
          type="text"
          value={block.instruction ?? ''}
          onChange={(e) => onChange({ ...block, instruction: e.target.value || undefined })}
          placeholder="Để trống sẽ dùng hướng dẫn mặc định"
          className={inputClass}
        />
      </div>

      {/* Buckets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Các rổ <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Xoá một rổ sẽ chuyển các thẻ của nó sang rổ đầu tiên còn lại.
        </p>
        <div className="space-y-2">
          {buckets.map((bucket, index) => (
            <div key={bucket.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5 shrink-0">{index + 1}.</span>
              <input
                type="text"
                value={bucket.label}
                onChange={(e) =>
                  onChange({
                    ...block,
                    buckets: buckets.map((b, i) =>
                      i === index ? { ...b, label: e.target.value } : b
                    ),
                  })
                }
                placeholder="Tên rổ"
                className={inputClass}
              />
              <button
                onClick={() => removeBucket(index)}
                disabled={buckets.length <= 1}
                className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400"
                aria-label={`Xoá rổ ${index + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addBucket}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm rổ</span>
        </button>
      </div>

      {/* Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Các thẻ cần phân loại <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(index, { text: e.target.value })}
                placeholder="Nội dung thẻ"
                className={inputClass}
              />
              <select
                value={item.bucketId}
                onChange={(e) => updateItem(index, { bucketId: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 max-w-[45%]"
              >
                {buckets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label || '(rổ chưa đặt tên)'}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeItem(index)}
                className="p-2 text-gray-400 hover:text-red-500"
                aria-label={`Xoá thẻ ${index + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          disabled={buckets.length === 0}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm thẻ</span>
        </button>
      </div>

      {orphanCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {orphanCount} thẻ đang trỏ tới rổ không còn tồn tại và sẽ bị ẩn khỏi bài học. Chọn lại
            rổ cho chúng.
          </span>
        </div>
      )}
    </div>
  );
}

'use client';

export interface LessonMeta {
  title: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

interface Props {
  meta: LessonMeta;
  onChange: (meta: LessonMeta) => void;
}

/** Right-column metadata panel for a lesson (title / slug / visibility / order). */
export default function LessonMetaPanel({ meta, onChange }: Props) {
  const set = <K extends keyof LessonMeta>(key: K, value: LessonMeta[K]) =>
    onChange({ ...meta, [key]: value });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">Thông tin bài học</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={meta.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tiêu đề bài học"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          type="text"
          value={meta.slug}
          onChange={(e) => set('slug', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="tu-dong-tao-tu-ten-bai"
        />
        <p className="mt-1 text-xs text-gray-500">
          Đây là địa chỉ bài học: /courses/&lt;khoá&gt;/&lt;slug&gt;. Để trống sẽ giữ nguyên slug hiện tại.
          Đổi slug sẽ làm link cũ ngừng hoạt động.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
        <input
          type="number"
          value={meta.sortOrder}
          onChange={(e) => set('sortOrder', Number(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={meta.isActive}
          onChange={(e) => set('isActive', e.target.checked)}
          className="w-4 h-4 rounded accent-blue-500"
        />
        <span className="text-sm text-gray-700">Hiển thị bài học (bỏ chọn để ẩn)</span>
      </label>
    </div>
  );
}

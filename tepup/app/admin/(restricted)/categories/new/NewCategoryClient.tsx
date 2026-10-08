'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { Save } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
import {
  BackLink,
  FormError,
  RequiredMark,
  RequiredNote,
  inputClass,
  labelClass,
} from '../../../_components/form';

export default function NewCategoryClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'brain',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nút lưu không bị `disabled` khi đang lưu (để không mất focus): chặn bấm lặp ở đây.
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể tạo danh mục');
        return;
      }

      router.push('/admin/categories');
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Đã xảy ra lỗi khi tạo danh mục');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackLink href="/admin/categories" label="Quay lại danh sách danh mục" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm danh mục mới</h1>
          <p className="text-gray-600 mt-1">Tạo một danh mục mới cho khóa học</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <FormError message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <RequiredNote />

          {/* Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Tên danh mục <RequiredMark />
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Khoa học Xã hội"
              required
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Mô tả
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn về danh mục..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* IconPicker là một nút (không phải ô nhập): tên của nó lấy từ prop `label`, nên chữ phía trên không phải <label>. */}
          <div>
            <span className={labelClass} aria-hidden="true">
              Biểu tượng
            </span>
            <IconPicker
                label="Biểu tượng"
              value={formData.icon}
              onChange={(icon) => setFormData({ ...formData, icon })}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/categories"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              aria-disabled={loading || undefined}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 aria-disabled:opacity-70 aria-disabled:cursor-wait transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : 'Lưu danh mục'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

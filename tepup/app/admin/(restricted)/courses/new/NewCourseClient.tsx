'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { Save } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { slugify } from '@/lib/utils/slug';
import {
  BackLink,
  FormError,
  RequiredMark,
  RequiredNote,
  checkboxClass,
  inputClass,
  labelClass,
} from '../../../_components/form';

interface Category {
  id: string;
  name: string;
}

export default function NewCourseClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'book-open',
    categoryId: '',
    isNew: false,
    imageUrl: '',
  });
  // Once the admin edits the slug by hand, stop mirroring it from the name.
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.data) {
        setCategories(data.data);
        if (data.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nút lưu không bị `disabled` khi đang lưu (để không mất focus): chặn bấm lặp ở đây.
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể tạo khóa học');
        return;
      }

      router.push('/admin/courses');
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Đã xảy ra lỗi khi tạo khóa học');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackLink href="/admin/courses" label="Quay lại danh sách khóa học" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm khóa học mới</h1>
          <p className="text-gray-600 mt-1">Tạo một khóa học mới</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <FormError message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <RequiredNote />

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className={labelClass}>
              Danh mục <RequiredMark />
            </label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              required
              className={inputClass}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Tên khóa học <RequiredMark />
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: slugTouched ? formData.slug : slugify(name),
                });
              }}
              placeholder="VD: Kinh tế Vi mô"
              required
              className={inputClass}
            />
          </div>

          {/* Slug: tên thật của trường là "slug"; nhãn giải thích nó là phần cuối đường dẫn. */}
          <div>
            <label htmlFor="slug" className={labelClass}>
              Đường dẫn (slug) <span className="text-gray-600 font-normal">(tự sinh từ tên)</span>
            </label>
            <div className="flex items-center">
              <span
                id="slug-prefix"
                className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-500 rounded-l-xl text-gray-600"
              >
                /courses/
              </span>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setFormData({ ...formData, slug: e.target.value });
                }}
                placeholder="kinh-te-vi-mo"
                aria-describedby="slug-prefix"
                className="flex-1 px-4 py-3 border border-gray-500 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
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
              placeholder="Mô tả ngắn về khóa học..."
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

          {/* Ảnh bìa ở trang /courses */}
          <ImageUploadField
            label="Ảnh bìa"
            hint="Thẻ 220×280, tên khoá học đè lên 1/3 dưới ảnh — nên để phần dưới sáng, ít chi tiết."
            value={formData.imageUrl}
            onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
            previewClassName="w-[110px] h-[140px] rounded-xl"
          />

          {/* Is New */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) =>
                  setFormData({ ...formData, isNew: e.target.checked })
                }
                className={checkboxClass}
              />
              <span className="text-sm font-medium text-gray-700">
                Đánh dấu là khóa học mới
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/courses"
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
              <span>{loading ? 'Đang lưu...' : 'Lưu khóa học'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

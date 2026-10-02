'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Save } from 'lucide-react';
import { slugify } from '@/lib/utils/slug';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function NewCourseDraftPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [icon, setIcon] = useState('book-open');

  useEffect(() => {
    fetch('/api/contributor/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setError('Không thể tải danh mục'));
  }, []);

  // The server derives the real slug from the name when the course is approved
  // (unique among all courses), so this is only a preview.
  const slug = slugify(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name || !categoryId) {
      setError('Tên khóa học và danh mục là bắt buộc');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/contributor/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_COURSE',
          data: {
            course: { name, slug, description, categoryId, icon },
            levels: [],
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Đã xảy ra lỗi');
        return;
      }

      const contribution = await response.json();
      router.push(`/contributor/contributions/${contribution.id}/edit`);
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/contributor"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tạo khóa học mới</h1>
        <p className="text-sm text-gray-500 mt-1">
          Điền thông tin cơ bản, sau đó bạn sẽ thêm levels và bài học.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label htmlFor="new-course-category" className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              id="new-course-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="new-course-name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              id="new-course-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Kinh tế học cơ bản"
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (slug)</p>
            <p className="px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500 font-mono break-all">
              /courses/{slug || 'khoa-hoc'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Tự tạo từ tên khóa học khi được duyệt (thêm số nếu trùng với khóa học khác), nên không sửa ở đây.
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="new-course-description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="new-course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn về khóa học"
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Đang tạo...' : 'Tạo bản nháp'}
          </button>
        </form>
      </div>
    </div>
  );
}

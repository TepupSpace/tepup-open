'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { Save, BookMarked } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
import ImageUploadField from '@/components/admin/ImageUploadField';
import Spinner from '@/components/ui/Spinner';
import {
  BackLink,
  FormError,
  RequiredMark,
  RequiredNote,
  checkboxClass,
  inputClass,
  labelClass,
} from '../../../_components/form';
import RelatedPicker from '../../../_components/RelatedPicker';

interface Category {
  id: string;
  name: string;
}

interface Story {
  id: string;
  title: string;
  slug: string;
}

interface Recommendation {
  id: string;
  storyId: string;
  story: Story;
}

interface Course {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  isNew: boolean;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
  recommendations?: Recommendation[];
}

export default function EditCourseClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'book-open',
    categoryId: '',
    isNew: false,
    imageUrl: '',
    isActive: true,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stories');
      const data = await res.json();
      if (data.data) {
        setStories(data.data);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
    }
  }, []);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError('Không tìm thấy khóa học');
        return;
      }

      const course: Course = data.data;
      setFormData({
        name: course.name,
        slug: course.slug,
        description: course.description || '',
        icon: course.icon,
        categoryId: course.categoryId,
        isNew: course.isNew,
        imageUrl: course.imageUrl || '',
        isActive: course.isActive,
      });
      // Set selected story IDs from recommendations
      if (course.recommendations) {
        setSelectedStoryIds(course.recommendations.map((r) => r.story.id));
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Đã xảy ra lỗi khi tải khóa học');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchStories(), fetchCourse()]);
  }, [fetchCategories, fetchCourse, fetchStories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nút lưu không bị `disabled` khi đang lưu (để không mất focus): chặn bấm lặp ở đây.
    if (saving) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể cập nhật khóa học');
        return;
      }

      // Also save recommendations
      await saveRecommendations();

      router.push('/admin/courses');
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Đã xảy ra lỗi khi cập nhật');
    } finally {
      setSaving(false);
    }
  }

  async function saveRecommendations() {
    try {
      await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: id,
          storyIds: selectedStoryIds,
        }),
      });
    } catch (err) {
      console.error('Error saving recommendations:', err);
    }
  }

  function handleAddStory(storyId: string) {
    if (!selectedStoryIds.includes(storyId)) {
      setSelectedStoryIds([...selectedStoryIds, storyId]);
    }
  }

  function handleRemoveStory(storyId: string) {
    setSelectedStoryIds(selectedStoryIds.filter((sId) => sId !== storyId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải khóa học…" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackLink href="/admin/courses" label="Quay lại danh sách khóa học" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa khóa học</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin khóa học</p>
        </div>
      </div>

      {/* Course roles, outline history, deleted lessons (separate pages). */}
      <nav aria-label="Quản lý khóa học" className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link href={`/admin/courses/${id}/members`} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-800 hover:bg-gray-50">
          Trưởng khóa học và người duyệt
        </Link>
        <Link href={`/admin/history/COURSE_OUTLINE/${id}`} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-800 hover:bg-gray-50">
          Lịch sử mục lục
        </Link>
        <Link href={`/admin/courses/${id}/deleted`} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-800 hover:bg-gray-50">
          Bài đã xóa
        </Link>
      </nav>

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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className={inputClass}
            />
          </div>

          {/* Slug: tên thật của trường là "slug"; nhãn giải thích nó là phần cuối đường dẫn. */}
          <div>
            <label htmlFor="slug" className={labelClass}>
              Đường dẫn (slug) <RequiredMark />
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
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
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

          {/* Checkboxes */}
          <div className="space-y-3">
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

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className={checkboxClass}
              />
              <span className="text-sm font-medium text-gray-700">
                Hiển thị khóa học
              </span>
            </label>
          </div>

          {/* Related Stories */}
          <RelatedPicker
            legend="Câu chuyện đề xuất"
            hint="Chọn các câu chuyện liên quan. Khóa học này sẽ được hiển thị trong các câu chuyện được chọn và ngược lại."
            icon={BookMarked}
            items={stories.map((s) => ({ id: s.id, label: s.title }))}
            selectedIds={selectedStoryIds}
            onAdd={handleAddStory}
            onRemove={handleRemoveStory}
            addPlaceholder="+ Thêm câu chuyện..."
            noun="câu chuyện"
            chipClassName="bg-pink-50 text-pink-700"
            removeHoverClassName="hover:bg-pink-100"
          />

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
              aria-disabled={saving || undefined}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 aria-disabled:opacity-70 aria-disabled:cursor-wait transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

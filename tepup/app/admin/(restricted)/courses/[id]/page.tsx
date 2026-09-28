'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Save, X, BookMarked } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
import ImageUploadField from '@/components/admin/ImageUploadField';

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

export default function EditCoursePage({
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

  useEffect(() => {
    Promise.all([fetchCategories(), fetchStories(), fetchCourse()]);
  }, [id]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  async function fetchStories() {
    try {
      const res = await fetch('/api/admin/stories');
      const data = await res.json();
      if (data.data) {
        setStories(data.data);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
    }
  }

  async function fetchCourse() {
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/courses"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa khóa học</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin khóa học</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500">
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
                className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <IconPicker
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
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
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
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Hiển thị khóa học
              </span>
            </label>
          </div>

          {/* Related Stories */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <BookMarked className="w-4 h-4 inline mr-2" />
              Câu chuyện đề xuất
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Chọn các câu chuyện liên quan. Khóa học này sẽ được hiển thị trong các câu chuyện được chọn và ngược lại.
            </p>

            {/* Selected stories */}
            {selectedStoryIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedStoryIds.map((storyId) => {
                  const story = stories.find((s) => s.id === storyId);
                  if (!story) return null;
                  return (
                    <span
                      key={storyId}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg text-sm"
                    >
                      {story.title}
                      <button
                        type="button"
                        onClick={() => handleRemoveStory(storyId)}
                        className="ml-1 hover:bg-pink-100 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Story selector */}
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddStory(e.target.value);
                }
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">+ Thêm câu chuyện...</option>
              {stories
                .filter((s) => !selectedStoryIds.includes(s.id))
                .map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
            </select>
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
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

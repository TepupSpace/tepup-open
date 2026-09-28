'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Save, Layers, X, BookOpen } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';

interface Character {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  slug: string;
}

interface Recommendation {
  id: string;
  courseId: string;
  course: Course;
}

interface Story {
  id: string;
  slug: string;
  title: string;
  teaser: string | null;
  icon: string;
  estimatedTime: string;
  isActive: boolean;
  characterId: string;
  recommendations?: Recommendation[];
  _count?: {
    parts: number;
  };
}

export default function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingRecommendations, setSavingRecommendations] = useState(false);
  const [error, setError] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [partsCount, setPartsCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    teaser: '',
    characterId: '',
    icon: 'book',
    estimatedTime: '~20 phút',
    isActive: true,
  });

  useEffect(() => {
    Promise.all([fetchCharacters(), fetchCourses(), fetchStory()]);
  }, [id]);

  async function fetchCharacters() {
    try {
      const res = await fetch('/api/admin/characters');
      const data = await res.json();
      if (data.data) {
        setCharacters(data.data);
      }
    } catch (err) {
      console.error('Error fetching characters:', err);
    }
  }

  async function fetchCourses() {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      if (data.data) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }

  async function fetchStory() {
    try {
      const res = await fetch(`/api/admin/stories/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError('Không tìm thấy câu chuyện');
        return;
      }

      const s: Story = data.data;
      setFormData({
        title: s.title,
        slug: s.slug,
        teaser: s.teaser || '',
        characterId: s.characterId,
        icon: s.icon,
        estimatedTime: s.estimatedTime,
        isActive: s.isActive,
      });
      setPartsCount(s._count?.parts || data.data.parts?.length || 0);
      // Set selected course IDs from recommendations
      if (s.recommendations) {
        setSelectedCourseIds(s.recommendations.map((r) => r.course.id));
      }
    } catch (err) {
      console.error('Error fetching story:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể cập nhật câu chuyện');
        return;
      }

      // Also save recommendations
      await saveRecommendations();

      router.push('/admin/stories');
    } catch (err) {
      console.error('Error updating story:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function saveRecommendations() {
    setSavingRecommendations(true);
    try {
      await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: id,
          courseIds: selectedCourseIds,
        }),
      });
    } catch (err) {
      console.error('Error saving recommendations:', err);
    } finally {
      setSavingRecommendations(false);
    }
  }

  function handleAddCourse(courseId: string) {
    if (!selectedCourseIds.includes(courseId)) {
      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  }

  function handleRemoveCourse(courseId: string) {
    setSelectedCourseIds(selectedCourseIds.filter((cId) => cId !== courseId));
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
          href="/admin/stories"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa câu chuyện</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin câu chuyện</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-6 border border-pink-100">
        <Link
          href={`/admin/stories/${id}/parts`}
          className="flex items-center justify-between hover:bg-white/50 rounded-xl p-3 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Quản lý Phần & Chương</p>
              <p className="text-sm text-gray-500">{partsCount} phần</p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Character */}
          <div>
            <label
              htmlFor="characterId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nhân vật <span className="text-red-500">*</span>
            </label>
            <select
              id="characterId"
              value={formData.characterId}
              onChange={(e) =>
                setFormData({ ...formData, characterId: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn nhân vật...</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
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
                /story/
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

          {/* Teaser */}
          <div>
            <label
              htmlFor="teaser"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mô tả ngắn
            </label>
            <textarea
              id="teaser"
              value={formData.teaser}
              onChange={(e) =>
                setFormData({ ...formData, teaser: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Icon & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
            <div>
              <label
                htmlFor="estimatedTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Thời gian ước tính
              </label>
              <input
                id="estimatedTime"
                type="text"
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedTime: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Checkbox */}
          <div>
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
                Hiển thị câu chuyện
              </span>
            </label>
          </div>

          {/* Related Courses */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Khóa học đề xuất
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Chọn các khóa học liên quan. Câu chuyện này sẽ được hiển thị trong các khóa học được chọn và ngược lại.
            </p>

            {/* Selected courses */}
            {selectedCourseIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCourseIds.map((courseId) => {
                  const course = courses.find((c) => c.id === courseId);
                  if (!course) return null;
                  return (
                    <span
                      key={courseId}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                    >
                      {course.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(courseId)}
                        className="ml-1 hover:bg-blue-100 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Course selector */}
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddCourse(e.target.value);
                }
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">+ Thêm khóa học...</option>
              {courses
                .filter((c) => !selectedCourseIds.includes(c.id))
                .map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/stories"
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

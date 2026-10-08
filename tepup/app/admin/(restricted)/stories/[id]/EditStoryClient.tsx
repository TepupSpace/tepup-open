'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { Save, Layers, BookOpen, ChevronRight } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
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

export default function EditStoryClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    // Nút lưu không bị `disabled` khi đang lưu (để không mất focus): chặn bấm lặp ở đây.
    if (saving) return;
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
        <Spinner size="lg" label="Đang tải câu chuyện…" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackLink href="/admin/stories" label="Quay lại danh sách câu chuyện" />
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
            <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Quản lý phần và chương</p>
              <p className="text-sm text-gray-600">{partsCount} phần</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <FormError message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <RequiredNote />

          {/* Character */}
          <div>
            <label htmlFor="characterId" className={labelClass}>
              Nhân vật <RequiredMark />
            </label>
            <select
              id="characterId"
              value={formData.characterId}
              onChange={(e) =>
                setFormData({ ...formData, characterId: e.target.value })
              }
              required
              className={inputClass}
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
            <label htmlFor="title" className={labelClass}>
              Tiêu đề <RequiredMark />
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
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
                aria-describedby="slug-prefix"
                className="flex-1 px-4 py-3 border border-gray-500 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Teaser */}
          <div>
            <label htmlFor="teaser" className={labelClass}>
              Mô tả ngắn
            </label>
            <textarea
              id="teaser"
              value={formData.teaser}
              onChange={(e) =>
                setFormData({ ...formData, teaser: e.target.value })
              }
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Icon & Time */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label htmlFor="estimatedTime" className={labelClass}>
                Thời gian ước tính
              </label>
              <input
                id="estimatedTime"
                type="text"
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedTime: e.target.value })
                }
                className={inputClass}
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
                className={checkboxClass}
              />
              <span className="text-sm font-medium text-gray-700">
                Hiển thị câu chuyện
              </span>
            </label>
          </div>

          {/* Related Courses */}
          <RelatedPicker
            legend="Khóa học đề xuất"
            hint="Chọn các khóa học liên quan. Câu chuyện này sẽ được hiển thị trong các khóa học được chọn và ngược lại."
            icon={BookOpen}
            items={courses.map((c) => ({ id: c.id, label: c.name }))}
            selectedIds={selectedCourseIds}
            onAdd={handleAddCourse}
            onRemove={handleRemoveCourse}
            addPlaceholder="+ Thêm khóa học..."
            noun="khóa học"
            chipClassName="bg-blue-50 text-blue-700"
            removeHoverClassName="hover:bg-blue-100"
          />

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

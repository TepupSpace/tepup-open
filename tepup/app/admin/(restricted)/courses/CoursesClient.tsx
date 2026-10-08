'use client';

import { useState, useEffect, useRef } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { getIcon } from '@/components/admin/IconPicker';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import ConfirmDialog from '../../_components/ConfirmDialog';

interface Course {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  isNew: boolean;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  _count: {
    levels: number;
  };
  lessonCount: number;
}

export default function CoursesClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [message, announce] = useAnnouncer();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      if (data.data) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const name = courses.find((c) => c.id === id)?.name ?? '';
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Không thể xóa khóa học');
        return;
      }

      setCourses(courses.filter((c) => c.id !== id));
      setDeleteId(null);
      announce(`Đã xóa khóa học ${name}.`);
    } catch (err) {
      console.error('Error deleting course:', err);
      setDeleteError('Đã xảy ra lỗi khi xóa');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải khóa học…" />
      </div>
    );
  }

  const toDelete = courses.find((x) => x.id === deleteId);

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">Khóa học</h1>
          <p className="text-gray-600 mt-1">Quản lý các khóa học</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm khóa học</span>
        </Link>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <caption className="sr-only">Danh sách khóa học</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Khóa học
              </th>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Danh mục
              </th>
              <th scope="col" className="text-center px-6 py-4 text-sm font-medium text-gray-600">
                Cấp độ
              </th>
              <th scope="col" className="text-center px-6 py-4 text-sm font-medium text-gray-600">
                Bài học
              </th>
              <th scope="col" className="text-center px-6 py-4 text-sm font-medium text-gray-600">
                Trạng thái
              </th>
              <th scope="col" className="text-right px-6 py-4 text-sm font-medium text-gray-600">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Chưa có khóa học nào. Hãy tạo khóa học đầu tiên!
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                const Icon = getIcon(course.icon);
                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 text-left font-normal">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {course.name}
                            </span>
                            {course.isNew && (
                              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                Mới
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            /{course.slug}
                          </span>
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4 text-gray-600">
                      {course.category.name}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {course._count.levels}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {course.lessonCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          course.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {course.isActive ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.id}/levels`}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Quản lý cấp độ và bài học"
                          aria-label={`Quản lý cấp độ và bài học của ${course.name}`}
                        >
                          <Layers className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                          aria-label={`Chỉnh sửa khóa học ${course.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => { setDeleteError(''); setDeleteId(course.id); }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                          aria-label={`Xóa khóa học ${course.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <ConfirmDialog
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
          busy={deleting}
          error={deleteError}
          fallbackFocus={() => headingRef.current}
        >
          Bạn có chắc chắn muốn xóa khóa học{toDelete ? ` “${toDelete.name}”` : ' này'}? Hành động này không thể hoàn tác.
        </ConfirmDialog>
      )}
    </div>
  );
}

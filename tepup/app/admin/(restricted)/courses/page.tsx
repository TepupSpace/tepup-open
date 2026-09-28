'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { getIcon } from '@/components/admin/IconPicker';

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

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
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể xóa khóa học');
        return;
      }

      setCourses(courses.filter((c) => c.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Đã xảy ra lỗi khi xóa');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khóa học</h1>
          <p className="text-gray-600 mt-1">Quản lý các khóa học</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm khóa học</span>
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-800 hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                Khóa học
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                Danh mục
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">
                Levels
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">
                Bài học
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">
                Trạng thái
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
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
                    <td className="px-6 py-4">
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
                    </td>
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
                          title="Quản lý Levels"
                        >
                          <Layers className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(course.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

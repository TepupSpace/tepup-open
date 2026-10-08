'use client';

import { useState, useEffect, useRef } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getIcon } from '@/components/admin/IconPicker';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import ConfirmDialog from '../../_components/ConfirmDialog';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  _count: {
    courses: number;
  };
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [message, announce] = useAnnouncer();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const name = categories.find((c) => c.id === id)?.name ?? '';
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Không thể xóa danh mục');
        return;
      }

      setCategories(categories.filter((c) => c.id !== id));
      setDeleteId(null);
      announce(`Đã xóa danh mục ${name}.`);
    } catch (err) {
      console.error('Error deleting category:', err);
      setDeleteError('Đã xảy ra lỗi khi xóa');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải danh mục…" />
      </div>
    );
  }

  const toDelete = categories.find((c) => c.id === deleteId);

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">
            Danh mục
          </h1>
          <p className="text-gray-600 mt-1">Quản lý các danh mục khóa học</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm danh mục</span>
        </Link>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <caption className="sr-only">Danh sách danh mục</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Danh mục
              </th>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Mô tả
              </th>
              <th scope="col" className="text-center px-6 py-4 text-sm font-medium text-gray-600">
                Khóa học
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
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const Icon = getIcon(category.icon);
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 text-left font-normal">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </th>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {category._count.courses}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.isActive ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                          aria-label={`Chỉnh sửa danh mục ${category.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteId(category.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                          aria-label={`Xóa danh mục ${category.name}`}
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
          Bạn có chắc chắn muốn xóa danh mục{toDelete ? ` “${toDelete.name}”` : ' này'}? Hành động này không thể hoàn tác.
        </ConfirmDialog>
      )}
    </div>
  );
}

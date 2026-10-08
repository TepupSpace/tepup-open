'use client';

import { useState, useEffect, useRef } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import ConfirmDialog from '../../_components/ConfirmDialog';

interface LibraryDocument {
  id: string;
  title: string;
  description: string;
  category: string | null;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LibraryClient() {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [message, announce] = useAnnouncer();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Client-side filtering
    let filtered = documents;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(search) ||
          doc.description.toLowerCase().includes(search)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((doc) => doc.category === categoryFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, categoryFilter]);

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/admin/library');
      const data = await res.json();
      if (data.data) {
        setDocuments(data.data);
        setFilteredDocuments(data.data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(
            data.data
              .map((doc: LibraryDocument) => doc.category)
              .filter((cat: string | null): cat is string => cat !== null)
          )
        ).sort();
        setCategories(uniqueCategories as string[]);
      }
    } catch (err) {
      console.error('Error fetching library documents:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const name = documents.find((d) => d.id === id)?.title ?? '';
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/library/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Không thể xóa tài liệu');
        return;
      }

      setDocuments(documents.filter((d) => d.id !== id));
      setDeleteId(null);
      announce(`Đã xóa tài liệu ${name}.`);
    } catch (err) {
      console.error('Error deleting document:', err);
      setDeleteError('Đã xảy ra lỗi khi xóa');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải tài liệu…" />
      </div>
    );
  }

  const toDelete = documents.find((x) => x.id === deleteId);

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">Thư viện</h1>
          <p className="text-gray-600 mt-1">Quản lý tài liệu thư viện</p>
        </div>
        <Link
          href="/admin/library/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo tài liệu mới</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <label htmlFor="library-search" className="sr-only">
            Tìm tài liệu
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            id="library-search"
            type="search"
            placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Category Filter */}
        <div className="relative min-w-[200px]">
          <label htmlFor="library-category" className="sr-only">
            Lọc theo danh mục
          </label>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            id="library-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none bg-white cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Số kết quả khi lọc, đọc cho người dùng trình đọc màn hình (bảng đổi mà không có gì báo). */}
      <p role="status" className="sr-only">
        {searchTerm || categoryFilter ? `${filteredDocuments.length} tài liệu phù hợp` : ''}
      </p>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <caption className="sr-only">Danh sách tài liệu thư viện</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Tài liệu
              </th>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Danh mục
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
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || categoryFilter
                    ? 'Không tìm thấy tài liệu nào'
                    : 'Chưa có tài liệu nào. Hãy tạo tài liệu đầu tiên!'}
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 text-left font-normal">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        {doc.title}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {doc.description}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    {doc.category ? (
                      <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        {doc.category}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        doc.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {doc.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/library/${doc.id}`}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                        aria-label={`Chỉnh sửa tài liệu ${doc.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => { setDeleteError(''); setDeleteId(doc.id); }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                        aria-label={`Xóa tài liệu ${doc.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
          Bạn có chắc chắn muốn xóa tài liệu{toDelete ? ` “${toDelete.title}”` : ' này'}? Hành động này không thể hoàn tác.
        </ConfirmDialog>
      )}
    </div>
  );
}

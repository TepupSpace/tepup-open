'use client';

import { useState, useEffect, useRef } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { getIcon } from '@/components/admin/IconPicker';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import ConfirmDialog from '../../_components/ConfirmDialog';

interface Story {
  id: string;
  slug: string;
  title: string;
  teaser: string | null;
  icon: string;
  estimatedTime: string;
  isActive: boolean;
  character: {
    id: string;
    name: string;
  };
  _count: {
    parts: number;
  };
  chapterCount: number;
}

export default function StoriesClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [message, announce] = useAnnouncer();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      const res = await fetch('/api/admin/stories');
      const data = await res.json();
      if (data.data) {
        setStories(data.data);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const name = stories.find((x) => x.id === id)?.title ?? '';
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Không thể xóa câu chuyện');
        return;
      }

      setStories(stories.filter((s) => s.id !== id));
      setDeleteId(null);
      announce(`Đã xóa câu chuyện ${name}.`);
    } catch (err) {
      console.error('Error deleting story:', err);
      setDeleteError('Đã xảy ra lỗi khi xóa');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải câu chuyện…" />
      </div>
    );
  }

  const toDelete = stories.find((x) => x.id === deleteId);

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">Câu chuyện</h1>
          <p className="text-gray-600 mt-1">Quản lý các câu chuyện học tập</p>
        </div>
        <Link
          href="/admin/stories/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm câu chuyện</span>
        </Link>
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <caption className="sr-only">Danh sách câu chuyện</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Câu chuyện
              </th>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Nhân vật
              </th>
              <th scope="col" className="text-center px-6 py-4 text-sm font-medium text-gray-600">
                Phần
              </th>
              <th scope="col" className="text-center px-6 py-4 text-sm font-medium text-gray-600">
                Chương
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
            {stories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Chưa có câu chuyện nào. Hãy tạo câu chuyện đầu tiên!
                </td>
              </tr>
            ) : (
              stories.map((story) => {
                const Icon = getIcon(story.icon);
                return (
                  <tr key={story.id} className="hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 text-left font-normal">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            {story.title}
                          </span>
                          <p className="text-sm text-gray-500">/{story.slug}</p>
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4 text-gray-600">
                      {story.character.name}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {story._count.parts}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {story.chapterCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          story.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {story.isActive ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/stories/${story.id}/parts`}
                          className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="Quản lý phần & chương"
                          aria-label={`Quản lý phần và chương của ${story.title}`}
                        >
                          <Layers className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/stories/${story.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                          aria-label={`Chỉnh sửa câu chuyện ${story.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => { setDeleteError(''); setDeleteId(story.id); }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                          aria-label={`Xóa câu chuyện ${story.title}`}
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
          Bạn có chắc chắn muốn xóa câu chuyện{toDelete ? ` “${toDelete.title}”` : ' này'}? Tất cả các phần và chương cũng sẽ bị xóa.
        </ConfirmDialog>
      )}
    </div>
  );
}

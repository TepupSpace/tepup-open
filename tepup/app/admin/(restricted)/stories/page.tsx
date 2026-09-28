'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { getIcon } from '@/components/admin/IconPicker';

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

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

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
    try {
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể xóa câu chuyện');
        return;
      }

      setStories(stories.filter((s) => s.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting story:', err);
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
          <h1 className="text-2xl font-bold text-gray-900">Câu chuyện</h1>
          <p className="text-gray-600 mt-1">Quản lý các câu chuyện học tập</p>
        </div>
        <Link
          href="/admin/stories/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm câu chuyện</span>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
          <button onClick={() => setError('')} className="ml-2 hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* Stories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                Câu chuyện
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                Nhân vật
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">
                Phần
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">
                Chương
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
                    <td className="px-6 py-4">
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
                    </td>
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
                        >
                          <Layers className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/stories/${story.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(story.id)}
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
              Bạn có chắc chắn muốn xóa câu chuyện này? Tất cả các phần và chương cũng sẽ bị xóa.
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

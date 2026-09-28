'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getIcon } from '@/components/admin/IconPicker';

interface Character {
  id: string;
  name: string;
  role: string;
  description: string | null;
  icon: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  _count: {
    stories: number;
  };
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCharacters();
  }, []);

  async function fetchCharacters() {
    try {
      const res = await fetch('/api/admin/characters');
      const data = await res.json();
      if (data.data) {
        setCharacters(data.data);
      }
    } catch (err) {
      console.error('Error fetching characters:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/characters/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể xóa nhân vật');
        return;
      }

      setCharacters(characters.filter((c) => c.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting character:', err);
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
          <h1 className="text-2xl font-bold text-gray-900">Nhân vật</h1>
          <p className="text-gray-600 mt-1">Quản lý các nhân vật trong câu chuyện</p>
        </div>
        <Link
          href="/admin/characters/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm nhân vật</span>
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

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">
              Chưa có nhân vật nào. Hãy tạo nhân vật đầu tiên!
            </p>
          </div>
        ) : (
          characters.map((character) => {
            const Icon = getIcon(character.icon);
            return (
              <div
                key={character.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 ${character.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className={`w-7 h-7 ${character.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {character.name}
                      </h3>
                      <p className="text-sm text-gray-500">{character.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/characters/${character.id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(character.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {character.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {character.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {character._count.stories} câu chuyện
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      character.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {character.isActive ? 'Hoạt động' : 'Ẩn'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa nhân vật này?
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

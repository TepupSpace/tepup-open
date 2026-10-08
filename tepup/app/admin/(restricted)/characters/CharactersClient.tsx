'use client';

import { useState, useEffect, useRef } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getIcon } from '@/components/admin/IconPicker';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import ConfirmDialog from '../../_components/ConfirmDialog';

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

export default function CharactersClient() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [message, announce] = useAnnouncer();
  const headingRef = useRef<HTMLHeadingElement>(null);

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
    const name = characters.find((c) => c.id === id)?.name ?? '';
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/characters/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Không thể xóa nhân vật');
        return;
      }

      setCharacters(characters.filter((c) => c.id !== id));
      setDeleteId(null);
      announce(`Đã xóa nhân vật ${name}.`);
    } catch (err) {
      console.error('Error deleting character:', err);
      setDeleteError('Đã xảy ra lỗi khi xóa');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải nhân vật…" />
      </div>
    );
  }

  const toDelete = characters.find((x) => x.id === deleteId);

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">Nhân vật</h1>
          <p className="text-gray-600 mt-1">Quản lý các nhân vật trong câu chuyện</p>
        </div>
        <Link
          href="/admin/characters/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm nhân vật</span>
        </Link>
      </div>

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
                      <h2 className="font-semibold text-gray-900">
                        {character.name}
                      </h2>
                      <p className="text-sm text-gray-500">{character.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/characters/${character.id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                      aria-label={`Chỉnh sửa nhân vật ${character.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setDeleteError(''); setDeleteId(character.id); }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                      aria-label={`Xóa nhân vật ${character.name}`}
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
        <ConfirmDialog
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
          busy={deleting}
          error={deleteError}
          fallbackFocus={() => headingRef.current}
        >
          Bạn có chắc chắn muốn xóa nhân vật{toDelete ? ` “${toDelete.name}”` : ' này'}?
        </ConfirmDialog>
      )}
    </div>
  );
}

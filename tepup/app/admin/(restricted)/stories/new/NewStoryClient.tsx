'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { Save } from 'lucide-react';
import { slugify } from '@/lib/utils/slug';
import IconPicker from '@/components/admin/IconPicker';
import {
  BackLink,
  FormError,
  RequiredMark,
  RequiredNote,
  inputClass,
  labelClass,
} from '../../../_components/form';

interface Character {
  id: string;
  name: string;
}

export default function NewStoryClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    teaser: '',
    characterId: '',
    icon: 'book',
    estimatedTime: '~20 phút',
  });
  // Once the admin edits the slug by hand, stop mirroring it from the title.
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    fetchCharacters();
  }, []);

  async function fetchCharacters() {
    try {
      const res = await fetch('/api/admin/characters');
      const data = await res.json();
      if (data.data) {
        setCharacters(data.data);
        if (data.data.length > 0) {
          setFormData((prev) => ({ ...prev, characterId: data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching characters:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nút lưu không bị `disabled` khi đang lưu (để không mất focus): chặn bấm lặp ở đây.
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể tạo câu chuyện');
        return;
      }

      router.push('/admin/stories');
    } catch (err) {
      console.error('Error creating story:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackLink href="/admin/stories" label="Quay lại danh sách câu chuyện" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm câu chuyện mới</h1>
          <p className="text-gray-600 mt-1">Tạo một câu chuyện học tập mới</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <FormError message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <RequiredNote />

          {/* Character */}
          <div>
            <label htmlFor="story-character" className={labelClass}>
              Nhân vật <RequiredMark />
            </label>
            <select
              id="story-character"
              value={formData.characterId}
              onChange={(e) =>
                setFormData({ ...formData, characterId: e.target.value })
              }
              required
              className={inputClass}
            >
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="story-title" className={labelClass}>
              Tiêu đề <RequiredMark />
            </label>
            <input
              id="story-title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData({
                  ...formData,
                  title,
                  slug: slugTouched ? formData.slug : slugify(title),
                });
              }}
              placeholder="VD: Minh và bài toán thuế đầu tiên"
              required
              className={inputClass}
            />
          </div>

          {/* Slug: tên thật của trường là "slug"; nhãn giải thích nó là phần cuối đường dẫn. */}
          <div>
            <label htmlFor="story-slug" className={labelClass}>
              Đường dẫn (slug) <span className="text-gray-600 font-normal">(tự sinh từ tiêu đề)</span>
            </label>
            <div className="flex items-center">
              <span
                id="story-slug-prefix"
                className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-500 rounded-l-xl text-gray-600"
              >
                /story/
              </span>
              <input
                id="story-slug"
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setFormData({ ...formData, slug: e.target.value });
                }}
                placeholder="minh-va-bai-toan-thue"
                aria-describedby="story-slug-prefix"
                className="flex-1 px-4 py-3 border border-gray-500 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Teaser */}
          <div>
            <label htmlFor="story-teaser" className={labelClass}>
              Mô tả ngắn
            </label>
            <textarea
              id="story-teaser"
              value={formData.teaser}
              onChange={(e) =>
                setFormData({ ...formData, teaser: e.target.value })
              }
              placeholder="Mô tả ngắn về câu chuyện..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

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

          {/* Estimated Time */}
          <div>
            <label htmlFor="story-time" className={labelClass}>
              Thời gian ước tính
            </label>
            <input
              id="story-time"
              type="text"
              value={formData.estimatedTime}
              onChange={(e) =>
                setFormData({ ...formData, estimatedTime: e.target.value })
              }
              placeholder="~20 phút"
              className={inputClass}
            />
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
              aria-disabled={loading || undefined}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 aria-disabled:opacity-70 aria-disabled:cursor-wait transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : 'Lưu câu chuyện'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

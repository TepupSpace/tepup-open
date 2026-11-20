'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { Save } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
import ImageUploadField from '@/components/admin/ImageUploadField';
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
import CharacterColorPicker from '../CharacterColorPicker';
import CharacterStampPreview from '../CharacterStampPreview';

export default function EditCharacterClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    icon: 'user',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    avatarUrl: '',
    imageUrl: '',
    isActive: true,
  });

  const fetchCharacter = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/characters/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError('Không tìm thấy nhân vật');
        return;
      }

      const char = data.data;
      setFormData({
        name: char.name,
        role: char.role,
        description: char.description || '',
        icon: char.icon,
        color: char.color,
        bgColor: char.bgColor,
        avatarUrl: char.avatarUrl || '',
        imageUrl: char.imageUrl || '',
        isActive: char.isActive,
      });
    } catch (err) {
      console.error('Error fetching character:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nút lưu không bị `disabled` khi đang lưu (để không mất focus): chặn bấm lặp ở đây.
    if (saving) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể cập nhật nhân vật');
        return;
      }

      router.push('/admin/characters');
    } catch (err) {
      console.error('Error updating character:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  function handleColorChange(color: string, bgColor: string) {
    setFormData({ ...formData, color, bgColor });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải nhân vật…" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackLink href="/admin/characters" label="Quay lại danh sách nhân vật" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa nhân vật</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin nhân vật</p>
        </div>
      </div>

      {/* Form */}
      <div className="staff-card p-6">
        <FormError message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <RequiredNote />

          {/* Name */}
          <div>
            <label htmlFor="character-name" className={labelClass}>
              Tên nhân vật <RequiredMark />
            </label>
            <input
              id="character-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className={inputClass}
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="character-role" className={labelClass}>
              Vai trò <RequiredMark />
            </label>
            <input
              id="character-role"
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="character-description" className={labelClass}>
              Câu trích dẫn trên tem
            </label>
            <p id="character-description-hint" className="text-xs text-gray-600 mb-1">
              Một câu ngắn nhân vật nói, in dưới tên và vai trò trên tem (khoảng 3 dòng).
            </p>
            <textarea
              id="character-description"
              aria-describedby="character-description-hint"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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

          {/* Ảnh ở trang /courses */}
          <ImageUploadField
            label="Ảnh tem"
            hint="Ảnh chân dung, vuông khoảng 262×266, hiện trên tem ở /courses và trang nhân vật."
            value={formData.imageUrl}
            onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
            previewClassName="w-[105px] h-[106px] rounded-md"
          />
          <ImageUploadField
            label="Ảnh nhỏ"
            hint="Ảnh vuông 90×90, hiện trên thẻ câu chuyện."
            value={formData.avatarUrl}
            onChange={(avatarUrl) => setFormData({ ...formData, avatarUrl })}
            previewClassName="w-[90px] h-[90px] rounded-xl"
          />
          <CharacterStampPreview
            name={formData.name}
            role={formData.role}
            quote={formData.description}
            imageUrl={formData.imageUrl}
          />

          {/* Color */}
          <CharacterColorPicker value={formData.color} onChange={handleColorChange} />

          {/* Active */}
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
                Hiển thị nhân vật
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/characters"
              className="staff-btn staff-btn--ghost"
            >
              Hủy
            </Link>
            <button
              type="submit"
              aria-disabled={saving || undefined}
              className="staff-btn staff-btn--primary aria-disabled:opacity-70 aria-disabled:cursor-wait"
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

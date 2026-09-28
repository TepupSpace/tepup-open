'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Save } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
import ImageUploadField from '@/components/admin/ImageUploadField';

const colorOptions = [
  { value: 'text-blue-600', bg: 'bg-blue-50', label: 'Xanh dương' },
  { value: 'text-green-600', bg: 'bg-green-50', label: 'Xanh lá' },
  { value: 'text-purple-600', bg: 'bg-purple-50', label: 'Tím' },
  { value: 'text-orange-600', bg: 'bg-orange-50', label: 'Cam' },
  { value: 'text-pink-600', bg: 'bg-pink-50', label: 'Hồng' },
  { value: 'text-red-600', bg: 'bg-red-50', label: 'Đỏ' },
];

export default function NewCharacterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể tạo nhân vật');
        return;
      }

      router.push('/admin/characters');
    } catch (err) {
      console.error('Error creating character:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  function handleColorChange(color: string, bgColor: string) {
    setFormData({ ...formData, color, bgColor });
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/characters"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm nhân vật mới</h1>
          <p className="text-gray-600 mt-1">Tạo một nhân vật mới cho câu chuyện</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên nhân vật <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Minh"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="VD: Sinh viên năm 3"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn về nhân vật..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <IconPicker
              value={formData.icon}
              onChange={(icon) => setFormData({ ...formData, icon })}
            />
          </div>

          {/* Ảnh ở trang /courses */}
          <ImageUploadField
            label="Avatar"
            hint="Ảnh vuông, hiển thị cắt tròn ở khối “Học qua Câu chuyện”."
            value={formData.avatarUrl}
            onChange={(avatarUrl) => setFormData({ ...formData, avatarUrl })}
            previewClassName="w-20 h-20 rounded-full"
          />
          <ImageUploadField
            label="Ảnh nhân vật"
            hint="Ảnh toàn thân hoặc bán thân, nền trong suốt (tỉ lệ khoảng 367×422)."
            value={formData.imageUrl}
            onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
            previewClassName="w-[110px] h-[126px] rounded-xl"
          />

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Màu sắc
            </label>
            <div className="flex gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleColorChange(opt.value, opt.bg)}
                  className={`w-10 h-10 rounded-xl ${opt.bg} border-2 transition-all ${
                    formData.color === opt.value
                      ? 'border-gray-400 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  title={opt.label}
                >
                  <span className={`block w-4 h-4 rounded-full mx-auto ${opt.value.replace('text-', 'bg-')}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/characters"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : 'Lưu nhân vật'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

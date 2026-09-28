'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface DocumentContent {
  sections: {
    heading?: string;
    paragraphs: string[];
  }[];
  relatedConcepts?: string[];
  furtherReading?: string[];
}

interface LibraryDocument {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string | null;
  icon: string | null;
  content: DocumentContent;
  isActive: boolean;
}

export default function EditLibraryDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    category: '',
    icon: '',
    isActive: true,
  });
  const [content, setContent] = useState<DocumentContent>({
    sections: [{ paragraphs: [''] }],
  });

  useEffect(() => {
    if (!isNew) {
      fetchDocument();
    }
  }, [id, isNew]);

  async function fetchDocument() {
    try {
      const res = await fetch(`/api/admin/library/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError('Không tìm thấy tài liệu');
        return;
      }

      const doc: LibraryDocument = data.data;
      setFormData({
        title: doc.title,
        description: doc.description,
        slug: doc.slug,
        category: doc.category || '',
        icon: doc.icon || '',
        isActive: doc.isActive,
      });
      setContent(doc.content as DocumentContent);
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Đã xảy ra lỗi khi tải tài liệu');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    console.log('📝 Submitting form...', { formData, content });

    if (!formData.title || formData.title.trim() === '') {
      setError('Tiêu đề là bắt buộc');
      setSaving(false);
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      setError('Mô tả là bắt buộc');
      setSaving(false);
      return;
    }

    if (content.sections.length === 0) {
      setError('Vui lòng thêm ít nhất một phần nội dung');
      setSaving(false);
      return;
    }

    // Check if at least one section has non-empty content
    const hasValidContent = content.sections.some((section) =>
      section.paragraphs && section.paragraphs.some((p) => p.trim() !== '')
    );

    if (!hasValidContent) {
      setError('Vui lòng thêm ít nhất một đoạn văn có nội dung');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        category: formData.category || null,
        icon: formData.icon || null,
        content,
      };

      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

      const url = isNew ? '/api/admin/library' : `/api/admin/library/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log('📥 Response:', { status: res.status, data });

      if (!res.ok) {
        console.error('❌ API error:', data);
        setError(data.error || `Không thể ${isNew ? 'tạo' : 'cập nhật'} tài liệu`);
        return;
      }

      console.log('✅ Document saved successfully');
      router.push('/admin/library');
    } catch (err) {
      console.error('❌ Error saving document:', err);
      setError('Đã xảy ra lỗi khi lưu. Vui lòng kiểm tra console để biết chi tiết.');
    } finally {
      setSaving(false);
    }
  }

  // Content manipulation functions
  function addSection() {
    setContent({
      ...content,
      sections: [...content.sections, { paragraphs: [''] }],
    });
  }

  function updateSection(
    index: number,
    field: 'heading' | 'paragraphs',
    value: any
  ) {
    const sections = [...content.sections];
    sections[index] = { ...sections[index], [field]: value };
    setContent({ ...content, sections });
  }

  function removeSection(index: number) {
    if (content.sections.length === 1) return;
    const sections = content.sections.filter((_, i) => i !== index);
    setContent({ ...content, sections });
  }

  function addParagraph(sectionIndex: number) {
    const sections = [...content.sections];
    sections[sectionIndex].paragraphs.push('');
    setContent({ ...content, sections });
  }

  function updateParagraph(
    sectionIndex: number,
    paraIndex: number,
    value: string
  ) {
    const sections = [...content.sections];
    sections[sectionIndex].paragraphs[paraIndex] = value;
    setContent({ ...content, sections });
  }

  function removeParagraph(sectionIndex: number, paraIndex: number) {
    const sections = [...content.sections];
    if (sections[sectionIndex].paragraphs.length === 1) return;
    sections[sectionIndex].paragraphs = sections[sectionIndex].paragraphs.filter(
      (_, i) => i !== paraIndex
    );
    setContent({ ...content, sections });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/library"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Tạo tài liệu mới' : 'Chỉnh sửa tài liệu'}
        </h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ví dụ: Chủ nghĩa tư bản"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="Tu dong tao tu tieu de"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Để trống để tự động tạo từ tiêu đề
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả ngắn <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="1-2 câu giới thiệu ngắn gọn..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Ví dụ: Định nghĩa, Phân tích, Lịch sử..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Hiển thị tài liệu này
            </label>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nội dung tài liệu
          </h2>

          <div className="space-y-4">
            {content.sections.map((section, sIdx) => (
              <div key={sIdx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Phần {sIdx + 1}
                  </span>
                  {content.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(sIdx)}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Section Heading */}
                <input
                  type="text"
                  value={section.heading || ''}
                  onChange={(e) =>
                    updateSection(sIdx, 'heading', e.target.value || undefined)
                  }
                  placeholder="Tiêu đề phần (tùy chọn)..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Paragraphs */}
                <div className="space-y-2">
                  {section.paragraphs.map((para, pIdx) => (
                    <div key={pIdx} className="flex gap-2">
                      <textarea
                        value={para}
                        onChange={(e) =>
                          updateParagraph(sIdx, pIdx, e.target.value)
                        }
                        placeholder={`Đoạn ${pIdx + 1}...`}
                        rows={3}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                      {section.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParagraph(sIdx, pIdx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addParagraph(sIdx)}
                  className="mt-2 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm đoạn văn</span>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSection}
            className="mt-3 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phần mới</span>
          </button>
        </div>

        {/* Related Concepts Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin bổ sung
          </h2>

          {/* Related Concepts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khái niệm liên quan (mỗi dòng một khái niệm)
            </label>
            <textarea
              value={content.relatedConcepts?.join('\n') || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  relatedConcepts: e.target.value
                    ? e.target.value.split('\n').filter((s) => s.trim())
                    : undefined,
                })
              }
              placeholder="Thị trường tự do&#10;Sở hữu tư nhân&#10;..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
            />
          </div>

          {/* Further Reading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đọc thêm (mỗi dòng một mục)
            </label>
            <textarea
              value={content.furtherReading?.join('\n') || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  furtherReading: e.target.value
                    ? e.target.value.split('\n').filter((s) => s.trim())
                    : undefined,
                })
              }
              placeholder="Lịch sử phát triển chủ nghĩa tư bản&#10;So sánh với chủ nghĩa xã hội&#10;..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/library"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isNew ? 'Tạo tài liệu' : 'Lưu thay đổi'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

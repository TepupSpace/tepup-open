'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer, useFocusAfterRender } from '@/components/blocks/useAnnouncer';
import { FormError, RequiredMark, RequiredNote, labelClass } from '../../../_components/form';

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

const fieldClass =
  'w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 aria-[invalid=true]:border-red-600';

/** Trường nào gây lỗi kiểm tra, để đánh dấu aria-invalid và đưa focus tới. */
type ErrorField = 'title' | 'description' | 'content' | null;

export default function LibraryDocumentClient({
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
  const [errorField, setErrorField] = useState<ErrorField>(null);
  const [message, announce] = useAnnouncer();
  const focusAfterRender = useFocusAfterRender();
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

  /** Báo lỗi kiểm tra: hiện trong vùng role="alert" và đưa focus tới ô cần sửa. */
  function fail(msg: string, field: ErrorField, focusId: string) {
    setError(msg);
    setErrorField(field);
    setSaving(false);
    focusAfterRender(() => document.getElementById(focusId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nút lưu không bị `disabled` khi đang lưu (để không mất focus): chặn bấm lặp ở đây.
    if (saving) return;
    setSaving(true);
    setError('');
    setErrorField(null);

    console.log('📝 Submitting form...', { formData, content });

    if (!formData.title || formData.title.trim() === '') {
      fail('Tiêu đề là bắt buộc', 'title', 'library-title');
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      fail('Mô tả là bắt buộc', 'description', 'library-description');
      return;
    }

    if (content.sections.length === 0) {
      fail('Vui lòng thêm ít nhất một phần nội dung', 'content', 'library-content-heading');
      return;
    }

    // Check if at least one section has non-empty content
    const hasValidContent = content.sections.some((section) =>
      section.paragraphs && section.paragraphs.some((p) => p.trim() !== '')
    );

    if (!hasValidContent) {
      fail('Vui lòng thêm ít nhất một đoạn văn có nội dung', 'content', 'library-s0-p0');
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

  // Content manipulation functions. Thêm: focus vào ô mới. Xoá: focus về ô kế bên còn lại,
  // để focus không rơi về <body> khi nút vừa bấm biến mất.
  function addSection() {
    const newIndex = content.sections.length;
    setContent({
      ...content,
      sections: [...content.sections, { paragraphs: [''] }],
    });
    focusAfterRender(() => document.getElementById(`library-s${newIndex}-heading`));
    announce(`Đã thêm phần ${newIndex + 1}.`);
  }

  function updateSection(
    index: number,
    field: 'heading' | 'paragraphs',
    value: string | string[] | undefined
  ) {
    const sections = [...content.sections];
    sections[index] = { ...sections[index], [field]: value };
    setContent({ ...content, sections });
  }

  function removeSection(index: number) {
    if (content.sections.length === 1) return;
    const sections = content.sections.filter((_, i) => i !== index);
    setContent({ ...content, sections });
    const next = Math.min(index, sections.length - 1);
    focusAfterRender(() => document.getElementById(`library-s${next}-heading`));
    announce(`Đã xóa phần ${index + 1}.`);
  }

  function addParagraph(sectionIndex: number) {
    const sections = [...content.sections];
    const newIndex = sections[sectionIndex].paragraphs.length;
    sections[sectionIndex].paragraphs.push('');
    setContent({ ...content, sections });
    focusAfterRender(() => document.getElementById(`library-s${sectionIndex}-p${newIndex}`));
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
    const next = Math.min(paraIndex, sections[sectionIndex].paragraphs.length - 1);
    focusAfterRender(() => document.getElementById(`library-s${sectionIndex}-p${next}`));
    announce(`Đã xóa đoạn ${paraIndex + 1} của phần ${sectionIndex + 1}.`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải tài liệu…" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

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
      <FormError id="library-error" message={error} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Basic Info Card */}
        <section aria-labelledby="library-basic-heading" className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 id="library-basic-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h2>
          <RequiredNote />

          {/* Title */}
          <div>
            <label htmlFor="library-title" className={labelClass}>
              Tiêu đề <RequiredMark />
            </label>
            <input
              id="library-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ví dụ: Chủ nghĩa tư bản"
              className={fieldClass}
              required
              aria-invalid={errorField === 'title' || undefined}
              aria-describedby={errorField === 'title' ? 'library-error' : undefined}
            />
          </div>

          {/* Slug: tên thật của trường là "slug"; nhãn giải thích nó là phần cuối đường dẫn. */}
          <div>
            <label htmlFor="library-slug" className={labelClass}>
              Đường dẫn (slug)
            </label>
            <input
              id="library-slug"
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="tu-dong-tao-tu-tieu-de"
              aria-describedby="library-slug-hint"
              className={fieldClass}
            />
            <p id="library-slug-hint" className="text-xs text-gray-500 mt-1">
              Để trống để tự động tạo từ tiêu đề
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="library-description" className={labelClass}>
              Mô tả ngắn <RequiredMark />
            </label>
            <textarea
              id="library-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="1-2 câu giới thiệu ngắn gọn..."
              rows={2}
              className={`${fieldClass} resize-none`}
              required
              aria-invalid={errorField === 'description' || undefined}
              aria-describedby={errorField === 'description' ? 'library-error' : undefined}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="library-category" className={labelClass}>
              Danh mục
            </label>
            <input
              id="library-category"
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Ví dụ: Định nghĩa, Phân tích, Lịch sử..."
              className={fieldClass}
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
              className="w-4 h-4 text-purple-600 border-gray-500 rounded focus:ring-purple-600"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Hiển thị tài liệu này
            </label>
          </div>
        </section>

        {/* Content Card */}
        <section aria-labelledby="library-content-heading" className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 id="library-content-heading" tabIndex={-1} className="text-lg font-semibold text-gray-900 mb-4">
            Nội dung tài liệu
          </h2>

          <div className="space-y-4">
            {content.sections.map((section, sIdx) => (
              <fieldset key={sIdx} className="relative p-4 bg-gray-50 rounded-lg">
                {/* legend phải là con đầu tiên của fieldset để làm tên nhóm; float để nằm trong khung. */}
                <legend className="float-left mb-3 text-sm font-medium text-gray-600">
                  Phần {sIdx + 1}
                </legend>
                {content.sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(sIdx)}
                    aria-label={`Xóa phần ${sIdx + 1}`}
                    title={`Xóa phần ${sIdx + 1}`}
                    className="absolute right-3 top-3 p-1 rounded text-sm text-red-700 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="clear-both" />

                {/* Section Heading */}
                <label htmlFor={`library-s${sIdx}-heading`} className="sr-only">
                  Tiêu đề phần {sIdx + 1} (tùy chọn)
                </label>
                <input
                  id={`library-s${sIdx}-heading`}
                  type="text"
                  value={section.heading || ''}
                  onChange={(e) =>
                    updateSection(sIdx, 'heading', e.target.value || undefined)
                  }
                  placeholder="Tiêu đề phần (tùy chọn)..."
                  className={`${fieldClass} mb-3 bg-white`}
                />

                {/* Paragraphs */}
                <div className="space-y-2">
                  {section.paragraphs.map((para, pIdx) => (
                    <div key={pIdx} className="flex gap-2">
                      <label htmlFor={`library-s${sIdx}-p${pIdx}`} className="sr-only">
                        Phần {sIdx + 1}, đoạn {pIdx + 1}
                      </label>
                      <textarea
                        id={`library-s${sIdx}-p${pIdx}`}
                        value={para}
                        onChange={(e) =>
                          updateParagraph(sIdx, pIdx, e.target.value)
                        }
                        placeholder={`Đoạn ${pIdx + 1}...`}
                        rows={3}
                        aria-invalid={(errorField === 'content' && sIdx === 0 && pIdx === 0) || undefined}
                        aria-describedby={
                          errorField === 'content' && sIdx === 0 && pIdx === 0 ? 'library-error' : undefined
                        }
                        className={`${fieldClass} flex-1 resize-none bg-white`}
                      />
                      {section.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParagraph(sIdx, pIdx)}
                          aria-label={`Xóa đoạn ${pIdx + 1} của phần ${sIdx + 1}`}
                          title="Xóa đoạn"
                          className="p-1 self-start rounded text-gray-600 hover:text-red-700"
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
                  className="mt-2 flex items-center gap-1 text-sm text-purple-700 hover:text-purple-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm đoạn văn<span className="sr-only"> vào phần {sIdx + 1}</span></span>
                </button>
              </fieldset>
            ))}
          </div>

          <button
            type="button"
            onClick={addSection}
            className="mt-3 flex items-center gap-1 text-sm text-purple-700 hover:text-purple-800"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phần mới</span>
          </button>
        </section>

        {/* Related Concepts Card */}
        <section aria-labelledby="library-extra-heading" className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 id="library-extra-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin bổ sung
          </h2>

          {/* Related Concepts */}
          <div>
            <label htmlFor="library-related" className={labelClass}>
              Khái niệm liên quan (mỗi dòng một khái niệm)
            </label>
            <textarea
              id="library-related"
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
              className={`${fieldClass} resize-none font-mono text-sm`}
            />
          </div>

          {/* Further Reading */}
          <div>
            <label htmlFor="library-further" className={labelClass}>
              Đọc thêm (mỗi dòng một mục)
            </label>
            <textarea
              id="library-further"
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
              className={`${fieldClass} resize-none font-mono text-sm`}
            />
          </div>
        </section>

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
            aria-disabled={saving || undefined}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors aria-disabled:opacity-70 aria-disabled:cursor-wait"
          >
            {saving ? (
              <>
                <Spinner size="sm" tone="onDark" />
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

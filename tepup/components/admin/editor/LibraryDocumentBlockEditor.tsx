'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Plus, Trash2, ExternalLink, BookOpen, AlertTriangle } from 'lucide-react';
import type { LibraryDocumentBlock } from './BlockEditor';
import ReferencePicker, { type PickedEntry } from './ReferencePicker';
import { useEditorMode } from './EditorModeContext';

/** Mục đang gắn với khối (từ /api/library/<id|slug>, lib/library/document-compat.ts). */
interface Linked {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string | null;
  /** Có khi là mục thư viện; không có = tài liệu cũ chưa chuyển. */
  entryType?: string;
}

interface LibraryDocumentBlockEditorProps {
  block: LibraryDocumentBlock;
  onChange: (block: LibraryDocumentBlock) => void;
}

/**
 * Khối "Bài đọc" (library-document): thẻ trong bài mở một MỤC THƯ VIỆN trong bảng bên.
 * Chọn mục bằng cùng ô tìm với nút "Tham chiếu" (dán link tìm được đúng mục Nguồn); quản
 * trị viên tạo được mục mới ngay tại đây nếu chưa có. Khối lưu `documentId` (id của mục):
 * không đổi khi mục đổi slug. `documentSlug` của khối cũ vẫn đọc được.
 *
 * Cách cũ — khối tự chứa nội dung (mode 'inline') — không còn tạo mới được, vì nội dung
 * đọc thêm giờ đều là mục thư viện (dùng lại được, có nguồn, có liên kết). Khối cũ dạng
 * này vẫn sửa được như trước, kèm lời nhắc chuyển sang mục thư viện.
 */
export default function LibraryDocumentBlockEditor({ block, onChange }: LibraryDocumentBlockEditorProps) {
  const uid = useId();
  const mode = useEditorMode();
  const legacyInline = block.mode === 'inline' || (!block.mode && !block.documentId && !block.documentSlug && !!block.title);
  const ref = block.documentId || block.documentSlug || '';
  const [linked, setLinked] = useState<Linked | null>(null);
  const [loadError, setLoadError] = useState('');
  const [picking, setPicking] = useState(!legacyInline && !ref);
  const [pickError, setPickError] = useState('');
  const changeRef = useRef<HTMLButtonElement>(null);

  // Initialize documentContent for inline mode
  const documentContent = block.documentContent || { sections: [{ paragraphs: [''] }] };

  useEffect(() => {
    if (legacyInline || !ref) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/library/${encodeURIComponent(ref)}`);
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && json.data) {
          setLinked(json.data);
          setLoadError('');
        } else {
          setLinked(null);
          setLoadError('Không tìm thấy mục này trong thư viện (có thể đã bị xoá hoặc đang ẩn). Hãy chọn mục khác.');
        }
      } catch {
        if (!cancelled) setLoadError('Không tải được mục. Kiểm tra kết nối rồi thử lại.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ref, legacyInline]);

  async function pick(e: PickedEntry) {
    if (e.type === 'ACRONYM') {
      setPickError('Viết tắt không mở thành bài đọc. Chọn mục mà chữ viết tắt trỏ tới.');
      return;
    }
    setPickError('');
    // Kết quả tìm chỉ có slug; lấy id để khối không hỏng khi mục đổi slug.
    let id = (e as PickedEntry & { id?: string }).id;
    if (!id) {
      try {
        const res = await fetch(`/api/library/${encodeURIComponent(e.slug)}`);
        id = res.ok ? (await res.json()).data?.id : undefined;
      } catch {
        id = undefined;
      }
    }
    if (!id) {
      setPickError('Không mở được mục này làm bài đọc (có thể đang ẩn). Chọn mục khác.');
      return;
    }
    setLinked(null);
    onChange({ type: 'library-document', mode: 'reference', documentId: id });
    setPicking(false);
    requestAnimationFrame(() => changeRef.current?.focus());
  }

  function startPicking() {
    setPickError('');
    setPicking(true);
  }

  // Inline mode content manipulation functions
  function addSection() {
    const sections = [...documentContent.sections, { paragraphs: [''] }];
    onChange({
      ...block,
      documentContent: { ...documentContent, sections },
    });
  }

  function updateSection(index: number, field: 'heading' | 'paragraphs', value: string | string[] | undefined) {
    const sections = [...documentContent.sections];
    sections[index] = { ...sections[index], [field]: value };
    onChange({
      ...block,
      documentContent: { ...documentContent, sections },
    });
  }

  function removeSection(index: number) {
    const sections = documentContent.sections.filter((_, i) => i !== index);
    onChange({
      ...block,
      documentContent: { ...documentContent, sections },
    });
  }

  function addParagraph(sectionIndex: number) {
    const sections = [...documentContent.sections];
    sections[sectionIndex].paragraphs.push('');
    onChange({
      ...block,
      documentContent: { ...documentContent, sections },
    });
  }

  function updateParagraph(sectionIndex: number, paraIndex: number, value: string) {
    const sections = [...documentContent.sections];
    sections[sectionIndex].paragraphs[paraIndex] = value;
    onChange({
      ...block,
      documentContent: { ...documentContent, sections },
    });
  }

  function removeParagraph(sectionIndex: number, paraIndex: number) {
    const sections = [...documentContent.sections];
    sections[sectionIndex].paragraphs = sections[sectionIndex].paragraphs.filter(
      (_, i) => i !== paraIndex
    );
    onChange({
      ...block,
      documentContent: { ...documentContent, sections },
    });
  }

  return (
    <div className="space-y-6">
      {!legacyInline && (
        <section aria-labelledby={`${uid}-h`} className="space-y-3">
          <p id={`${uid}-h`} className="text-sm text-gray-700">
            Thẻ “Xem tài liệu” trong bài mở một mục thư viện trong bảng bên. Chọn mục, hoặc dán link để tìm đúng mục Nguồn.
          </p>

          {!picking && ref && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              {loadError ? (
                <p className="flex gap-2 text-sm text-red-700" role="alert">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  {loadError}
                </p>
              ) : !linked ? (
                <p className="text-sm text-gray-600">Đang tải mục…</p>
              ) : (
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 mt-0.5 text-purple-700 shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    {/* Not a heading: the drawer's h2 is the only heading above it. */}
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{linked.category}</p>
                    <p className="font-semibold text-gray-900">{linked.title}</p>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-3">{linked.description}</p>
                  </div>
                  {mode === 'admin' && (
                    <a
                      href={linked.entryType ? `/admin/library-entries/${linked.id}` : `/admin/library/${linked.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Sửa mục trong thư viện"
                      aria-label={`Sửa “${linked.title}” trong thư viện (mở thẻ mới)`}
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
              <button
                ref={changeRef}
                type="button"
                onClick={startPicking}
                className="mt-3 text-sm text-purple-700 hover:underline font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
              >
                Chọn mục khác
              </button>
            </div>
          )}

          {picking && (
            <div className="p-4 border border-gray-200 rounded-lg space-y-2">
              {/* eslint-disable-next-line jsx-a11y/no-autofocus -- the author just asked to change the entry */}
              <ReferencePicker onPick={pick} autoFocus={!!ref} />
              {pickError && (
                <p className="text-sm text-red-700" role="alert">
                  {pickError}
                </p>
              )}
              {ref && (
                <button
                  type="button"
                  onClick={() => {
                    setPicking(false);
                    requestAnimationFrame(() => changeRef.current?.focus());
                  }}
                  className="text-sm text-gray-700 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                >
                  Huỷ, giữ mục đang chọn
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {legacyInline && (
        <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-2">
            <p>
              Khối này tự chứa nội dung (cách cũ). Nội dung đọc thêm giờ nên là một mục thư viện: dùng lại được ở bài khác, có
              nguồn và liên kết. Bạn vẫn sửa được nội dung bên dưới.
            </p>
            <button
              type="button"
              onClick={() => {
                onChange({ type: 'library-document', mode: 'reference' });
                setPicking(true);
              }}
              className="font-medium text-amber-900 underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
            >
              Thay bằng một mục thư viện (bỏ nội dung riêng này)
            </button>
          </div>
        </div>
      )}

      {/* Nội dung riêng (cách cũ): chỉ còn cho khối đã có sẵn. */}
      {legacyInline && (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor={`${uid}-title`} className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id={`${uid}-title`}
              type="text"
              aria-required="true"
              value={block.title || ''}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              placeholder="Ví dụ: Chủ nghĩa tư bản"
              className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor={`${uid}-category`} className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục (tùy chọn)
            </label>
            <input
              id={`${uid}-category`}
              type="text"
              value={block.category || ''}
              onChange={(e) =>
                onChange({ ...block, category: e.target.value || undefined })
              }
              placeholder="Ví dụ: Định nghĩa, Phân tích, Lịch sử..."
              className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor={`${uid}-description`} className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả ngắn <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <textarea
              id={`${uid}-description`}
              aria-required="true"
              value={block.description || ''}
              onChange={(e) => onChange({ ...block, description: e.target.value })}
              placeholder="1-2 câu giới thiệu ngắn gọn..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Estimated Read Time */}
          <div>
            <label htmlFor={`${uid}-read-time`} className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian đọc (tùy chọn)
            </label>
            <input
              id={`${uid}-read-time`}
              type="text"
              value={block.estimatedReadTime || ''}
              onChange={(e) =>
                onChange({ ...block, estimatedReadTime: e.target.value || undefined })
              }
              placeholder="Ví dụ: 3 phút"
              className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <hr className="border-gray-200" />

          {/* Document Sections */}
          <div role="group" aria-labelledby={`${uid}-content`}>
            <p id={`${uid}-content`} className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung tài liệu
            </p>

            <div className="space-y-4">
              {documentContent.sections.map((section, sIdx) => (
                <div
                  key={sIdx}
                  role="group"
                  aria-labelledby={`${uid}-sec-${sIdx}`}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span id={`${uid}-sec-${sIdx}`} className="text-sm font-medium text-gray-600">
                      Phần {sIdx + 1}
                    </span>
                    {documentContent.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(sIdx)}
                        aria-label={`Xóa phần ${sIdx + 1}`}
                        title="Xóa phần"
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Section Heading */}
                  <input
                    type="text"
                    aria-label={`Tiêu đề phần ${sIdx + 1} (tùy chọn)`}
                    value={section.heading || ''}
                    onChange={(e) => updateSection(sIdx, 'heading', e.target.value || undefined)}
                    placeholder="Tiêu đề phần (tùy chọn)..."
                    className="w-full px-3 py-2 border border-gray-500 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  {/* Paragraphs */}
                  <div className="space-y-2">
                    {section.paragraphs.map((para, pIdx) => (
                      <div key={pIdx} className="flex gap-2">
                        <textarea
                          aria-label={`Phần ${sIdx + 1}, đoạn ${pIdx + 1}`}
                          value={para}
                          onChange={(e) => updateParagraph(sIdx, pIdx, e.target.value)}
                          placeholder={`Đoạn ${pIdx + 1}...`}
                          rows={3}
                          className="flex-1 px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                        {section.paragraphs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeParagraph(sIdx, pIdx)}
                            aria-label={`Xóa đoạn ${pIdx + 1} của phần ${sIdx + 1}`}
                            title="Xóa đoạn văn"
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
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
                    <Plus className="w-4 h-4" aria-hidden="true" />
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
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Thêm phần mới</span>
            </button>
          </div>

          <hr className="border-gray-200" />

          {/* Related Concepts */}
          <div>
            <label htmlFor={`${uid}-related`} className="block text-sm font-medium text-gray-700 mb-1">
              Khái niệm liên quan (mỗi dòng một khái niệm)
            </label>
            <textarea
              id={`${uid}-related`}
              value={documentContent.relatedConcepts?.join('\n') || ''}
              onChange={(e) =>
                onChange({
                  ...block,
                  documentContent: {
                    ...documentContent,
                    relatedConcepts: e.target.value
                      ? e.target.value.split('\n').filter((s) => s.trim())
                      : undefined,
                  },
                })
              }
              placeholder="Thị trường tự do&#10;Sở hữu tư nhân&#10;..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
            />
          </div>

          {/* Further Reading */}
          <div>
            <label htmlFor={`${uid}-further`} className="block text-sm font-medium text-gray-700 mb-1">
              Đọc thêm (mỗi dòng một mục)
            </label>
            <textarea
              id={`${uid}-further`}
              value={documentContent.furtherReading?.join('\n') || ''}
              onChange={(e) =>
                onChange({
                  ...block,
                  documentContent: {
                    ...documentContent,
                    furtherReading: e.target.value
                      ? e.target.value.split('\n').filter((s) => s.trim())
                      : undefined,
                  },
                })
              }
              placeholder="Lịch sử phát triển chủ nghĩa tư bản&#10;So sánh với chủ nghĩa xã hội&#10;..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

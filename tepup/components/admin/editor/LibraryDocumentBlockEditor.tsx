'use client';

import { useState, useEffect, useId, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { Plus, Trash2, Search, ExternalLink } from 'lucide-react';
import type { LibraryDocumentBlock } from './BlockEditor';
import { useEditorMode } from './EditorModeContext';

interface LibraryDocument {
  id: string;
  title: string;
  description: string;
  category: string | null;
  slug: string;
}

interface LibraryDocumentBlockEditorProps {
  block: LibraryDocumentBlock;
  onChange: (block: LibraryDocumentBlock) => void;
}

export default function LibraryDocumentBlockEditor({
  block,
  onChange,
}: LibraryDocumentBlockEditorProps) {
  const uid = useId();
  const [mode, setMode] = useState<'reference' | 'inline'>(
    block.mode || (block.documentId ? 'reference' : 'inline')
  );
  const [showSearchModal, setShowSearchModal] = useState(false);
  // null = still loading the list.
  const [documents, setDocuments] = useState<LibraryDocument[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Text for the dialog's always-mounted live region (result count / loading / error).
  const [listStatus, setListStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<LibraryDocument | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // "Chọn tài liệu khác": where focus goes back when the opener was replaced by the selection.
  const changeDocRef = useRef<HTMLButtonElement>(null);
  // Contributors read the public library API (active documents only); /api/admin/library is 401 for them.
  const libraryApi = useEditorMode() === 'contributor' ? '/api/library' : '/api/admin/library';

  // Initialize documentContent for inline mode
  const documentContent = block.documentContent || { sections: [{ paragraphs: [''] }] };

  // Fetch documents for reference mode
  useEffect(() => {
    if (mode !== 'reference') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(libraryApi);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.data) {
          // The public list has no isActive field (it only returns active documents).
          setDocuments(data.data.filter((doc: { isActive?: boolean }) => doc.isActive !== false));
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, libraryApi]);

  // Fetch selected document info if documentId exists
  useEffect(() => {
    const documentId = block.documentId;
    if (mode !== 'reference' || !documentId || selectedDoc) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${libraryApi}/${documentId}`);
        const data = await res.json();
        if (!cancelled && data.data) setSelectedDoc(data.data);
      } catch (err) {
        console.error('Error fetching document:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [block.documentId, mode, selectedDoc, libraryApi]);

  function handleModeChange(newMode: 'reference' | 'inline') {
    setMode(newMode);
    if (newMode === 'reference') {
      // Clear inline data
      onChange({
        type: 'library-document',
        mode: 'reference',
        documentId: undefined,
      });
      setSelectedDoc(null);
    } else {
      // Clear reference data, initialize inline content
      onChange({
        type: 'library-document',
        mode: 'inline',
        title: '',
        description: '',
        documentContent: { sections: [{ paragraphs: [''] }] },
      });
    }
  }

  function closeSearchModal() {
    setShowSearchModal(false);
    // Empty the live region so the next opening announces fresh text.
    setListStatus('');
  }

  function selectDocument(doc: LibraryDocument) {
    setSelectedDoc(doc);
    onChange({
      type: 'library-document',
      mode: 'reference',
      documentId: doc.id,
    });
    closeSearchModal();
  }

  const filteredDocuments = (documents ?? []).filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isLoadingDocuments = documents === null && !loadError;

  // Announce the result count (debounced while typing), loading and load errors.
  useEffect(() => {
    if (!showSearchModal) return;
    const message = loadError
      ? 'Không tải được danh sách tài liệu.'
      : isLoadingDocuments
      ? 'Đang tải danh sách tài liệu…'
      : filteredDocuments.length === 0
      ? 'Không tìm thấy tài liệu nào'
      : `${filteredDocuments.length} tài liệu`;
    const t = setTimeout(() => setListStatus(message), 400);
    return () => clearTimeout(t);
  }, [showSearchModal, loadError, isLoadingDocuments, filteredDocuments.length]);

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
      {/* Mode Toggle */}
      <fieldset className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        <legend className="sr-only">Cách thêm tài liệu</legend>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${uid}-mode`}
            value="reference"
            checked={mode === 'reference'}
            onChange={() => handleModeChange('reference')}
            className="w-4 h-4 text-purple-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Tham chiếu tài liệu có sẵn
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${uid}-mode`}
            value="inline"
            checked={mode === 'inline'}
            onChange={() => handleModeChange('inline')}
            className="w-4 h-4 text-purple-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Tạo nội dung mới
          </span>
        </label>
      </fieldset>

      {/* Reference Mode */}
      {mode === 'reference' && (
        <div>
          {selectedDoc ? (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {/* Not a heading: the drawer's h2 is the only heading above it. */}
                  <p className="font-semibold text-gray-900">{selectedDoc.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedDoc.description}</p>
                  {selectedDoc.category && (
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mt-2">
                      {selectedDoc.category}
                    </span>
                  )}
                </div>
                <a
                  href={`/admin/library/${selectedDoc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Chỉnh sửa tài liệu"
                  aria-label="Chỉnh sửa tài liệu (mở trong thẻ mới)"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
              <button
                ref={changeDocRef}
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Chọn tài liệu khác
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="w-full py-3 border-2 border-dashed border-purple-200 rounded-lg text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              <span>Chọn tài liệu từ thư viện</span>
            </button>
          )}
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <>
          {/* Backdrop: a mouse shortcut, hidden from assistive tech (Escape and "Đóng" cover everyone else). */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeSearchModal}
            aria-hidden="true"
          />
          {/* Trap: Tab stays inside, Escape closes, focus goes back to the opener (or to
              "Chọn tài liệu khác" when the opener was replaced by the chosen document). */}
          <FocusTrap
            focusTrapOptions={{
              allowOutsideClick: true,
              initialFocus: () => searchInputRef.current ?? undefined,
              setReturnFocus: (previous: HTMLElement | SVGElement) =>
                previous instanceof HTMLElement && previous.isConnected
                  ? previous
                  : changeDocRef.current ?? false,
              onDeactivate: closeSearchModal,
            }}
          >
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${uid}-dialog-title`}
                className="pointer-events-auto bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col"
              >
                <h3 id={`${uid}-dialog-title`} className="text-lg font-semibold text-gray-900 mb-4">
                  Chọn tài liệu từ thư viện
                </h3>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    aria-label="Tìm kiếm tài liệu"
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Mounted with the dialog but empty; filled after opening so it is read out. */}
                <p className="sr-only" aria-live="polite">{listStatus}</p>

                {/* Documents List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {loadError ? (
                    <p className="text-center text-red-600 py-8">
                      Không tải được danh sách tài liệu. Hãy đóng và thử lại.
                    </p>
                  ) : isLoadingDocuments ? (
                    <p className="text-center text-gray-500 py-8">
                      Đang tải danh sách tài liệu…
                    </p>
                  ) : filteredDocuments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Không tìm thấy tài liệu nào
                    </p>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => selectDocument(doc)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                      >
                        <span className="block font-medium text-gray-900">{doc.title}</span>
                        <span className="block text-sm text-gray-600 mt-1 line-clamp-2">
                          {doc.description}
                        </span>
                        {doc.category && (
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mt-2">
                            {doc.category}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={closeSearchModal}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </FocusTrap>
        </>
      )}

      {/* Inline Mode - Full Editor */}
      {mode === 'inline' && (
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

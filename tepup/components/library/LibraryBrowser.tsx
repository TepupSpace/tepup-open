'use client';

/**
 * Phần tương tác của trang Thư viện: tìm kiếm, lọc danh mục, và bảng đọc tài liệu.
 *
 * Danh sách được server render sẵn và truyền xuống, nên trang không còn phải chờ
 * hydrate xong rồi mới đi fetch — trước đây đó là một vòng round-trip thứ hai mà
 * người dùng phải ngồi nhìn spinner.
 *
 * Lọc vẫn chạy phía client vì ô tìm kiếm chỉ so khớp tiêu đề và mô tả, cả hai đều
 * đã có sẵn trong danh sách nhẹ. Giữ được cảm giác gõ tới đâu lọc tới đó mà không
 * phải bắn request mỗi lần gõ.
 *
 * Nội dung đầy đủ chỉ nạp khi mở một tài liệu.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Filter, Clock, ChevronRight, X } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { useIsMobile } from '@/lib/hooks/useMediaQuery';
import Spinner from '@/components/ui/Spinner';
import type { LibraryDocumentSummary } from '@/lib/services/library-service';

interface DocumentContent {
  sections: { heading?: string; paragraphs: string[] }[];
  relatedConcepts?: string[];
  furtherReading?: string[];
}

interface LibraryBrowserProps {
  documents: LibraryDocumentSummary[];
  categories: string[];
}

export default function LibraryBrowser({ documents, categories }: LibraryBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState<LibraryDocumentSummary | null>(null);
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  // Nút "Thử lại" mở lại đúng tài liệu đang chọn, nên `selected` không đổi và
  // effect nạp sẽ không chạy lại. Bộ đếm này là thứ làm nó chạy lại.
  const [attempt, setAttempt] = useState(0);

  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return documents.filter((doc) => {
      if (categoryFilter && doc.category !== categoryFilter) return false;
      if (!search) return true;
      return (
        doc.title.toLowerCase().includes(search) ||
        doc.description.toLowerCase().includes(search)
      );
    });
  }, [documents, searchTerm, categoryFilter]);

  // Đặt trạng thái ngay ở chỗ bấm, không đặt trong effect: effect chỉ còn lo
  // phần bất đồng bộ, và nút phản hồi ngay trong cùng frame với cú bấm.
  const openDocument = useCallback((doc: LibraryDocumentSummary) => {
    setSelected(doc);
    setContent(null);
    setContentError(null);
    setLoadingContent(true);
    setAttempt((n) => n + 1);
  }, []);

  // Dọn state ngay ở chỗ đóng, không dọn trong effect: mở tài liệu khác thì
  // effect nạp bên dưới đã tự ghi đè, nên effect chỉ còn mỗi việc đi nạp.
  const closeDocument = useCallback(() => {
    setSelected(null);
    setContent(null);
    setContentError(null);
    setLoadingContent(false);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    if (!selected) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDocument();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selected, closeDocument]);

  // Nội dung đầy đủ nạp theo yêu cầu. Bảng mở ra ngay với tiêu đề và thời gian
  // đọc đã có sẵn, phần thân điền vào sau.
  useEffect(() => {
    if (!selected) return;

    let cancelled = false;

    fetch(`/api/library/${selected.slug || selected.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setContent((json.data?.content as DocumentContent) ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error fetching library document:', err);
        setContentError('Không tải được nội dung tài liệu.');
      })
      .finally(() => {
        if (!cancelled) setLoadingContent(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected, attempt]);

  return (
    <>
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thư viện</h1>
          <p className="text-gray-500 mt-1">
            Tra cứu nhanh các khái niệm và tài liệu nền
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {categories.length > 0 && (
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white cursor-pointer"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchTerm || categoryFilter
                ? 'Không tìm thấy tài liệu nào'
                : 'Chưa có tài liệu nào trong thư viện'}
            </div>
          ) : (
            filtered.map((doc) => (
              <button
                key={doc.id}
                onClick={() => openDocument(doc)}
                className="bg-white border-2 border-purple-100 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left active:scale-[0.99]"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {doc.category && (
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mb-2">
                        {doc.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {doc.readMinutes} phút
                  </span>
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      {/* Document Side Panel / Modal */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60] animate-fade-in"
            onClick={closeDocument}
          />

          <div
            className={`
              fixed z-[61] bg-white shadow-2xl
              ${
                isMobile
                  ? 'inset-0 animate-scale-in rounded-none'
                  : 'top-0 right-0 bottom-0 w-full sm:w-[600px] animate-slide-in-right'
              }
            `}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-700">Tài liệu</span>
                </div>
                <button
                  onClick={closeDocument}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Đóng tài liệu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-3xl font-bold text-gray-900 flex-1">
                      {selected.title}
                    </h2>
                    <span className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0 ml-4">
                      <Clock className="w-4 h-4" />
                      {selected.readMinutes} phút
                    </span>
                  </div>
                  {selected.category && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      {selected.category}
                    </span>
                  )}
                </div>

                <hr className="my-6 border-gray-200" />

                {loadingContent && (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" tone="brand" label="Đang tải tài liệu" />
                  </div>
                )}

                {contentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                    <p className="text-red-700 text-sm">{contentError}</p>
                    <button
                      onClick={() => openDocument(selected)}
                      className="ml-4 px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {content && (
                  <>
                    <div className="space-y-6">
                      {content.sections.map((section, idx) => (
                        <div key={idx}>
                          {section.heading && (
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              {section.heading}
                            </h3>
                          )}
                          <div className="space-y-3">
                            {section.paragraphs.map((para, pIdx) => (
                              <p key={pIdx} className="text-gray-700 leading-relaxed">
                                {renderInlineMarkdown(para)}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {content.relatedConcepts && content.relatedConcepts.length > 0 && (
                      <>
                        <hr className="my-6 border-gray-200" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Khái niệm liên quan
                          </h4>
                          <ul className="space-y-2">
                            {content.relatedConcepts.map((concept, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-600 mt-1">•</span>
                                <span className="text-gray-700">{concept}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {content.furtherReading && content.furtherReading.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Đọc thêm</h4>
                        <ul className="space-y-2">
                          {content.furtherReading.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-600 mt-1">•</span>
                              <span className="text-gray-700">{renderInlineMarkdown(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

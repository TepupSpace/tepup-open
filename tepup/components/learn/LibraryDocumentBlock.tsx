'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, ChevronRight, Clock } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';

export function LibraryDocumentBlockComponent({
  block,
}: {
  block: {
    type: 'library-document';
    mode?: 'reference' | 'inline';
    documentId?: string;
    documentSlug?: string;
    title?: string;
    description?: string;
    category?: string;
    estimatedReadTime?: string;
    documentContent?: {
      sections: {
        heading?: string;
        paragraphs: string[];
      }[];
      relatedConcepts?: string[];
      furtherReading?: string[];
    };
  };
}) {
  // Determine mode (backward compatible: no mode = inline)
  const mode = block.mode || 'inline';

  // Nội dung soạn ở file tĩnh tham chiếu tài liệu bằng slug và lẽ ra được đổi sang
  // id lúc migrate. Chỗ nào sót thì trước đây block im lặng biến mất, vì điều kiện
  // fetch chỉ nhìn documentId. Chấp nhận cả hai dạng — route API tra được cả hai.
  const documentRef = block.documentId || block.documentSlug;

  const [isOpen, setIsOpen] = useState(false);
  const [libraryDocument, setLibraryDocument] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(mode === 'reference' && !!documentRef);
  const [error, setError] = useState('');

  // Fetch document if reference mode
  useEffect(() => {
    if (mode !== 'reference') return;

    if (!documentRef) {
      setLoading(false);
      setError('Block tài liệu chưa được gắn với tài liệu nào');
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/library/${encodeURIComponent(documentRef)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError('Không thể tải tài liệu');
          return;
        }
        setLibraryDocument(data.data);
      } catch (err) {
        console.error('Error fetching document:', err);
        if (!cancelled) setError('Đã xảy ra lỗi khi tải tài liệu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, documentRef]);

  // Get display data based on mode
  const displayData = mode === 'reference' && libraryDocument
    ? {
        title: libraryDocument.title as string,
        description: libraryDocument.description as string,
        category: libraryDocument.category as string,
        estimatedReadTime: null as string | null,
        documentContent: libraryDocument.content as { sections: { heading?: string; paragraphs: string[] }[]; relatedConcepts?: string[]; furtherReading?: string[] },
      }
    : {
        title: block.title || '',
        description: block.description || '',
        category: block.category,
        estimatedReadTime: block.estimatedReadTime as string | null,
        documentContent: block.documentContent || { sections: [] },
      };

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.document.addEventListener('keydown', handleEscape);
    return () => window.document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Show error state
  if (mode === 'reference' && error) {
    return (
      <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-2xl">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  // Show loading state for reference mode
  if (mode === 'reference' && loading) {
    return (
      <div className="mb-6 p-5 bg-purple-50 border-2 border-purple-200 rounded-2xl flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-purple-700">Đang tải tài liệu...</span>
      </div>
    );
  }

  // Don't render if reference mode and no document loaded yet
  if (mode === 'reference' && !libraryDocument) {
    return null;
  }

  return (
    <>
      {/* Collapsed Preview */}
      <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" aria-hidden="true" />
          <div className="flex-1">
            {displayData.category && (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mb-2">
                {displayData.category}
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {displayData.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {displayData.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            <span>Xem tài liệu</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          {displayData.estimatedReadTime && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {displayData.estimatedReadTime}
            </span>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] animate-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Side Panel (Desktop) or Modal (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:bottom-0 sm:w-[600px] z-[61] bg-white shadow-2xl animate-scale-in sm:animate-slide-in-right rounded-none sm:rounded-none"
          role="dialog"
          aria-modal="true"
          aria-label={displayData.title || 'Tài liệu'}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" aria-hidden="true" />
                <span className="font-semibold text-gray-700">Tài liệu</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Đóng tài liệu"
              >
                <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Title & Meta */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-3xl font-bold text-gray-900 flex-1">
                    {displayData.title}
                  </h2>
                  {displayData.estimatedReadTime && (
                    <span className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0 ml-4">
                      <Clock className="w-4 h-4" />
                      {displayData.estimatedReadTime}
                    </span>
                  )}
                </div>
                {displayData.category && (
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    {displayData.category}
                  </span>
                )}
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Document Sections */}
              <div className="space-y-6">
                {displayData.documentContent.sections.map((section: { heading?: string; paragraphs: string[] }, idx: number) => (
                  <div key={idx}>
                    {section.heading && (
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {section.heading}
                      </h3>
                    )}
                    <div className="space-y-3">
                      {section.paragraphs.map((para: string, pIdx: number) => (
                        <p key={pIdx} className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {renderInlineMarkdown(para)}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Related Concepts */}
              {displayData.documentContent.relatedConcepts &&
               displayData.documentContent.relatedConcepts.length > 0 && (
                <>
                  <hr className="my-6 border-gray-200" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Khái niệm liên quan
                    </h4>
                    <ul className="space-y-2">
                      {displayData.documentContent.relatedConcepts.map((concept: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">&bull;</span>
                          <span className="text-gray-700">{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Further Reading */}
              {displayData.documentContent.furtherReading &&
               displayData.documentContent.furtherReading.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Đọc thêm
                  </h4>
                  <ul className="space-y-2">
                    {displayData.documentContent.furtherReading.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">&bull;</span>
                        <span className="text-gray-700">{renderInlineMarkdown(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

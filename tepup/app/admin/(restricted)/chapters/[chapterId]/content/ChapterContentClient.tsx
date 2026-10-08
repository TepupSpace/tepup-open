'use client';

import { useState, useEffect, useMemo, useCallback, use } from 'react';
import { Eye } from 'lucide-react';
import NotionBlockEditor from '@/components/admin/editor/NotionBlockEditor';
import EditorSaveBar from '@/components/admin/editor/EditorSaveBar';
import { useDraftAutosave } from '@/lib/hooks/useDraftAutosave';
import { useUnsavedChangesGuard } from '@/lib/hooks/useUnsavedChangesGuard';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import type { ContentBlock } from '@/lib/types/content';
import type { DraftDTO } from '@/lib/types/drafts';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import { imageAltText } from '@/lib/a11y/content-warnings';
import Spinner from '@/components/ui/Spinner';

interface ChapterInfo {
  id: string;
  title: string;
  part: {
    id: string;
    name: string;
    story: {
      id: string;
      title: string;
    };
  };
}

interface ContentResponse {
  title: string;
  blocks: ContentBlock[];
  updatedAt: string | null;
  draft: DraftDTO | null;
}

/** What autosave compares and what a draft stores. */
interface EditorValue {
  title: string;
  blocks: ContentBlock[];
}

// "Lưu nháp" / autosave write a server-side draft that learners never see.
// "Xuất bản" publishes it (PUT .../content) and the server deletes the draft.
export default function ChapterContentClient({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = use(params);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [chapter, setChapter] = useState<ChapterInfo | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  // updatedAt of the live content this editing session is based on (publish conflict check).
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ updatedBy: string | null; updatedAt: string } | null>(null);
  // NotionBlockEditor builds itself once from `blocks`; bumping the key rebuilds it
  // (after discarding a draft, or to drop empty lines once published).
  const [editorKey, setEditorKey] = useState(0);

  // The chapter title lives on the chapter itself; content keeps a copy of it.
  // What gets saved never contains empty lines (blank steps for learners). The editor itself
  // keeps them while you type, so the line you're on isn't deleted under you.
  const value: EditorValue = useMemo(
    () => ({ title: chapter?.title || '', blocks: trimEmptyBlocks(blocks).blocks }),
    [chapter, blocks]
  );

  const saveDraft = useCallback(
    async (v: EditorValue) => {
      const res = await fetch(`/api/admin/chapters/${chapterId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, baseUpdatedAt }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Không thể lưu nháp');
      setHasDraft(true);
      setDraftInfo(null);
    },
    [chapterId, baseUpdatedAt]
  );

  const autosave = useDraftAutosave<EditorValue>({ value, enabled: loaded, save: saveDraft });
  const { resetBaseline } = autosave; // stable for the hook's lifetime
  useUnsavedChangesGuard(autosave.isDirty || publishing);

  const applyLoaded = useCallback(
    (info: ChapterInfo, data: ContentResponse | null, useDraft: boolean) => {
      const draft = useDraft ? data?.draft ?? null : null;
      const existing = data?.blocks ?? [];
      // Old content may still hold empty lines: open it without them.
      const nextBlocks = trimEmptyBlocks(draft ? draft.blocks ?? [] : Array.isArray(existing) ? existing : []).blocks;
      setBlocks(nextBlocks);
      setEditorKey((k) => k + 1);
      // A resumed draft keeps the base it was started from, so publishing it still notices
      // a live change made in between.
      setBaseUpdatedAt(draft ? draft.baseUpdatedAt : data?.updatedAt ?? null);
      setHasDraft(!!draft);
      setDraftInfo(draft ? { updatedBy: draft.updatedBy, updatedAt: draft.updatedAt } : null);
      resetBaseline({ title: info.title || '', blocks: nextBlocks });
    },
    [resetBaseline]
  );

  const fetchContent = useCallback(async (): Promise<ContentResponse | null> => {
    const res = await fetch(`/api/admin/chapters/${chapterId}/content`);
    const data = await res.json().catch(() => null);
    return res.ok && data?.data ? (data.data as ContentResponse) : null;
  }, [chapterId]);

  useEffect(() => {
    (async () => {
      try {
        const chapterRes = await fetch(`/api/admin/chapters/${chapterId}`);
        const chapterData = await chapterRes.json();
        if (!chapterRes.ok) {
          setError('Không thể tải thông tin chương');
          return;
        }
        const info: ChapterInfo = chapterData.data;
        setChapter(info);
        applyLoaded(info, await fetchContent(), true);
        setLoaded(true);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    })();
  }, [chapterId, fetchContent, applyLoaded]);

  async function publish(force = false) {
    setPublishing(true);
    setError('');
    setNotice('');
    try {
      // Let an in-flight autosave finish first, so it can't recreate the draft after publishing.
      await autosave.saveNow();
      const snapshot = value;
      const removedEmpty = trimEmptyBlocks(blocks).removed;
      const res = await fetch(`/api/admin/chapters/${chapterId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...snapshot, baseUpdatedAt, force }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 409 && data?.conflict && !force) {
        if (window.confirm(`${data.error}\n\nVẫn xuất bản bản của bạn?`)) {
          return await publish(true);
        }
        return;
      }
      if (!res.ok) {
        setError(data?.error || 'Không thể xuất bản');
        return;
      }
      setBaseUpdatedAt(data?.data?.updatedAt ?? null);
      setHasDraft(false);
      setDraftInfo(null);
      if (removedEmpty) {
        // Show the editor without the empty lines that were just left out.
        setBlocks(snapshot.blocks);
        setEditorKey((k) => k + 1);
      }
      autosave.resetBaseline(snapshot);
      setNotice(
        'Đã xuất bản. Người học sẽ thấy nội dung mới trong vài phút.' +
          (removedEmpty ? ` Đã bỏ ${removedEmpty} dòng trống.` : '')
      );
    } catch (err) {
      console.error('Error publishing content:', err);
      setError('Đã xảy ra lỗi khi xuất bản');
    } finally {
      setPublishing(false);
    }
  }

  async function discardDraft() {
    if (!chapter) return;
    if (!window.confirm('Bỏ bản nháp và quay về nội dung đang hiển thị cho người học?')) return;
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}/draft`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Không thể bỏ bản nháp');
        return;
      }
      applyLoaded(chapter, await fetchContent(), false);
    } catch (err) {
      console.error('Error discarding draft:', err);
      setError('Đã xảy ra lỗi khi bỏ bản nháp');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải nội dung chương…" />
      </div>
    );
  }

  return (
    <>
      {/* First element on the page: the bar pulls itself up against the admin header. */}
      <EditorSaveBar
        backHref={chapter ? `/admin/stories/${chapter.part.story.id}/parts` : '/admin'}
        title="Nội dung chương"
        breadcrumb={chapter ? `${chapter.part.story.title} > ${chapter.part.name} > ${chapter.title}` : undefined}
        status={autosave.status}
        lastSavedAt={autosave.lastSavedAt}
        error={autosave.error}
        hasUnpublishedDraft={hasDraft || autosave.isDirty}
        draftInfo={draftInfo}
        onSaveDraft={() => void autosave.saveNow()}
        onPublish={() => void publish()}
        publishing={publishing}
        publishDisabled={!loaded}
        onDiscardDraft={hasDraft ? () => void discardDraft() : undefined}
        extraActions={
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            aria-expanded={showPreview}
            aria-controls="chapter-preview"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              showPreview
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? 'Ẩn xem trước' : 'Xem trước'}</span>
          </button>
        }
      />

    <div className="max-w-4xl">
      {/* Error / notice: vùng luôn có mặt, chỉ đổi nội dung, để trình đọc màn hình đọc được. */}
      <div role="alert" className="empty:hidden mb-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
      </div>
      <div role="status" className="empty:hidden mb-4">
        {notice && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            {notice}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className={showPreview ? '' : 'lg:col-span-2'}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {/* Block Editor */}
            <section aria-labelledby="chapter-editor-heading">
              <h2 id="chapter-editor-heading" className="block text-sm font-medium text-gray-700 mb-3">
                Soạn nội dung
              </h2>
              <NotionBlockEditor key={editorKey} blocks={blocks} onChange={setBlocks} />
            </section>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <section id="chapter-preview" aria-labelledby="chapter-preview-heading">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <h2 id="chapter-preview-heading" className="text-sm font-medium text-gray-600 mb-4">
                Xem trước
              </h2>
              {/* Tiêu đề trong bản xem trước lùi một cấp (h3, h4): trang chỉ có một h1. */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-xl font-bold mb-4">{chapter?.title}</h3>
                {blocks.length === 0 ? (
                  <p className="text-gray-500">Chưa có nội dung</p>
                ) : (
                  blocks.map((block, index) => (
                    <div key={index} className="mb-4">
                      {block.type === 'text' && (
                        <div>
                          {block.title && (
                            <h4 className="text-lg font-semibold mb-2">
                              {block.title}
                            </h4>
                          )}
                          {block.paragraphs.map((p, i) => (
                            <p key={i} className="text-gray-700 mb-2">
                              {p || <span className="text-gray-500">...</span>}
                            </p>
                          ))}
                        </div>
                      )}
                      {block.type === 'image' && isAllowedMediaUrl(block.src) && (
                        <figure>
                          <img
                            src={block.src}
                            alt={imageAltText(block)}
                            className="rounded-lg max-w-full"
                          />
                          {block.caption && (
                            <figcaption className="text-sm text-gray-500 mt-1">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      )}
                      {block.type === 'callout' && (
                        <div
                          className={`p-4 rounded-xl ${
                            block.variant === 'warning'
                              ? 'bg-yellow-50 border border-yellow-200'
                              : block.variant === 'success'
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          {block.title && (
                            <p className="font-medium mb-1">{block.title}</p>
                          )}
                          <p className="text-sm">{block.text}</p>
                        </div>
                      )}
                      {block.type === 'question' && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="font-medium mb-3">{block.question}</p>
                          <div className="space-y-2">
                            {block.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`px-3 py-2 rounded-lg ${
                                  opt.isCorrect
                                    ? 'bg-green-100 border border-green-300'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                {opt.text || '...'}
                                {/* Không chỉ dựa vào màu xanh để báo đáp án đúng. */}
                                {opt.isCorrect && (
                                  <span className="ml-2 text-xs font-medium text-green-800">(đáp án đúng)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  );
}

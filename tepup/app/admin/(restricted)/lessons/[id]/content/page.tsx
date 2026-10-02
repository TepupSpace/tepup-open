'use client';

import { useState, useEffect, useMemo, useCallback, use } from 'react';
import NotionBlockEditor from '@/components/admin/editor/NotionBlockEditor';
import LessonMetaPanel, { type LessonMeta } from '@/components/admin/editor/LessonMetaPanel';
import EditorSaveBar from '@/components/admin/editor/EditorSaveBar';
import { useDraftAutosave } from '@/lib/hooks/useDraftAutosave';
import { useUnsavedChangesGuard } from '@/lib/hooks/useUnsavedChangesGuard';
import type { ContentBlock } from '@/lib/types/content';
import type { DraftDTO, LessonDraftMeta } from '@/lib/types/drafts';

interface LessonInfo {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  course: { id: string; name: string };
  level: { id: string; name: string };
}

interface ContentResponse {
  lesson: LessonInfo;
  content: { title: string; blocks: ContentBlock[]; updatedAt: string | null };
  draft: DraftDTO<LessonDraftMeta> | null;
}

/** What autosave compares and what a draft stores. */
interface EditorValue {
  title: string;
  blocks: ContentBlock[];
  meta: LessonDraftMeta;
}

// "Lưu nháp" / autosave write a server-side draft that learners never see.
// "Xuất bản" publishes it (PUT .../content) and the server deletes the draft.
export default function LessonContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: lessonId } = use(params);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lesson, setLesson] = useState<LessonInfo | null>(null);
  const [meta, setMeta] = useState<LessonMeta>({ title: '', slug: '', isActive: true, sortOrder: 0 });
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  // updatedAt of the live content this editing session is based on (publish conflict check).
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ updatedBy: string | null; updatedAt: string } | null>(null);

  const value: EditorValue = useMemo(
    () => ({
      title: meta.title,
      blocks,
      meta: { slug: meta.slug, isActive: meta.isActive, sortOrder: meta.sortOrder },
    }),
    [meta, blocks]
  );

  const saveDraft = useCallback(
    async (v: EditorValue) => {
      const res = await fetch(`/api/admin/lessons/${lessonId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, baseUpdatedAt }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Không thể lưu nháp');
      setHasDraft(true);
      setDraftInfo(null);
    },
    [lessonId, baseUpdatedAt]
  );

  const autosave = useDraftAutosave<EditorValue>({ value, enabled: loaded, save: saveDraft });
  const { resetBaseline } = autosave; // stable for the hook's lifetime
  useUnsavedChangesGuard(autosave.isDirty || publishing);

  const applyLoaded = useCallback(
    (data: ContentResponse, useDraft: boolean) => {
      const l = data.lesson;
      const draft = useDraft ? data.draft : null;
      const next: EditorValue = draft
        ? {
            title: draft.title,
            blocks: draft.blocks ?? [],
            meta: draft.meta ?? { slug: l.slug ?? '', isActive: l.isActive ?? true, sortOrder: l.sortOrder ?? 0 },
          }
        : {
            title: data.content.title ?? l.name,
            blocks: data.content.blocks || [],
            meta: { slug: l.slug ?? '', isActive: l.isActive ?? true, sortOrder: l.sortOrder ?? 0 },
          };
      setLesson(l);
      setMeta({ title: next.title, ...next.meta });
      setBlocks(next.blocks);
      // A resumed draft keeps the base it was started from, so publishing it still notices
      // a live change made in between.
      setBaseUpdatedAt(draft ? draft.baseUpdatedAt : data.content.updatedAt);
      setHasDraft(!!draft);
      setDraftInfo(draft ? { updatedBy: draft.updatedBy, updatedAt: draft.updatedAt } : null);
      resetBaseline(next);
    },
    [resetBaseline]
  );

  const fetchContent = useCallback(async (): Promise<ContentResponse | null> => {
    const res = await fetch(`/api/admin/lessons/${lessonId}/content`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.data) {
      setError('Không thể tải nội dung');
      return null;
    }
    return data.data as ContentResponse;
  }, [lessonId]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchContent();
        if (data) {
          applyLoaded(data, true);
          setLoaded(true);
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchContent, applyLoaded]);

  async function publish(force = false) {
    setPublishing(true);
    setError('');
    setNotice('');
    try {
      // Let an in-flight autosave finish first, so it can't recreate the draft after publishing.
      await autosave.saveNow();
      const snapshot = value;
      const res = await fetch(`/api/admin/lessons/${lessonId}/content`, {
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
        const details: string[] = Array.isArray(data?.details) ? data.details : [];
        setError([data?.error || 'Không thể xuất bản', ...details].join('\n'));
        return;
      }
      setBaseUpdatedAt(data?.data?.updatedAt ?? null);
      setHasDraft(false);
      setDraftInfo(null);
      autosave.resetBaseline(snapshot);
      setNotice('Đã xuất bản. Người học sẽ thấy nội dung mới trong vài phút.');
    } catch (err) {
      console.error('Error publishing content:', err);
      setError('Đã xảy ra lỗi khi xuất bản');
    } finally {
      setPublishing(false);
    }
  }

  async function discardDraft() {
    if (!window.confirm('Bỏ bản nháp và quay về nội dung đang hiển thị cho người học?')) return;
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/draft`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Không thể bỏ bản nháp');
        return;
      }
      const data = await fetchContent();
      if (data) applyLoaded(data, false);
    } catch (err) {
      console.error('Error discarding draft:', err);
      setError('Đã xảy ra lỗi khi bỏ bản nháp');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* First element on the page: the bar pulls itself up against the admin header. */}
      <EditorSaveBar
        backHref={lesson ? `/admin/courses/${lesson.course.id}/levels` : '/admin'}
        title="Nội dung bài học"
        breadcrumb={lesson ? `${lesson.course.name} > ${lesson.level.name} > ${lesson.name}` : undefined}
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
      />

      <div className="max-w-6xl">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 whitespace-pre-line text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notion-style editor */}
          <div className="lg:col-span-2">
            <NotionBlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
          {/* Metadata */}
          <div className="lg:col-span-1">
            <LessonMetaPanel meta={meta} onChange={setMeta} />
          </div>
        </div>
      </div>
    </>
  );
}

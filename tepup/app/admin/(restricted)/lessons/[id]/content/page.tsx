'use client';

import { useState, useEffect, useMemo, useCallback, use } from 'react';
import NotionBlockEditor from '@/components/admin/editor/NotionBlockEditor';
import LessonMetaPanel, { type LessonMeta } from '@/components/admin/editor/LessonMetaPanel';
import EditorSaveBar from '@/components/admin/editor/EditorSaveBar';
import { useDraftAutosave } from '@/lib/hooks/useDraftAutosave';
import { useUnsavedChangesGuard } from '@/lib/hooks/useUnsavedChangesGuard';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
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
  // Nothing published yet (new lesson): the first "Xuất bản" asks before showing it to learners.
  const [neverPublished, setNeverPublished] = useState(false);
  // NotionBlockEditor builds itself once from `blocks`; bumping the key rebuilds it
  // (after discarding a draft, or to drop empty lines once published).
  const [editorKey, setEditorKey] = useState(0);

  // What gets saved never contains empty lines (blank steps for learners). The editor
  // itself keeps them while you type, so the line you're on isn't deleted under you.
  const value: EditorValue = useMemo(
    () => ({
      title: meta.title,
      blocks: trimEmptyBlocks(blocks).blocks,
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
      // Old content may still hold empty lines: open it without them.
      const blocks = trimEmptyBlocks(next.blocks).blocks;
      setLesson(l);
      setMeta({ title: next.title, ...next.meta });
      setBlocks(blocks);
      setEditorKey((k) => k + 1);
      // A resumed draft keeps the base it was started from, so publishing it still notices
      // a live change made in between.
      setBaseUpdatedAt(draft ? draft.baseUpdatedAt : data.content.updatedAt);
      setNeverPublished(data.content.updatedAt === null);
      setHasDraft(!!draft);
      setDraftInfo(draft ? { updatedBy: draft.updatedBy, updatedAt: draft.updatedAt } : null);
      resetBaseline({ ...next, blocks });
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

  async function publish(opts: { force?: boolean; goLive?: boolean } = {}) {
    const force = opts.force ?? false;
    let goLive = opts.goLive ?? false;
    // First publish of a hidden, never-published lesson: it goes live, so say so first.
    if (!force && !goLive && neverPublished && !meta.isActive) {
      const ok = window.confirm(
        'Đây là lần xuất bản đầu tiên của bài học này.\n\n' +
          'Bài học sẽ HIỂN THỊ CÔNG KHAI cho người học, và ô "Hiển thị bài học" sẽ được đánh dấu.\n\n' +
          'Tiếp tục xuất bản?'
      );
      if (!ok) return;
      goLive = true;
    }
    setPublishing(true);
    setError('');
    setNotice('');
    try {
      // Let an in-flight autosave finish first, so it can't recreate the draft after publishing.
      await autosave.saveNow();
      const snapshot: EditorValue = goLive ? { ...value, meta: { ...value.meta, isActive: true } } : value;
      const removedEmpty = trimEmptyBlocks(blocks).removed;
      const res = await fetch(`/api/admin/lessons/${lessonId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...snapshot, baseUpdatedAt, force }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 409 && data?.conflict && !force) {
        if (window.confirm(`${data.error}\n\nVẫn xuất bản bản của bạn?`)) {
          return await publish({ force: true, goLive });
        }
        return;
      }
      if (!res.ok) {
        // Issues come as { path, message } (validation) or as strings (block structure).
        const details: string[] = Array.isArray(data?.details)
          ? data.details.map((d: unknown) =>
              typeof d === 'string' ? d : `${(d as { path?: string }).path ?? ''}: ${(d as { message?: string }).message ?? ''}`
            )
          : [];
        setError([data?.error || 'Không thể xuất bản', ...details].join('\n'));
        return;
      }
      setBaseUpdatedAt(data?.data?.updatedAt ?? null);
      setHasDraft(false);
      setDraftInfo(null);
      setNeverPublished(false);
      if (goLive) setMeta((m) => ({ ...m, isActive: true }));
      if (removedEmpty) {
        // Show the editor without the empty lines that were just left out.
        setBlocks(snapshot.blocks);
        setEditorKey((k) => k + 1);
      }
      autosave.resetBaseline(snapshot);
      setNotice(
        (goLive ? 'Đã xuất bản và hiển thị bài học cho người học.' : 'Đã xuất bản.') +
          ' Người học sẽ thấy nội dung mới trong vài phút.' +
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
        publishHint={
          neverPublished && !meta.isActive
            ? 'Xuất bản lần đầu: bài học sẽ hiển thị công khai cho người học, và ô "Hiển thị bài học" sẽ được đánh dấu. Bạn sẽ được hỏi lại trước khi xuất bản.'
            : !meta.isActive
              ? 'Đưa nội dung đang soạn lên bản chính thức. Bài học đang ẩn (ô "Hiển thị bài học" chưa đánh dấu), nên người học vẫn chưa thấy.'
              : 'Đưa nội dung đang soạn lên cho người học xem; trang cập nhật trong vài phút. Khác với "Lưu nháp": bản nháp chỉ người quản trị thấy.'
        }
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
            <NotionBlockEditor key={editorKey} blocks={blocks} onChange={setBlocks} />
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

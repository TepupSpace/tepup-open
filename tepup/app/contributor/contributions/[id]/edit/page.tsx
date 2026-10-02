'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  MessageSquare,
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  Layers,
  FileText,
} from 'lucide-react';
import NotionBlockEditor from '@/components/admin/editor/NotionBlockEditor';
import { useDraftAutosave } from '@/lib/hooks/useDraftAutosave';
import { useUnsavedChangesGuard } from '@/lib/hooks/useUnsavedChangesGuard';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { slugify } from '@/lib/utils/slug';
import type { ContentBlock } from '@/lib/types/content';

interface LessonData {
  name: string;
  sortOrder: number;
  content: {
    title: string;
    blocks: ContentBlock[];
  };
}

interface LevelData {
  name: string;
  sortOrder: number;
  lessons: LessonData[];
}

interface CourseData {
  course: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    icon: string;
  };
  levels: LevelData[];
}

interface ReviewInfo {
  action: string;
  feedback?: string | null;
  createdAt: string;
  reviewer?: { username?: string | null; name?: string | null } | null;
}

/** What autosave compares and what a save sends. */
interface EditorValue {
  data: CourseData;
  message: string;
}

/** Copy kept in this browser while the server hasn't accepted the latest edits. */
interface LocalBackup {
  value: EditorValue;
  /** `updatedAt` of the server copy these edits started from. */
  baseUpdatedAt: string | null;
  savedAt: string;
}

type EditStep = 'overview' | { level: number } | { level: number; lesson: number };

const EDITABLE = ['DRAFT', 'CHANGES_REQUESTED'];
const backupKey = (id: string) => `tepup:contribution-backup:${id}`;

function readBackup(id: string): LocalBackup | null {
  try {
    const raw = localStorage.getItem(backupKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalBackup;
    return parsed && parsed.value && parsed.value.data ? parsed : null;
  } catch {
    return null;
  }
}

function writeBackup(id: string, backup: LocalBackup) {
  try {
    localStorage.setItem(backupKey(id), JSON.stringify(backup));
  } catch {
    /* storage full or blocked: the server copy is all we have */
  }
}

function clearBackup(id: string) {
  try {
    localStorage.removeItem(backupKey(id));
  } catch {
    /* ignore */
  }
}

/**
 * What gets saved: empty lines dropped from every lesson (they'd be blank steps for
 * learners), so the server's "Block #N" counts the same blocks as the editor's gutter.
 * The editor itself keeps them while you type.
 */
function toSaved(data: CourseData, message: string): EditorValue {
  return {
    data: {
      ...data,
      levels: data.levels.map((level) => ({
        ...level,
        lessons: level.lessons.map((lesson) => ({
          ...lesson,
          content: { ...lesson.content, blocks: trimEmptyBlocks(lesson.content.blocks ?? []).blocks },
        })),
      })),
    },
    message,
  };
}

/** Readable text of a rejected save: `details` are strings (structure check) or {path, message}. */
function describeSaveError(body: { error?: string; details?: unknown } | null): string {
  const details: string[] = Array.isArray(body?.details)
    ? body.details.map((x: unknown) =>
        typeof x === 'string'
          ? x
          : x && typeof x === 'object' && 'message' in x
            ? `${(x as { path?: string }).path ?? ''}: ${(x as { message: string }).message}`
            : String(x)
      )
    : [];
  if (details.length) {
    const shown = details.slice(0, 8);
    const more = details.length > shown.length ? [`… và ${details.length - shown.length} lỗi khác`] : [];
    return ['Chưa lưu được: nội dung còn lỗi. Sửa các chỗ sau rồi tiếp tục (bản đang soạn vẫn được giữ trên máy này):', ...shown.map((d) => `• ${d}`), ...more].join('\n');
  }
  return body?.error || 'Không lưu được bản nháp';
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function EditContributionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<CourseData | null>(null);
  const [message, setMessage] = useState('');
  const [contributionStatus, setContributionStatus] = useState('');
  const [latestReview, setLatestReview] = useState<ReviewInfo | null>(null);
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<EditStep>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  // A local copy found on load: restored automatically, or offered when the server moved on.
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const [offeredBackup, setOfferedBackup] = useState<LocalBackup | null>(null);
  // NotionBlockEditor builds itself once from its `blocks`; bump to rebuild (after restoring).
  const [editorKey, setEditorKey] = useState(0);

  const editable = EDITABLE.includes(contributionStatus);
  const value = useMemo(() => (data ? toSaved(data, message) : null), [data, message]);

  // The last save the server rejected as invalid. Saving the same content again would
  // be rejected the same way, so autosave's retries don't hit the server (no error spam);
  // the next change is tried for real.
  const rejectedRef = useRef<{ json: string; error: string } | null>(null);

  const save = useCallback(
    async (v: EditorValue | null) => {
      if (!v) return;
      const json = JSON.stringify(v);
      if (rejectedRef.current?.json === json) throw new Error(rejectedRef.current.error);
      let res: Response;
      try {
        res = await fetch(`/api/contributor/contributions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: v.data, message: v.message }),
        });
      } catch {
        throw new Error('Mất kết nối — chưa lưu được. Bản đang soạn vẫn được giữ trên máy này, sẽ thử lại.');
      }
      const body = await res.json().catch(() => null);
      if (res.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Đăng nhập lại ở tab khác rồi bấm "Lưu"; bản đang soạn vẫn được giữ trên máy này.');
      }
      if (!res.ok) {
        const error = describeSaveError(body);
        if (res.status === 400) rejectedRef.current = { json, error };
        throw new Error(error);
      }
      rejectedRef.current = null;
      if (body?.updatedAt) setServerUpdatedAt(body.updatedAt);
    },
    [id]
  );

  const autosave = useDraftAutosave<EditorValue | null>({ value, enabled: loaded && editable, save });
  const { resetBaseline, saveNow, isDirty } = autosave;
  useUnsavedChangesGuard(isDirty || isSubmitting);

  // Load the contribution, then any copy this browser kept of edits the server never accepted.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/contributor/contributions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((contribution) => {
        if (cancelled) return;
        const serverData = contribution.data as CourseData;
        const serverMessage = typeof contribution.message === 'string' ? contribution.message : '';
        const serverValue = toSaved(serverData, serverMessage);
        setContributionStatus(contribution.status);
        setLatestReview(Array.isArray(contribution.reviews) ? contribution.reviews[0] ?? null : null);
        setServerUpdatedAt(contribution.updatedAt ?? null);

        const backup = EDITABLE.includes(contribution.status) ? readBackup(id) : null;
        const differs = backup && JSON.stringify(backup.value) !== JSON.stringify(serverValue);
        if (backup && differs && backup.baseUpdatedAt === contribution.updatedAt) {
          // Nothing was saved since these edits: put them back (autosave tries again).
          setData(backup.value.data);
          setMessage(backup.value.message ?? '');
          setRestoredAt(backup.savedAt);
        } else {
          setData(serverData);
          setMessage(serverMessage);
          if (backup && differs) setOfferedBackup(backup);
          else if (backup) clearBackup(id);
        }
        resetBaseline(serverValue);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Không thể tải đóng góp');
      });
    return () => {
      cancelled = true;
    };
  }, [id, resetBaseline]);

  // Keep a local copy while the server doesn't have the latest edits (typing ahead of
  // autosave, a rejected save, no connection), so a reload or crash never loses them.
  useEffect(() => {
    if (!loaded || !editable || !value) return;
    if (!isDirty) {
      clearBackup(id);
      return;
    }
    const t = setTimeout(
      () => writeBackup(id, { value, baseUpdatedAt: serverUpdatedAt, savedAt: new Date().toISOString() }),
      400
    );
    return () => clearTimeout(t);
  }, [id, loaded, editable, value, isDirty, serverUpdatedAt]);

  // Ctrl+S / Cmd+S saves now.
  useEffect(() => {
    if (!editable) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveNow();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editable, saveNow]);

  const restoreOffered = () => {
    if (!offeredBackup) return;
    setData(offeredBackup.value.data);
    setMessage(offeredBackup.value.message ?? '');
    setRestoredAt(offeredBackup.savedAt);
    setOfferedBackup(null);
    setEditorKey((k) => k + 1);
  };

  const dropOffered = () => {
    clearBackup(id);
    setOfferedBackup(null);
  };

  const discardRestored = async () => {
    if (!window.confirm('Bỏ các thay đổi chưa lưu và quay về bản đã lưu trên máy chủ?')) return;
    const res = await fetch(`/api/contributor/contributions/${id}`).catch(() => null);
    const contribution = res && res.ok ? await res.json().catch(() => null) : null;
    if (!contribution) return;
    const serverData = contribution.data as CourseData;
    const serverMessage = typeof contribution.message === 'string' ? contribution.message : '';
    clearBackup(id);
    rejectedRef.current = null;
    setData(serverData);
    setMessage(serverMessage);
    setServerUpdatedAt(contribution.updatedAt ?? null);
    setRestoredAt(null);
    setEditorKey((k) => k + 1);
    resetBaseline(toSaved(serverData, serverMessage));
  };

  // Save what's on screen FIRST, then submit: submit sends the server copy for review,
  // so unsaved edits would silently be left out.
  const submit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const saved = await saveNow();
      if (!saved) {
        setSubmitError('Chưa gửi duyệt: bản mới nhất chưa lưu được (xem lỗi phía trên). Sửa lỗi rồi bấm "Gửi duyệt" lại.');
        return;
      }
      const res = await fetch(`/api/contributor/contributions/${id}/submit`, { method: 'POST' });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setSubmitError(describeSaveError(d).replace(/^Chưa lưu được/, 'Chưa gửi duyệt được'));
        return;
      }
      clearBackup(id);
      if (value) resetBaseline(value); // nothing left unsaved: leave without a prompt
      router.push('/contributor/submissions');
    } catch {
      setSubmitError('Đã xảy ra lỗi khi gửi duyệt');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Level operations
  const addLevel = () => {
    if (!data) return;
    setData({
      ...data,
      levels: [
        ...data.levels,
        { name: `Level ${data.levels.length + 1}`, sortOrder: data.levels.length, lessons: [] },
      ],
    });
  };

  const removeLevel = (idx: number) => {
    if (!data) return;
    if (!window.confirm('Xóa level này cùng mọi bài học trong đó?')) return;
    setData({
      ...data,
      levels: data.levels.filter((_, i) => i !== idx).map((l, i) => ({ ...l, sortOrder: i })),
    });
    setStep('overview');
  };

  const updateLevelName = (idx: number, name: string) => {
    if (!data) return;
    const newLevels = [...data.levels];
    newLevels[idx] = { ...newLevels[idx], name };
    setData({ ...data, levels: newLevels });
  };

  // Lesson operations
  const addLesson = (levelIdx: number) => {
    if (!data) return;
    const newLevels = [...data.levels];
    const level = newLevels[levelIdx];
    newLevels[levelIdx] = {
      ...level,
      lessons: [
        ...level.lessons,
        {
          name: `Bài ${level.lessons.length + 1}`,
          sortOrder: level.lessons.length,
          content: { title: '', blocks: [] },
        },
      ],
    };
    setData({ ...data, levels: newLevels });
  };

  const removeLesson = (levelIdx: number, lessonIdx: number) => {
    if (!data) return;
    if (!window.confirm('Xóa bài học này?')) return;
    const newLevels = [...data.levels];
    newLevels[levelIdx] = {
      ...newLevels[levelIdx],
      lessons: newLevels[levelIdx].lessons
        .filter((_, i) => i !== lessonIdx)
        .map((l, i) => ({ ...l, sortOrder: i })),
    };
    setData({ ...data, levels: newLevels });
    if (typeof step === 'object' && 'lesson' in step && step.level === levelIdx) {
      setStep({ level: levelIdx });
    }
  };

  const updateLesson = (levelIdx: number, lessonIdx: number, patch: (l: LessonData) => LessonData) => {
    setData((prev) => {
      if (!prev) return prev;
      const newLevels = [...prev.levels];
      const lessons = [...newLevels[levelIdx].lessons];
      lessons[lessonIdx] = patch(lessons[lessonIdx]);
      newLevels[levelIdx] = { ...newLevels[levelIdx], lessons };
      return { ...prev, levels: newLevels };
    });
  };

  if (loadError && !data) {
    return (
      <div className="p-12 text-center">
        <p className="text-red-500">{loadError}</p>
        <Link href="/contributor/drafts" className="text-teal-600 text-sm mt-2 inline-block">
          Quay lại bản nháp
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const showFeedback =
    contributionStatus === 'CHANGES_REQUESTED' && latestReview?.action === 'CHANGES_REQUESTED' && latestReview.feedback;
  const reviewerName = latestReview?.reviewer?.username || latestReview?.reviewer?.name || 'Người duyệt';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <Link
            href="/contributor/drafts"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Bản nháp
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 break-words">
            {data.course.name || 'Khóa học chưa đặt tên'}
          </h1>
          {editable && <SaveStatus status={autosave.status} lastSavedAt={autosave.lastSavedAt} isDirty={isDirty} />}
        </div>
        {editable && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => void saveNow()}
              disabled={autosave.status === 'saving'}
              title="Bản nháp cũng tự lưu vài giây sau khi bạn ngừng gõ. Phím tắt: Ctrl+S."
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {autosave.status === 'saving' ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              onClick={submit}
              disabled={isSubmitting}
              title="Lưu bản mới nhất rồi gửi cho người duyệt"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Đang gửi...' : contributionStatus === 'CHANGES_REQUESTED' ? 'Gửi lại' : 'Gửi duyệt'}
            </button>
          </div>
        )}
      </div>

      {!editable && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
          {contributionStatus === 'PENDING_REVIEW'
            ? 'Đóng góp này đang chờ duyệt nên không sửa được. Bạn sẽ thấy kết quả ở trang "Đã gửi".'
            : 'Đóng góp này đã được xử lý nên không sửa được nữa.'}
        </div>
      )}

      {showFeedback && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl" data-testid="reviewer-feedback">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-900 mb-1">
            <MessageSquare className="w-4 h-4" />
            {reviewerName} yêu cầu chỉnh sửa
            {latestReview?.createdAt && (
              <span className="font-normal text-amber-700">
                {' '}· {new Date(latestReview.createdAt).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
          {/* Plain text on purpose (reviewer input). */}
          <p className="text-sm text-amber-900 whitespace-pre-line break-words">{latestReview?.feedback}</p>
          <p className="mt-2 text-xs text-amber-700">
            Góp ý này hiện ở đây cho tới khi bạn bấm &ldquo;Gửi lại&rdquo;.
          </p>
        </div>
      )}

      {restoredAt && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-900">
          <span>
            Đã khôi phục các thay đổi chưa lưu trên máy này (lúc {formatTime(new Date(restoredAt))}).
          </span>
          <button onClick={() => void discardRestored()} className="text-teal-700 underline underline-offset-2">
            Bỏ, dùng bản đã lưu
          </button>
        </div>
      )}

      {offeredBackup && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          <span>
            Máy này còn giữ một bản chưa lưu (lúc {formatTime(new Date(offeredBackup.savedAt))}), nhưng bản trên máy
            chủ đã thay đổi sau đó.
          </span>
          <span className="flex gap-3">
            <button onClick={restoreOffered} className="font-medium underline underline-offset-2">
              Khôi phục bản trên máy này
            </button>
            <button onClick={dropOffered} className="underline underline-offset-2">
              Bỏ
            </button>
          </span>
        </div>
      )}

      {editable && autosave.error && (
        <div
          role="alert"
          data-testid="save-error"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-line break-words"
        >
          {autosave.error}
        </div>
      )}
      {submitError && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-line break-words">
          {submitError}
        </div>
      )}

      {/* Stacks on small screens: the structure goes above the form. */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left sidebar - course structure */}
        <div className="w-full lg:w-72 lg:flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-4 lg:sticky lg:top-6">
            {/* Course overview */}
            <button
              onClick={() => setStep('overview')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium mb-2 ${
                step === 'overview' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Thông tin khóa học
            </button>

            {/* Levels */}
            <div className="space-y-1">
              {data.levels.map((level, levelIdx) => (
                <div key={levelIdx}>
                  <button
                    onClick={() => setStep({ level: levelIdx })}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                      typeof step === 'object' && 'level' in step && step.level === levelIdx && !('lesson' in step)
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{level.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{level.lessons.length}</span>
                  </button>

                  {/* Lessons under this level */}
                  {typeof step === 'object' && 'level' in step && step.level === levelIdx && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {level.lessons.map((lesson, lessonIdx) => (
                        <button
                          key={lessonIdx}
                          onClick={() => setStep({ level: levelIdx, lesson: lessonIdx })}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs ${
                            typeof step === 'object' && 'lesson' in step && step.lesson === lessonIdx
                              ? 'bg-teal-50 text-teal-700 font-medium'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{lesson.name}</span>
                        </button>
                      ))}
                      {editable && (
                        <button
                          onClick={() => addLesson(levelIdx)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-teal-600 hover:bg-teal-50 rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm bài học
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {editable && (
              <button
                onClick={addLevel}
                className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Thêm Level
              </button>
            )}
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1 min-w-0">
          {step === 'overview' && (
            <CourseOverviewEditor
              data={data}
              message={message}
              readOnly={!editable}
              onChange={(course) => setData({ ...data, course })}
              onMessageChange={setMessage}
            />
          )}

          {typeof step === 'object' && 'level' in step && !('lesson' in step) && data.levels[step.level] && (
            <LevelEditor
              level={data.levels[step.level]}
              levelIdx={step.level}
              readOnly={!editable}
              onNameChange={(name) => updateLevelName(step.level, name)}
              onRemove={() => removeLevel(step.level)}
              onAddLesson={() => addLesson(step.level)}
              onEditLesson={(lessonIdx) => setStep({ level: step.level, lesson: lessonIdx })}
              onRemoveLesson={(lessonIdx) => removeLesson(step.level, lessonIdx)}
            />
          )}

          {typeof step === 'object' && 'lesson' in step && data.levels[step.level]?.lessons[step.lesson] && (
            <LessonEditor
              // One editor instance per lesson: NotionBlockEditor only reads `blocks` on mount.
              key={`${step.level}-${step.lesson}-${editorKey}`}
              lesson={data.levels[step.level].lessons[step.lesson]}
              readOnly={!editable}
              onNameChange={(name) => updateLesson(step.level, step.lesson, (l) => ({ ...l, name }))}
              onTitleChange={(title) =>
                updateLesson(step.level, step.lesson, (l) => ({ ...l, content: { ...l.content, title } }))
              }
              onBlocksChange={(blocks) =>
                updateLesson(step.level, step.lesson, (l) => ({ ...l, content: { ...l.content, blocks } }))
              }
              onBack={() => setStep({ level: step.level })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function SaveStatus({
  status,
  lastSavedAt,
  isDirty,
}: {
  status: string;
  lastSavedAt: Date | null;
  isDirty: boolean;
}) {
  let content: React.ReactNode;
  if (status === 'saving') {
    content = (
      <>
        <Loader2 className="w-3 h-3 animate-spin" /> Đang lưu…
      </>
    );
  } else if (status === 'error') {
    content = (
      <span className="inline-flex items-center gap-1 text-red-600">
        <AlertCircle className="w-3 h-3" /> Chưa lưu được — xem lỗi bên dưới
      </span>
    );
  } else if (isDirty) {
    content = <>Có thay đổi chưa lưu — tự lưu sau vài giây</>;
  } else if (lastSavedAt) {
    content = (
      <>
        <Check className="w-3 h-3 text-green-600" /> Đã lưu lúc {formatTime(lastSavedAt)}
      </>
    );
  } else {
    content = <>Tự lưu vài giây sau khi bạn ngừng gõ</>;
  }
  return (
    <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1" data-testid="save-status" aria-live="polite">
      {content}
    </p>
  );
}

const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50';

function CourseOverviewEditor({
  data,
  message,
  readOnly,
  onChange,
  onMessageChange,
}: {
  data: CourseData;
  message: string;
  readOnly: boolean;
  onChange: (course: CourseData['course']) => void;
  onMessageChange: (message: string) => void;
}) {
  const course = data.course;
  const slugPreview = slugify(course.name || '') || 'khoa-hoc';
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khóa học</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên khóa học
          </label>
          <input
            id="course-name"
            type="text"
            value={course.name}
            disabled={readOnly}
            onChange={(e) => onChange({ ...course, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (slug)</p>
          <p className="px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500 font-mono break-all">
            /courses/{slugPreview}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Tự tạo từ tên khóa học khi khóa học được duyệt (thêm số nếu trùng với khóa học khác), nên không sửa ở đây.
          </p>
        </div>
        <div>
          <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            id="course-description"
            value={course.description}
            disabled={readOnly}
            onChange={(e) => onChange({ ...course, description: e.target.value })}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label htmlFor="contribution-message" className="block text-sm font-medium text-gray-700 mb-1">
            Lời nhắn cho người duyệt <span className="font-normal text-gray-400">(tuỳ chọn)</span>
          </label>
          <textarea
            id="contribution-message"
            value={message}
            disabled={readOnly}
            maxLength={2000}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={3}
            placeholder="VD: nguồn tham khảo, chỗ cần thêm ảnh, điều bạn muốn người duyệt xem kỹ…"
            className={`${inputClass} resize-y`}
          />
        </div>
        <p className="text-xs text-gray-400">
          Tổng cộng: {data.levels.length} levels, {data.levels.reduce((sum, l) => sum + l.lessons.length, 0)} bài học
        </p>
      </div>
    </div>
  );
}

function LevelEditor({
  level,
  levelIdx,
  readOnly,
  onNameChange,
  onRemove,
  onAddLesson,
  onEditLesson,
  onRemoveLesson,
}: {
  level: LevelData;
  levelIdx: number;
  readOnly: boolean;
  onNameChange: (name: string) => void;
  onRemove: () => void;
  onAddLesson: () => void;
  onEditLesson: (lessonIdx: number) => void;
  onRemoveLesson: (lessonIdx: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Level {levelIdx + 1}</h2>
        {!readOnly && (
          <button
            onClick={onRemove}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Xóa Level
          </button>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="level-name" className="block text-sm font-medium text-gray-700 mb-1">
          Tên Level
        </label>
        <input
          id="level-name"
          type="text"
          value={level.name}
          disabled={readOnly}
          onChange={(e) => onNameChange(e.target.value)}
          className={inputClass}
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Bài học ({level.lessons.length})
      </h3>

      {level.lessons.length === 0 ? (
        <p className="text-sm text-gray-400 mb-3">Chưa có bài học nào.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {level.lessons.map((lesson, lessonIdx) => (
            <div
              key={lessonIdx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <GripVertical className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{lesson.name}</span>
              <span className="text-xs text-gray-400">
                {trimEmptyBlocks(lesson.content.blocks ?? []).blocks.length} blocks
              </span>
              <button
                onClick={() => onEditLesson(lessonIdx)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                {readOnly ? 'Xem' : 'Sửa'}
              </button>
              {!readOnly && (
                <button
                  onClick={() => onRemoveLesson(lessonIdx)}
                  aria-label={`Xóa ${lesson.name}`}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <button
          onClick={onAddLesson}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100"
        >
          <Plus className="w-4 h-4" />
          Thêm bài học
        </button>
      )}
    </div>
  );
}

function LessonEditor({
  lesson,
  readOnly,
  onNameChange,
  onTitleChange,
  onBlocksChange,
  onBack,
}: {
  lesson: LessonData;
  readOnly: boolean;
  onNameChange: (name: string) => void;
  onTitleChange: (title: string) => void;
  onBlocksChange: (blocks: ContentBlock[]) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Level
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="lesson-name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên bài học
            </label>
            <input
              id="lesson-name"
              type="text"
              value={lesson.name}
              disabled={readOnly}
              onChange={(e) => onNameChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề nội dung
            </label>
            <input
              id="lesson-title"
              type="text"
              value={lesson.content.title}
              disabled={readOnly}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Tiêu đề hiển thị cho bài học"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Block Editor */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Nội dung bài học</h3>
        {readOnly ? (
          <p className="text-sm text-gray-500">
            {trimEmptyBlocks(lesson.content.blocks ?? []).blocks.length} block. Đóng góp không còn sửa được nên trình
            soạn bị ẩn.
          </p>
        ) : (
          <NotionBlockEditor
            mode="contributor"
            blocks={lesson.content.blocks}
            onChange={onBlocksChange}
          />
        )}
        {!readOnly && (
          <p className="mt-3 text-xs text-gray-400">
            Tự lưu vài giây sau khi bạn ngừng gõ (Ctrl+S để lưu ngay).
          </p>
        )}
      </div>
    </div>
  );
}

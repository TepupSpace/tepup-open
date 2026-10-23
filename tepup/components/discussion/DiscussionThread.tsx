'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { absoluteTime, relativeTime } from '@/components/notifications/shared';

type TargetType = 'LESSON' | 'CHAPTER' | 'LIBRARY_ENTRY' | 'CONTRIBUTION' | 'REVIEW_REQUEST';

interface Comment {
  id: string;
  author: string;
  isOwn: boolean;
  createdAt: string;
  editedAt: string | null;
  editableUntil: string | null;
  hidden: boolean;
  body: string | null;
}

interface ThreadData {
  threadId: string | null;
  canWrite: boolean;
  writeBlocked: 'BLOCKED' | 'ACCOUNT' | null;
  isAdmin: boolean;
  maxLength: number;
  comments: Comment[];
}

type LoadState = 'loading' | 'ready' | 'notFound' | 'unauthorized' | 'error';

/**
 * Discussion thread for a target (client; loads via /api/discussions/...). Staff-only.
 * Comments are plain text rendered as text: no HTML, links stay text (proposal §6.17).
 */
export default function DiscussionThread({ targetType, targetId }: { targetType: TargetType; targetId: string }) {
  const pathname = usePathname() ?? '/contributor';
  const baseId = useId();
  const composerId = `${baseId}-composer`;
  const countId = `${baseId}-count`;
  const errorId = `${baseId}-error`;

  const [data, setData] = useState<ThreadData | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const url = `/api/discussions/${targetType}/${encodeURIComponent(targetId)}`;

  const load = useCallback(async (): Promise<LoadState> => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 401) return 'unauthorized';
      if (res.status === 404) return 'notFound';
      if (!res.ok) return 'error';
      const json = (await res.json()) as ThreadData;
      setData(json);
      setNow(Date.now());
      return 'ready';
    } catch {
      return 'error';
    }
  }, [url]);

  useEffect(() => {
    let alive = true;
    void load().then((s) => {
      if (alive) setState(s);
    });
    return () => {
      alive = false;
    };
  }, [load]);

  // Comment whose edit form just closed (save or cancel): focus goes back to its "Sửa" button.
  const returnFocusId = useRef<string | null>(null);
  const closeEdit = (id: string) => {
    returnFocusId.current = id;
    setEditingId(null);
  };

  // Move focus into the edit box when it opens, and back to the comment when it closes.
  useEffect(() => {
    if (editingId) {
      document.getElementById(`${baseId}-edit-${editingId}`)?.focus();
      return;
    }
    const id = returnFocusId.current;
    if (!id) return;
    returnFocusId.current = null;
    // The "Sửa" button is gone if the 15-minute window closed meanwhile: fall back to the comment.
    (document.getElementById(`${baseId}-editbtn-${id}`) ?? document.getElementById(`${baseId}-comment-${id}`))?.focus();
  }, [editingId, baseId]);

  // Edit buttons disappear when the 15-minute window closes.
  useEffect(() => {
    if (!data?.comments.some((c) => c.editableUntil)) return;
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [data]);

  const refresh = async () => {
    const s = await load();
    setState(s);
  };

  const maxLength = data?.maxLength ?? 4000;
  const trimmedLength = draft.trim().length;

  const describeError = async (res: Response): Promise<string> => {
    if (res.status === 401) {
      setState('unauthorized');
      return 'Phiên đăng nhập đã hết hạn.';
    }
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    if (res.status === 404) return 'Không tìm thấy thảo luận hoặc bình luận này.';
    return body?.error || 'Có lỗi xảy ra. Thử lại sau.';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posting) return;
    if (!trimmedLength) {
      setFormError('Bình luận đang trống.');
      composerRef.current?.focus();
      return;
    }
    if (trimmedLength > maxLength) {
      setFormError(`Bình luận dài quá ${maxLength} ký tự.`);
      composerRef.current?.focus();
      return;
    }
    setPosting(true);
    setFormError('');
    setStatus('Đang gửi bình luận…');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft }),
      });
      if (!res.ok) {
        const msg = await describeError(res);
        setFormError(msg);
        setStatus('');
        return;
      }
      setDraft('');
      await refresh();
      setStatus('Đã gửi bình luận.');
    } catch {
      setFormError('Mất kết nối — chưa gửi được. Nội dung vẫn còn trong ô soạn.');
      setStatus('');
    } finally {
      setPosting(false);
    }
  };

  const patch = async (id: string, payload: { body: string } | { hidden: boolean }, done: string) => {
    if (busyId) return;
    setBusyId(id);
    setRowError(null);
    try {
      const res = await fetch(`/api/discussions/comments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setRowError({ id, message: await describeError(res) });
        return;
      }
      await refresh();
      if ('body' in payload) closeEdit(id);
      setStatus(done);
    } catch {
      setRowError({ id, message: 'Mất kết nối — thử lại sau.' });
    } finally {
      setBusyId(null);
    }
  };

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Spinner size="sm" tone="muted" />
        Đang tải thảo luận…
      </div>
    );
  }
  if (state === 'notFound') {
    return <p className="text-sm text-gray-700">Bạn không có quyền xem thảo luận này.</p>;
  }
  if (state === 'unauthorized') {
    return (
      <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        Phiên đăng nhập đã hết hạn.{' '}
        <a href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} className="font-medium underline">
          Đăng nhập lại
        </a>
        {draft.trim() && ' (bình luận đang soạn sẽ mất khi tải lại trang; hãy chép lại trước).'}
      </div>
    );
  }
  if (state === 'error' || !data) {
    return (
      <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
        Chưa tải được thảo luận.{' '}
        <button type="button" onClick={() => { setState('loading'); void refresh(); }} className="font-medium underline">
          Thử lại
        </button>
      </div>
    );
  }

  const btn =
    'rounded-md px-2 py-1 text-xs font-medium underline-offset-2 hover:underline aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700';

  return (
    <div className="space-y-4">
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {data.comments.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Chưa có bình luận nào.
        </p>
      ) : (
        <ol className="space-y-3" aria-label="Bình luận">
          {data.comments.map((c) => {
            const editable = c.isOwn && !!c.editableUntil && new Date(c.editableUntil).getTime() > now;
            const isEditing = editingId === c.id;
            const editId = `${baseId}-edit-${c.id}`;
            return (
              <li
                key={c.id}
                id={`${baseId}-comment-${c.id}`}
                tabIndex={-1}
                className="rounded-lg border border-gray-200 bg-white p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-gray-600">
                  <span className="text-sm font-semibold text-gray-900">{c.author}</span>
                  {c.isOwn && <span className="rounded-full bg-teal-50 px-2 py-0.5 font-medium text-teal-800">Bạn</span>}
                  <time dateTime={c.createdAt} title={absoluteTime(c.createdAt)}>
                    {relativeTime(c.createdAt, now)}
                  </time>
                  {c.editedAt && <span title={absoluteTime(c.editedAt)}>(đã sửa)</span>}
                  {c.hidden && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900">Đã ẩn</span>
                  )}
                </div>

                {isEditing ? (
                  <form
                    className="mt-2 space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void patch(c.id, { body: editText }, 'Đã lưu bình luận.');
                    }}
                  >
                    <label htmlFor={editId} className="sr-only">
                      Sửa bình luận
                    </label>
                    <textarea
                      id={editId}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full resize-y rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        aria-disabled={busyId === c.id}
                        className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => closeEdit(c.id)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : c.body === null ? (
                  <p className="mt-2 text-sm italic text-gray-600">Bình luận này đã bị quản trị viên ẩn.</p>
                ) : (
                  // Plain text: React escapes it; whitespace and line breaks are kept; links stay text.
                  <p className={`mt-2 whitespace-pre-wrap break-words text-sm ${c.hidden ? 'text-gray-600' : 'text-gray-900'}`}>
                    {c.body}
                  </p>
                )}

                {!isEditing && (editable || data.isAdmin) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editable && (
                      <button
                        type="button"
                        id={`${baseId}-editbtn-${c.id}`}
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.body ?? '');
                          setRowError(null);
                        }}
                        className={`${btn} text-teal-800`}
                      >
                        Sửa
                      </button>
                    )}
                    {data.isAdmin && (
                      <button
                        type="button"
                        aria-disabled={busyId === c.id}
                        onClick={() =>
                          void patch(c.id, { hidden: !c.hidden }, c.hidden ? 'Đã hiện lại bình luận.' : 'Đã ẩn bình luận.')
                        }
                        className={`${btn} ${c.hidden ? 'text-teal-800' : 'text-red-700'}`}
                      >
                        {c.hidden ? 'Hiện lại' : 'Ẩn bình luận'}
                      </button>
                    )}
                  </div>
                )}
                {rowError?.id === c.id && (
                  <p role="alert" className="mt-2 text-xs text-red-700">
                    {rowError.message}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {data.canWrite ? (
        <form onSubmit={submit} className="space-y-2" noValidate>
          <label htmlFor={composerId} className="block text-sm font-medium text-gray-900">
            Viết bình luận
          </label>
          <textarea
            id={composerId}
            ref={composerRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (formError) setFormError('');
            }}
            rows={4}
            aria-describedby={`${countId}${formError ? ` ${errorId}` : ''}`}
            aria-invalid={formError ? true : undefined}
            className="w-full resize-y rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 aria-[invalid=true]:border-red-600"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p id={countId} className={`text-xs ${trimmedLength > maxLength ? 'font-medium text-red-700' : 'text-gray-600'}`}>
              {trimmedLength}/{maxLength} ký tự. Chỉ văn bản thường; bạn sửa được trong 15 phút.
            </p>
            <button
              type="submit"
              aria-disabled={posting}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 aria-disabled:cursor-wait aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              {posting && <Spinner size="sm" tone="onDark" />}
              Gửi bình luận
            </button>
          </div>
          {formError && (
            <p id={errorId} role="alert" className="text-sm text-red-700">
              {formError}
            </p>
          )}
        </form>
      ) : (
        <p className="text-sm text-gray-600">
          {data.writeBlocked === 'BLOCKED'
            ? 'Bạn đang bị chặn bình luận trong khóa học này.'
            : 'Tài khoản của bạn không thể bình luận.'}
        </p>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { ChevronRight, ExternalLink, History, ShieldAlert, Users } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import AdminDialog from '@/app/admin/_components/AdminDialog';
import DiscussionThread from '@/components/discussion/DiscussionThread';
import type { ReviewRequestSummaryDTO, ReviewerCandidateDTO } from '@/lib/services/review-request-service';
import { NO_OPINION_BADGE, VERDICT_BADGE, VERDICT_LABEL, formatDateTime } from './labels';

/**
 * "Gửi người duyệt" in the admin lesson editor (proposal §6.15): data hook, the send dialog
 * and the side panel with open requests and their opinions.
 */

export function useLessonReviewRequests(lessonId: string) {
  const [requests, setRequests] = useState<ReviewRequestSummaryDTO[]>([]);
  const [candidates, setCandidates] = useState<ReviewerCandidateDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/review-requests`);
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.data) {
        setError('Không tải được yêu cầu duyệt');
        return;
      }
      setRequests(body.data.requests);
      setCandidates(body.data.candidates);
      setError('');
    } catch {
      setError('Không tải được yêu cầu duyệt');
    } finally {
      setLoaded(true);
    }
  }, [lessonId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { requests, candidates, loaded, error, reload };
}

export function SendToReviewerDialog({
  candidates,
  onClose,
  onSend,
}: {
  candidates: ReviewerCandidateDTO[];
  onClose: () => void;
  /** Returns an error message, or null when sent. */
  onSend: (reviewerIds: string[], message: string) => Promise<string | null>;
}) {
  const uid = useId();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(candidates.filter((c) => c.trusted).map((c) => c.id))
  );
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const trusted = candidates.filter((c) => c.trusted);
  const globals = candidates.filter((c) => !c.trusted);

  async function submit() {
    if (busy) return;
    if (selected.size === 0) {
      setError('Chọn ít nhất một người duyệt.');
      return;
    }
    setBusy(true);
    setError('');
    const err = await onSend([...selected], message);
    setBusy(false);
    if (err) setError(err);
  }

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const group = (title: string, list: ReviewerCandidateDTO[], empty: string) => (
    <fieldset className="mb-4">
      <legend className="mb-2 text-sm font-medium text-gray-700">{title}</legend>
      {list.length === 0 ? (
        <p className="text-sm text-gray-600">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {list.map((c) => (
            <li key={c.id}>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  className="h-4 w-4"
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );

  return (
    <AdminDialog
      title="Gửi người duyệt"
      onClose={onClose}
      busy={busy}
      describedBy={`${uid}-desc`}
      widthClassName="max-w-lg"
    >
      <p id={`${uid}-desc`} className="mb-4 text-sm text-gray-600">
        Người duyệt sẽ thấy đúng bản đang soạn lúc này (tiêu đề và nội dung). Sửa tiếp sau khi gửi
        không làm thay đổi bản họ xem. Ý kiến chỉ mang tính tư vấn; bạn vẫn xuất bản như bình thường.
      </p>
      {group('Người duyệt tin cậy của khoá', trusted, 'Khoá này chưa có người duyệt tin cậy.')}
      {group('Người duyệt chung', globals, 'Không có người duyệt chung nào.')}
      <label htmlFor={`${uid}-msg`} className="mb-1 block text-sm font-medium text-gray-700">
        Bạn muốn người duyệt chú ý điều gì?
      </label>
      <textarea
        id={`${uid}-msg`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        maxLength={2000}
        className="w-full rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <div role="alert" className="mt-2 whitespace-pre-line text-sm text-red-700 empty:hidden">
        {error}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            if (!busy) onClose();
          }}
          aria-disabled={busy}
          className="rounded-lg border border-gray-500 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          aria-disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 aria-disabled:opacity-60"
        >
          {busy ? 'Đang gửi…' : `Gửi (${selected.size})`}
        </button>
      </div>
    </AdminDialog>
  );
}

export function LessonReviewRequestsPanel({
  lessonId,
  requests,
  loaded,
  error,
}: {
  lessonId: string;
  requests: ReviewRequestSummaryDTO[];
  loaded: boolean;
  error: string;
}) {
  const uid = useId();
  const open = requests.filter((r) => r.status === 'OPEN');
  const newestOpen = open[0];

  return (
    <section aria-labelledby={`${uid}-title`} className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 id={`${uid}-title`} className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Users className="h-4 w-4 text-gray-500" aria-hidden="true" />
          Người duyệt
        </h2>
        <Link
          href={`/admin/history/LESSON/${lessonId}`}
          className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
        >
          <History className="h-4 w-4" aria-hidden="true" />
          Lịch sử
        </Link>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {loaded && !error && open.length === 0 && (
        <p className="text-sm text-gray-600">
          Chưa có yêu cầu đang mở. Bấm &ldquo;Gửi người duyệt&rdquo; để xin góp ý cho bản đang soạn.
        </p>
      )}
      {open.length > 0 && (
        <ul className="space-y-3">
          {open.map((r) => (
            <li key={r.id} className="rounded-xl border border-gray-100 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-gray-600">Gửi lúc {formatDateTime(r.createdAt)}</span>
                <Link
                  href={`/admin/review-requests/${r.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                >
                  Mở yêu cầu
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
              {r.escalatedAt && (
                <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                  <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                  Đã chuyển quản trị viên
                </p>
              )}
              <ul className="space-y-2">
                {r.reviewers.map((rv) => (
                  <li key={rv.userId} className="text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">{rv.name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          rv.verdict ? VERDICT_BADGE[rv.verdict] : NO_OPINION_BADGE
                        }`}
                      >
                        {rv.verdict ? VERDICT_LABEL[rv.verdict] : 'Chưa trả lời'}
                      </span>
                    </div>
                    {rv.note && <p className="mt-0.5 whitespace-pre-line text-xs text-gray-700">{rv.note}</p>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {newestOpen && (
        <details className="group rounded-xl border border-gray-100">
          <summary className="flex cursor-pointer items-center gap-1 px-3 py-2 text-sm font-medium text-gray-800">
            <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
            Thảo luận (yêu cầu mới nhất)
          </summary>
          <div className="px-3 pb-3">
            <DiscussionThread targetType="REVIEW_REQUEST" targetId={newestOpen.id} />
          </div>
        </details>
      )}
    </section>
  );
}

'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Clock, MessageSquare, ShieldAlert, User } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import BlockDiff from '@/components/review/BlockDiff';
import ContributionPreview from '@/components/review/ContributionPreview';
import EscalateButton from '@/components/review/EscalateButton';
import DiscussionThread from '@/components/discussion/DiscussionThread';
import type { ReviewRequestDetailDTO } from '@/lib/services/review-request-service';
import { NO_OPINION_BADGE, VERDICT_BADGE, VERDICT_LABEL, formatDateTime } from './labels';

type TabKey = 'diff' | 'draft' | 'live';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'diff', label: 'Thay đổi' },
  { key: 'draft', label: 'Bản mới' },
  { key: 'live', label: 'Bản đang chạy' },
];

/**
 * One "Gửi người duyệt" request (proposal §6.15). Mounted at /contributor/review-requests/[id]
 * (teal) and /admin/review-requests/[id] (blue); the page loads `data` through
 * getReviewRequestForViewer, which already applied the access rules.
 */
export default function ReviewRequestDetail({
  data,
  accent,
  listHref,
}: {
  data: ReviewRequestDetailDTO;
  accent: 'teal' | 'blue';
  listHref: string;
}) {
  const router = useRouter();
  const uid = useId();
  const teal = accent === 'teal';
  const ring = teal ? 'focus:ring-teal-700' : 'focus:ring-blue-600';
  const primary = teal ? 'bg-teal-700 hover:bg-teal-800' : 'bg-blue-600 hover:bg-blue-700';
  const tabOn = teal ? 'border-teal-700 text-teal-800' : 'border-blue-600 text-blue-700';

  // --- tabs (WAI-ARIA tabs: arrow keys move and select, Home/End) ---
  const [tab, setTab] = useState<TabKey>('diff');
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ diff: null, draft: null, live: null });
  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const key = TABS[next].key;
    setTab(key);
    tabRefs.current[key]?.focus();
  }

  // --- opinion form ---
  const [verdict, setVerdict] = useState<'ENDORSED' | 'CHANGES_SUGGESTED' | null>(data.myVerdict);
  const [note, setNote] = useState(data.myNote ?? '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formStatus, setFormStatus] = useState('');

  async function saveOpinion() {
    if (saving) return;
    if (!verdict) {
      setFormError('Chọn "Đồng ý xuất bản" hoặc "Cần sửa".');
      return;
    }
    setSaving(true);
    setFormError('');
    setFormStatus('');
    try {
      const res = await fetch(`/api/contributor/review-requests/${data.id}/opinion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict, note }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setFormError(body?.error || 'Không thể lưu ý kiến');
        return;
      }
      setFormStatus('Đã lưu ý kiến của bạn. Người gửi yêu cầu đã được báo.');
      router.refresh();
    } catch {
      setFormError('Không thể lưu ý kiến');
    } finally {
      setSaving(false);
    }
  }

  // --- admin: close ---
  const [closing, setClosing] = useState(false);
  const [closeStatus, setCloseStatus] = useState('');
  const [closeError, setCloseError] = useState('');
  // The refresh removes "Đóng yêu cầu"; focus moves to the (always mounted) status text instead.
  const closeStatusRef = useRef<HTMLParagraphElement>(null);
  async function closeRequest() {
    if (closing) return;
    if (!window.confirm('Đóng yêu cầu này mà không xuất bản? Người duyệt sẽ không đổi được ý kiến nữa.')) return;
    setClosing(true);
    setCloseError('');
    setCloseStatus('');
    try {
      const res = await fetch(`/api/admin/review-requests/${data.id}/close`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setCloseError(body?.error || 'Không thể đóng yêu cầu.');
        return;
      }
      setCloseStatus('Đã đóng yêu cầu.');
      closeStatusRef.current?.focus();
      router.refresh();
    } catch {
      setCloseError('Không thể đóng yêu cầu. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setClosing(false);
    }
  }

  const others = data.reviewers;
  const draftVersion = { title: data.title, blocks: data.blocks };

  return (
    <div className="max-w-5xl">
      <Link
        href={listHref}
        className={`mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 ${ring} rounded`}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Yêu cầu duyệt
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">{data.courseName}</p>
          <h1 className="text-2xl font-bold text-gray-900">{data.lessonName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            {data.requestedBy && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                Gửi bởi {data.requestedBy}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatDateTime(data.createdAt)}
            </span>
            <span className={`rounded-full border px-2 py-0.5 ${NO_OPINION_BADGE}`}>
              {data.status === 'OPEN'
                ? 'Đang mở'
                : data.published
                  ? 'Đã đóng — bản này đã được xuất bản'
                  : 'Đã đóng'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data.canEscalate && (
            <EscalateButton targetType="REVIEW_REQUEST" id={data.id} escalated={!!data.escalatedAt} accent={accent} />
          )}
          {data.canClose && (
            <button
              type="button"
              onClick={() => void closeRequest()}
              aria-disabled={closing}
              className={`rounded-lg border border-gray-500 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 ${ring}`}
            >
              Đóng yêu cầu
            </button>
          )}
          <p
            ref={closeStatusRef}
            role="status"
            tabIndex={-1}
            className="text-sm text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
          >
            {closeStatus}
          </p>
        </div>
      </div>
      <div role="alert" className="mb-4 text-sm text-red-700 empty:hidden">
        {closeError}
      </div>

      {data.escalatedAt && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-medium">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Đã chuyển quản trị viên ({formatDateTime(data.escalatedAt)})
          </p>
          {data.escalationNote && <p className="mt-1 whitespace-pre-line">{data.escalationNote}</p>}
        </div>
      )}

      {(data.newerExists || data.liveChanged) && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Đã có bản mới hơn</p>
            <ul className="mt-1 list-disc pl-5">
              {data.newerExists && <li>Đội ngũ đã gửi một yêu cầu mới hơn cho bài này.</li>}
              {data.liveChanged && (
                <li>Bản đang chạy đã thay đổi sau khi gửi yêu cầu; tab &ldquo;Thay đổi&rdquo; so với bản lúc gửi.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {data.message && (
        <section aria-labelledby={`${uid}-msg`} className="mb-4 rounded-xl border border-gray-100 bg-white p-4">
          <h2 id={`${uid}-msg`} className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MessageSquare className="h-4 w-4 text-gray-500" aria-hidden="true" />
            Đội ngũ muốn bạn chú ý
          </h2>
          <p className="whitespace-pre-line text-sm text-gray-800">{data.message}</p>
        </section>
      )}

      {/* Tabs */}
      <div role="tablist" aria-label="Nội dung yêu cầu" className="mb-4 flex gap-4 border-b border-gray-200">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[t.key] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`${uid}-panel-${t.key}`}
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => setTab(t.key)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm font-medium focus:outline-none focus-visible:ring-2 ${ring} ${
              tab === t.key ? tabOn : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel-diff`}
        aria-labelledby={`${uid}-tab-diff`}
        hidden={tab !== 'diff'}
        tabIndex={0}
        className="mb-6"
      >
        <p className="mb-2 text-xs text-gray-600">So với bản người học đang thấy lúc gửi yêu cầu.</p>
        <BlockDiff before={data.baseSnapshot} after={draftVersion} />
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel-draft`}
        aria-labelledby={`${uid}-tab-draft`}
        hidden={tab !== 'draft'}
        tabIndex={0}
        className="mb-6"
      >
        <h2 className="mb-2 text-lg font-semibold text-gray-900">{data.title}</h2>
        <ContributionPreview type="EDIT_LESSON_CONTENT" data={draftVersion} accent={accent} />
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel-live`}
        aria-labelledby={`${uid}-tab-live`}
        hidden={tab !== 'live'}
        tabIndex={0}
        className="mb-6"
      >
        {data.live ? (
          <>
            <p className="mb-2 text-xs text-gray-600">Cập nhật lúc {formatDateTime(data.live.updatedAt)}.</p>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{data.live.title}</h2>
            <ContributionPreview
              type="EDIT_LESSON_CONTENT"
              data={{ title: data.live.title, blocks: data.live.blocks }}
              accent={accent}
            />
          </>
        ) : (
          <p className="rounded-xl border border-gray-100 bg-white p-5 text-sm text-gray-600">
            Bài này chưa được xuất bản lần nào.
          </p>
        )}
      </div>

      {/* My opinion */}
      {data.canOpinion && (
        <section aria-labelledby={`${uid}-op`} className="mb-6 rounded-xl border border-gray-100 bg-white p-5">
          <h2 id={`${uid}-op`} className="mb-1 text-lg font-semibold text-gray-900">
            Ý kiến của bạn
          </h2>
          <p className="mb-3 text-sm text-gray-600">
            Ý kiến chỉ mang tính tư vấn; bạn đổi được cho đến khi yêu cầu đóng. Người học chỉ biết
            bạn đã kiểm tra bài nếu bạn chọn công khai trong phần cài đặt.
          </p>
          <fieldset className="mb-3">
            <legend className="mb-2 text-sm font-medium text-gray-700">Kết luận</legend>
            <div className="flex flex-wrap gap-4">
              {(['ENDORSED', 'CHANGES_SUGGESTED'] as const).map((v) => (
                <label key={v} className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name={`${uid}-verdict`}
                    value={v}
                    checked={verdict === v}
                    onChange={() => setVerdict(v)}
                    className="h-4 w-4"
                  />
                  {VERDICT_LABEL[v]}
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor={`${uid}-note`} className="mb-1 block text-sm font-medium text-gray-700">
            Ghi chú (không bắt buộc)
          </label>
          <textarea
            id={`${uid}-note`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={4000}
            className={`w-full rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ring}`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void saveOpinion()}
              aria-disabled={saving}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white aria-disabled:opacity-60 ${primary}`}
            >
              {saving ? 'Đang lưu…' : data.myVerdict ? 'Cập nhật ý kiến' : 'Gửi ý kiến'}
            </button>
            <p role="status" className="text-sm text-green-800 empty:hidden">
              {formStatus}
            </p>
          </div>
          <div role="alert" className="mt-2 text-sm text-red-700 empty:hidden">
            {formError}
          </div>
        </section>
      )}

      {/* Everyone's opinions */}
      <section aria-labelledby={`${uid}-ops`} className="mb-6 rounded-xl border border-gray-100 bg-white p-5">
        <h2 id={`${uid}-ops`} className="mb-3 text-lg font-semibold text-gray-900">
          Ý kiến người duyệt
        </h2>
        {others.length === 0 ? (
          <p className="text-sm text-gray-600">Chưa có người duyệt nào.</p>
        ) : (
          <ul className="space-y-3">
            {others.map((r) => (
              <li key={r.userId} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">{r.name}</span>
                  <span className="text-xs text-gray-600">
                    {r.trusted ? 'Người duyệt tin cậy của khoá' : 'Người duyệt'}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      r.verdict ? VERDICT_BADGE[r.verdict] : NO_OPINION_BADGE
                    }`}
                  >
                    {r.verdict ? VERDICT_LABEL[r.verdict] : 'Chưa trả lời'}
                  </span>
                  {r.updatedAt && <span className="text-xs text-gray-600">{formatDateTime(r.updatedAt)}</span>}
                </div>
                {r.note && <p className="mt-1 whitespace-pre-line text-sm text-gray-800">{r.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby={`${uid}-disc`} className="mb-6">
        <h2 id={`${uid}-disc`} className="mb-3 text-lg font-semibold text-gray-900">
          Thảo luận
        </h2>
        <DiscussionThread targetType="REVIEW_REQUEST" targetId={data.id} />
      </section>
    </div>
  );
}

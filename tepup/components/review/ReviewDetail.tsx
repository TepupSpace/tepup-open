'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Info, MessageSquare, User, XCircle } from 'lucide-react';
import ContributionPreview from '@/components/review/ContributionPreview';
import EscalateButton from '@/components/review/EscalateButton';
import DiscussionThread from '@/components/discussion/DiscussionThread';
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog';
import ProposalDiff from '@/components/contributor/proposal/ProposalDiff';
import { targetNoun } from '@/components/contributor/proposal/ProposalPanels';
import { approveActionText, reviewActionLabel } from '@/lib/contribution-labels';
import { getRoleDisplayName } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';

/**
 * Review screen body, shared by /admin/reviews/[id] (blue) and /contributor/reviews/[id]
 * (teal). Proposal §6.5:
 *  - edit proposals: tabs "Thay đổi" (base → proposal diff), "Bản mới" (preview), "Bản đang
 *    chạy" (live, from GET …/live); every type: "Thảo luận" (thread on the contribution);
 *  - stale warning (live changed since the base) with "Yêu cầu tác giả cập nhật" and
 *    "Vẫn duyệt, ghi đè" (force, after a confirm);
 *  - decision controls only when the API says `canDecide`, otherwise the reason;
 *  - admin-draft warning; escalation; deleted authors shown by staffName.
 */

type Accent = 'blue' | 'teal';
type Decision = 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
type TabId = 'changes' | 'new' | 'live' | 'discussion';

interface ContributionData {
  id: string;
  type: string;
  status: string;
  contributorId: string;
  // Never trust the shape: it is whatever the contributor stored.
  data: {
    course?: { name?: string; slug?: string; description?: string; categoryId?: string };
    levels?: unknown;
    blocks?: unknown;
  };
  baseSnapshot?: unknown;
  baseUpdatedAt?: string | null;
  message?: string;
  submittedAt: string;
  escalatedAt?: string | null;
  escalationNote?: string | null;
  canDecide?: boolean;
  contributor: { username?: string; name?: string; role: string; createdAt: string };
  reviews: {
    id: string;
    action: string;
    feedback?: string;
    createdAt: string;
    reviewer: { username?: string; name?: string };
  }[];
}

interface LiveInfo {
  target: { type: string; id: string; name: string; href: string; hubHref: string; entryType?: string } | null;
  live: unknown;
  liveUpdatedAt: string | null;
  baseUpdatedAt: string | null;
  stale: boolean;
  adminDraft: boolean;
  authorName: string;
  reviewerNames: Record<string, string>;
  decideBlockedReason: 'OWN' | 'ESCALATED' | 'NO_PERMISSION' | null;
}

const EDIT_TYPES = ['EDIT_LESSON_CONTENT', 'EDIT_CHAPTER_CONTENT', 'EDIT_LIBRARY_ENTRY', 'EDIT_COURSE'];

const DECISIONS: { value: Decision; label: string; icon: typeof CheckCircle; checkedClass: string }[] = [
  // The approve label depends on the contribution type (approveActionText).
  {
    value: 'APPROVED',
    label: 'Duyệt',
    icon: CheckCircle,
    checkedClass: 'has-[:checked]:bg-green-50 has-[:checked]:border-green-700 has-[:checked]:text-green-800',
  },
  {
    value: 'CHANGES_REQUESTED',
    label: 'Yêu cầu chỉnh sửa',
    icon: MessageSquare,
    checkedClass: 'has-[:checked]:bg-amber-50 has-[:checked]:border-amber-700 has-[:checked]:text-amber-800',
  },
  {
    value: 'REJECTED',
    label: 'Từ chối',
    icon: XCircle,
    checkedClass: 'has-[:checked]:bg-red-50 has-[:checked]:border-red-600 has-[:checked]:text-red-700',
  },
];

const BLOCKED_REASON: Record<NonNullable<LiveInfo['decideBlockedReason']>, string> = {
  OWN: 'Đây là đề xuất của chính bạn, nên bạn không duyệt được. Người khác sẽ duyệt nó.',
  ESCALATED: 'Đề xuất này đã được chuyển quản trị viên: chỉ quản trị viên quyết định. Bạn vẫn có thể thảo luận.',
  NO_PERMISSION: 'Bạn xem được đề xuất này nhưng không có quyền quyết định.',
};

function staleFeedback(type: string): string {
  const noun = targetNoun(type);
  return `Bản đang chạy của ${noun} đã thay đổi sau khi bạn bắt đầu đề xuất. Hãy mở đề xuất, bấm "Cập nhật theo bản mới", xem lại phần của bạn cho khớp với bản mới rồi gửi lại.`;
}

export default function ReviewDetail({ id, accent }: { id: string; accent: Accent }) {
  const router = useRouter();
  const uid = useId();
  const basePath = accent === 'blue' ? '/admin/reviews' : '/contributor/reviews';
  const c = accent === 'blue'
    ? {
        link: 'text-blue-600',
        spinner: 'border-blue-600',
        avatarBg: 'bg-blue-100',
        avatarIcon: 'text-blue-600',
        ring: 'focus-visible:ring-blue-600',
        hasRing: 'has-[:focus-visible]:ring-blue-600',
        radio: 'accent-blue-600',
        focusRing: 'focus:ring-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        tabActive: 'border-blue-600 text-blue-700',
      }
    : {
        link: 'text-teal-700',
        spinner: 'border-teal-700',
        avatarBg: 'bg-teal-100',
        avatarIcon: 'text-teal-700',
        ring: 'focus-visible:ring-teal-700',
        hasRing: 'has-[:focus-visible]:ring-teal-700',
        radio: 'accent-teal-700',
        focusRing: 'focus:ring-teal-700',
        button: 'bg-teal-700 hover:bg-teal-800',
        tabActive: 'border-teal-700 text-teal-800',
      };

  const [contribution, setContribution] = useState<ContributionData | null>(null);
  const [liveInfo, setLiveInfo] = useState<LiveInfo | null>(null);
  const [action, setAction] = useState<Decision | ''>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // What the error is about: the decision, the feedback field, or neither (server/network).
  const [errorField, setErrorField] = useState<'action' | 'feedback' | null>(null);
  const [confirmForce, setConfirmForce] = useState(false);
  const [forceError, setForceError] = useState('');
  const [tab, setTab] = useState<TabId>('changes');
  const feedbackRef = useRef<HTMLTextAreaElement>(null);
  const feedbackRequired = action === 'REJECTED' || action === 'CHANGES_REQUESTED';
  const clearError = () => {
    setError('');
    setErrorField(null);
  };

  const loadLive = useCallback(() => {
    fetch(`/api/contributor/reviews/${id}/live`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body: LiveInfo | null) => setLiveInfo(body))
      .catch(() => setLiveInfo(null));
  }, [id]);

  useEffect(() => {
    fetch(`/api/contributor/reviews/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((body: ContributionData) => {
        setContribution(body);
        if (!EDIT_TYPES.includes(body.type)) setTab('new');
      })
      .catch(() => setError('Không thể tải đóng góp'));
    loadLive();
  }, [id, loadLive]);

  // After "Chuyển quản trị viên": mark the item escalated right away (so the decision form
  // gives way to the "escalated" notice), then refetch both the item and the live info so
  // canDecide / decideBlockedReason come from the server.
  const onEscalated = useCallback(() => {
    setContribution((prev) => (prev && !prev.escalatedAt ? { ...prev, escalatedAt: new Date().toISOString() } : prev));
    fetch(`/api/contributor/reviews/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body: ContributionData | null) => {
        if (body) setContribution(body);
      })
      .catch(() => {});
    loadLive();
  }, [id, loadLive]);

  const send = async (body: { action: Decision; feedback?: string; force?: boolean }) => {
    const res = await fetch(`/api/contributor/reviews/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { res, data };
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!action) {
      setError('Chọn một quyết định: duyệt, yêu cầu chỉnh sửa hoặc từ chối.');
      setErrorField('action');
      return;
    }
    if (action !== 'APPROVED' && !feedback.trim()) {
      setError('Nhập phản hồi cho người đóng góp: bắt buộc khi yêu cầu chỉnh sửa hoặc từ chối.');
      setErrorField('feedback');
      return;
    }

    setIsSubmitting(true);
    clearError();
    try {
      const { res, data } = await send({ action, feedback: feedback.trim() || undefined });
      if (!res.ok) {
        if (res.status === 409 && data?.stale) {
          // The live version changed since the proposal started: show the warning and its choices.
          loadLive();
          setLiveInfo((prev) => (prev ? { ...prev, stale: true } : prev));
        }
        setError(data?.error || 'Không gửi được quyết định. Vui lòng thử lại.');
        return;
      }
      router.push(basePath);
      router.refresh();
    } catch {
      setError('Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const forceApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setForceError('');
    try {
      const { res, data } = await send({ action: 'APPROVED', feedback: feedback.trim() || undefined, force: true });
      if (!res.ok) {
        setForceError(data?.error || 'Không duyệt được. Vui lòng thử lại.');
        return;
      }
      setConfirmForce(false);
      router.push(basePath);
      router.refresh();
    } catch {
      setForceError('Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const askAuthorToUpdate = () => {
    if (!contribution) return;
    setAction('CHANGES_REQUESTED');
    setFeedback(staleFeedback(contribution.type));
    clearError();
    requestAnimationFrame(() => feedbackRef.current?.focus());
  };

  if (error && !contribution) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Duyệt đóng góp</h1>
        <p role="alert" className="text-red-700">{error}</p>
        <Link href={basePath} className={`${c.link} underline underline-offset-2 text-sm mt-2 inline-block`}>
          Quay lại
        </Link>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="flex items-center justify-center p-12" role="status">
        <div className={`w-6 h-6 border-2 ${c.spinner} border-t-transparent rounded-full animate-spin`} aria-hidden="true" />
        <span className="sr-only">Đang tải đóng góp…</span>
      </div>
    );
  }

  const courseData = contribution.data;
  const isEdit = EDIT_TYPES.includes(contribution.type);
  const contributorName =
    liveInfo?.authorName || contribution.contributor.username || contribution.contributor.name || 'Ẩn danh';
  const isPending = contribution.status === 'PENDING_REVIEW';
  const canDecide = contribution.canDecide !== false && liveInfo?.decideBlockedReason == null;
  const noun = targetNoun(contribution.type);
  const target = liveInfo?.target ?? null;
  const title = isEdit
    ? `Đề xuất sửa ${noun}${target ? ` «${target.name}»` : ''}`
    : courseData.course?.name || contribution.type;
  const stale = isEdit && !!liveInfo?.stale;

  const tabs: { id: TabId; label: string }[] = isEdit
    ? [
        { id: 'changes', label: 'Thay đổi' },
        { id: 'new', label: 'Bản mới' },
        { id: 'live', label: 'Bản đang chạy' },
        { id: 'discussion', label: 'Thảo luận' },
      ]
    : [
        { id: 'new', label: 'Bản mới' },
        { id: 'discussion', label: 'Thảo luận' },
      ];

  return (
    <div>
      <Link href={basePath} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Quay lại danh sách
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">Duyệt: {title}</h1>
      {isEdit && target && (
        <p className="mb-6 text-sm text-gray-600">
          <Link href={target.href} target="_blank" className={`${c.link} underline underline-offset-2`}>
            Mở bản đang chạy<span className="sr-only"> (mở trong thẻ mới)</span>
          </Link>
          {' · '}
          <Link href={target.hubHref} className={`${c.link} underline underline-offset-2`}>
            Công cụ, lịch sử và thảo luận của {noun}
          </Link>
        </p>
      )}
      {isEdit && liveInfo && !target && (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Nội dung gốc không còn tồn tại hoặc bạn không xem được nó.
        </p>
      )}
      {!isEdit && <div className="mb-4" />}

      {contribution.escalatedAt && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Đã chuyển quản trị viên quyết định.</p>
            {contribution.escalationNote && (
              <p className="mt-1 whitespace-pre-line break-words">{contribution.escalationNote}</p>
            )}
          </div>
        </div>
      )}

      {isPending && liveInfo?.adminDraft && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Quản trị viên đang có một bản nháp chưa xuất bản cho {noun} này. Nếu bạn duyệt, khi xuất bản bản nháp đó trình
            soạn của quản trị viên sẽ báo xung đột thay vì ghi đè lặng lẽ.
          </p>
        </div>
      )}

      {isPending && stale && (
        <section
          aria-labelledby={`${uid}-stale`}
          className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          data-testid="stale-warning"
        >
          <h2 id={`${uid}-stale`} className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            {noun === 'bài' ? 'Bài' : noun[0].toUpperCase() + noun.slice(1)} đã thay đổi sau khi đề xuất bắt đầu
          </h2>
          <p className="mt-1">
            Duyệt bây giờ sẽ ghi đè những thay đổi dưới đây (bản tác giả bắt đầu → bản đang chạy). Hãy yêu cầu tác giả cập
            nhật theo bản mới, hoặc duyệt ghi đè nếu bạn chắc chắn.
          </p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3 text-gray-900">
            <ProposalDiff type={contribution.type} before={contribution.baseSnapshot ?? null} after={liveInfo?.live} />
          </div>
          {canDecide && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={askAuthorToUpdate}
                className={`rounded-lg border border-amber-700 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 ${c.ring}`}
              >
                Yêu cầu tác giả cập nhật
              </button>
              <button
                type="button"
                onClick={() => {
                  setForceError('');
                  setConfirmForce(true);
                }}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                Vẫn duyệt, ghi đè
              </button>
            </div>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {courseData.course && !isEdit && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Thông tin khóa học</h2>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Tên:</span> <span className="font-medium">{courseData.course.name}</span></div>
                <div><span className="text-gray-600">Đường dẫn:</span> <span className="font-mono text-gray-600">{courseData.course.slug}</span></div>
                {courseData.course.description && (
                  <div><span className="text-gray-600">Mô tả:</span> {courseData.course.description}</div>
                )}
              </div>
            </div>
          )}

          <Tabs
            tabs={tabs}
            active={tab}
            onChange={setTab}
            uid={uid}
            activeClass={c.tabActive}
            ringClass={c.ring}
            panels={{
              changes: (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="sr-only">Thay đổi so với bản tác giả bắt đầu</h2>
                  {contribution.baseSnapshot == null && contribution.type !== 'EDIT_COURSE' && (
                    <p className="mb-3 text-sm text-gray-600">Khi đề xuất bắt đầu, {noun} này chưa có nội dung.</p>
                  )}
                  <ProposalDiff type={contribution.type} before={contribution.baseSnapshot ?? null} after={courseData} />
                </div>
              ),
              new: <ContributionPreview type={contribution.type} data={courseData} accent={accent} entryType={target?.entryType} />,
              live: liveInfo?.live != null ? (
                <ContributionPreview type={contribution.type} data={liveInfo.live} accent={accent} entryType={target?.entryType} />
              ) : (
                <p className="rounded-xl border border-gray-100 bg-white p-5 text-sm text-gray-600">
                  {liveInfo ? 'Không có bản đang chạy để hiển thị.' : 'Đang tải bản đang chạy…'}
                </p>
              ),
              discussion: (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="sr-only">Thảo luận</h2>
                  <DiscussionThread targetType="CONTRIBUTION" targetId={contribution.id} />
                </div>
              ),
            }}
          />

          {/* Previous reviews */}
          {contribution.reviews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Lịch sử duyệt</h2>
              <div className="space-y-2">
                {contribution.reviews.map((review) => (
                  <div key={review.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          review.action === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : review.action === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {reviewActionLabel(review.action)}
                      </span>
                      <span className="text-gray-600">
                        bởi {liveInfo?.reviewerNames[review.id] ?? (review.reviewer.username || review.reviewer.name)}
                      </span>
                      <span className="text-gray-600">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {review.feedback && <p className="text-gray-700 whitespace-pre-line break-words">{review.feedback}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: contributor info + actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Người đóng góp</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${c.avatarBg} rounded-full flex items-center justify-center`}>
                <User className={`w-5 h-5 ${c.avatarIcon}`} aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-gray-900 break-words">{contributorName}</p>
                <p className="text-xs text-gray-600">
                  {getRoleDisplayName(contribution.contributor.role as UserRole) ?? contribution.contributor.role}
                </p>
              </div>
            </div>
            {contribution.submittedAt && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                Gửi: {new Date(contribution.submittedAt).toLocaleDateString('vi-VN')}
              </div>
            )}
            {contribution.message && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Lời nhắn cho người duyệt</p>
                {/* Plain text: contributor input is untrusted. */}
                <p className="text-sm text-gray-700 whitespace-pre-line break-words">{contribution.message}</p>
              </div>
            )}
          </div>

          {isPending && liveInfo?.decideBlockedReason !== 'OWN' && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <EscalateButton
                targetType="CONTRIBUTION"
                id={contribution.id}
                escalated={!!contribution.escalatedAt}
                accent={accent}
                onEscalated={onEscalated}
              />
            </div>
          )}

          {isPending && !canDecide && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700" data-testid="cannot-decide">
              <h2 className="mb-1 font-semibold text-gray-900">Quyết định</h2>
              <p>
                {liveInfo?.decideBlockedReason
                  ? BLOCKED_REASON[liveInfo.decideBlockedReason]
                  : BLOCKED_REASON.NO_PERMISSION}
              </p>
            </div>
          )}

          {/* Review decision: a real radio group, so the choice is announced and not shown by colour alone. */}
          {isPending && canDecide && (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <h2 className="font-semibold text-gray-900 mb-3">Hành động</h2>

              {/* Always mounted, so the text is read when it appears. */}
              <div
                id={`${uid}-review-error`}
                role="alert"
                className={error ? 'mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm' : 'sr-only'}
              >
                {error}
              </div>

              <fieldset
                className="space-y-2 mb-4"
                aria-describedby={errorField === 'action' ? `${uid}-review-error` : undefined}
              >
                <legend className="mb-2 text-sm font-medium text-gray-700">Quyết định của bạn</legend>
                {DECISIONS.map((d) => {
                  const Icon = d.icon;
                  const hintId = d.value === 'APPROVED' ? `${uid}-approve-hint` : undefined;
                  return (
                    <div key={d.value}>
                      <label
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors border-gray-200 text-gray-700 hover:bg-gray-50 has-[:focus-visible]:ring-2 ${c.hasRing} ${d.checkedClass}`}
                      >
                        <input
                          type="radio"
                          name="review-action"
                          value={d.value}
                          checked={action === d.value}
                          onChange={() => {
                            setAction(d.value);
                            if (errorField === 'action') clearError();
                          }}
                          aria-describedby={hintId}
                          className={`h-4 w-4 shrink-0 ${c.radio}`}
                        />
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {d.value === 'APPROVED' ? approveActionText(contribution.type).label : d.label}
                      </label>
                      {hintId && (
                        <p id={hintId} className="mt-1 px-1 text-xs text-gray-600">
                          {approveActionText(contribution.type).hint}
                          {stale && ' Nội dung đang chạy đã thay đổi: duyệt thường sẽ bị từ chối, dùng "Vẫn duyệt, ghi đè" ở trên.'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </fieldset>

              <div className="mb-4">
                <label htmlFor={`${uid}-feedback`} className="block text-sm font-medium text-gray-700 mb-1">
                  Phản hồi{' '}
                  <span className="font-normal text-gray-600">{feedbackRequired ? '(bắt buộc)' : '(tuỳ chọn)'}</span>
                </label>
                <textarea
                  ref={feedbackRef}
                  id={`${uid}-feedback`}
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    if (errorField === 'feedback') clearError();
                  }}
                  placeholder="Giải thích lý do..."
                  rows={4}
                  required={feedbackRequired}
                  aria-invalid={errorField === 'feedback' || undefined}
                  aria-describedby={
                    errorField === 'feedback' ? `${uid}-feedback-hint ${uid}-review-error` : `${uid}-feedback-hint`
                  }
                  className={`w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 ${c.focusRing} resize-y aria-[invalid=true]:border-red-600`}
                />
                <p id={`${uid}-feedback-hint`} className="mt-1 text-xs text-gray-600">
                  Bắt buộc khi yêu cầu chỉnh sửa hoặc từ chối. Người đóng góp sẽ đọc phản hồi này. Trao đổi qua lại thì dùng
                  thẻ &ldquo;Thảo luận&rdquo;.
                </p>
              </div>

              <button
                type="submit"
                // aria-disabled, not disabled: the pressed button keeps focus while the decision is sent.
                aria-disabled={isSubmitting || undefined}
                className={`w-full py-2.5 ${c.button} text-white rounded-lg font-medium text-sm aria-disabled:opacity-60 aria-disabled:cursor-wait transition-colors focus-visible:outline-none focus-visible:ring-2 ${c.ring} focus-visible:ring-offset-2`}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </form>
          )}
        </div>
      </div>

      {confirmForce && (
        <ConfirmDialog
          title="Duyệt ghi đè?"
          confirmLabel="Vẫn duyệt, ghi đè"
          busyLabel="Đang duyệt…"
          busy={isSubmitting}
          error={forceError}
          onCancel={() => setConfirmForce(false)}
          onConfirm={() => void forceApprove()}
        >
          Những thay đổi trên bản đang chạy kể từ khi tác giả bắt đầu sẽ bị thay bằng bản đề xuất. Việc duyệt ghi đè được
          ghi lại trong lịch sử duyệt và nhật ký quản trị. Bản đang chạy hiện tại vẫn còn trong lịch sử phiên bản.
        </ConfirmDialog>
      )}
    </div>
  );
}

/** Accessible tabs (WAI-ARIA tabs pattern): arrow keys, Home/End, roving tabindex. */
function Tabs({
  tabs,
  active,
  onChange,
  panels,
  uid,
  activeClass,
  ringClass,
}: {
  tabs: { id: TabId; label: string }[];
  active: TabId;
  onChange: (id: TabId) => void;
  panels: Record<TabId, ReactNode>;
  uid: string;
  activeClass: string;
  ringClass: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const current = tabs.some((t) => t.id === active) ? active : tabs[0].id;
  // A panel stays mounted (just hidden) once it has been opened, so switching tabs keeps
  // what it holds, e.g. a half-written comment in "Thảo luận". Unopened panels stay lazy.
  const [opened, setOpened] = useState<ReadonlySet<TabId>>(() => new Set([current]));
  if (!opened.has(current)) setOpened(new Set(opened).add(current));
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = tabs.findIndex((t) => t.id === current);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label="Xem đề xuất" className="mb-3 flex flex-wrap gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={current === t.id}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={current === t.id ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={onKeyDown}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 ${ringClass} ${
              current === t.id ? activeClass : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={current !== t.id}
        >
          {(current === t.id || opened.has(t.id)) && panels[t.id]}
        </div>
      ))}
    </div>
  );
}

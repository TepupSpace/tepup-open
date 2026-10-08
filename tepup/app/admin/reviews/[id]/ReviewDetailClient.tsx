'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Clock,
} from 'lucide-react';
import ContributionPreview from '@/components/review/ContributionPreview';
import { approveActionText, reviewActionLabel } from '@/lib/contribution-labels';
import { getRoleDisplayName } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';

interface ContributionData {
  id: string;
  type: string;
  status: string;
  // NEW_COURSE: { course, levels }; EDIT_LESSON_CONTENT: { blocks }. Never trust
  // the shape — it is whatever the contributor stored.
  data: {
    course?: { name?: string; slug?: string; description?: string; categoryId?: string };
    levels?: unknown;
    blocks?: unknown;
  };
  message?: string;
  submittedAt: string;
  contributor: { username?: string; name?: string; role: string; createdAt: string };
  reviews: { action: string; feedback?: string; createdAt: string; reviewer: { username?: string; name?: string } }[];
}

type Decision = 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

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

export default function ReviewDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contribution, setContribution] = useState<ContributionData | null>(null);
  const [action, setAction] = useState<Decision | ''>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // What the error is about: the decision, the feedback field, or neither (server/network).
  const [errorField, setErrorField] = useState<'action' | 'feedback' | null>(null);
  const feedbackRequired = action === 'REJECTED' || action === 'CHANGES_REQUESTED';
  const clearError = () => {
    setError('');
    setErrorField(null);
  };

  useEffect(() => {
    fetch(`/api/contributor/reviews/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setContribution)
      .catch(() => setError('Không thể tải đóng góp'));
  }, [id]);

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
      const res = await fetch(`/api/contributor/reviews/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, feedback: feedback.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Không gửi được quyết định. Vui lòng thử lại.');
        return;
      }

      router.push('/admin/reviews');
      router.refresh();
    } catch {
      setError('Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !contribution) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Duyệt đóng góp</h1>
        <p role="alert" className="text-red-700">{error}</p>
        <Link href="/admin/reviews" className="text-blue-600 underline underline-offset-2 text-sm mt-2 inline-block">
          Quay lại
        </Link>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="flex items-center justify-center p-12" role="status">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="sr-only">Đang tải đóng góp…</span>
      </div>
    );
  }

  const courseData = contribution.data;
  const contributorName = contribution.contributor.username || contribution.contributor.name || 'Ẩn danh';
  const isPending = contribution.status === 'PENDING_REVIEW';

  return (
    <div>
      <Link
        href="/admin/reviews"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Quay lại danh sách
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Duyệt: {courseData.course?.name || contribution.type}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Content preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Course info */}
          {courseData.course && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Thông tin khóa học</h2>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Tên:</span> <span className="font-medium">{courseData.course.name}</span></div>
                <div><span className="text-gray-500">Đường dẫn:</span> <span className="font-mono text-gray-600">{courseData.course.slug}</span></div>
                {courseData.course.description && (
                  <div><span className="text-gray-500">Mô tả:</span> {courseData.course.description}</div>
                )}
              </div>
            </div>
          )}

          {/* Full read-only preview, rendered with the learner components */}
          <ContributionPreview type={contribution.type} data={courseData} accent="blue" />

          {/* Previous reviews */}
          {contribution.reviews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Lịch sử duyệt</h2>
              <div className="space-y-2">
                {contribution.reviews.map((review, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        review.action === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : review.action === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {reviewActionLabel(review.action)}
                      </span>
                      <span className="text-gray-600">
                        bởi {review.reviewer.username || review.reviewer.name}
                      </span>
                      <span className="text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {review.feedback && <p className="text-gray-700">{review.feedback}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Contributor info + Actions */}
        <div className="space-y-4">
          {/* Contributor info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Người đóng góp</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{contributorName}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(contribution.contributor.role as UserRole) ?? contribution.contributor.role}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              Gửi: {new Date(contribution.submittedAt).toLocaleDateString('vi-VN')}
            </div>
            {contribution.message && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Lời nhắn cho người duyệt</p>
                {/* Plain text: contributor input is untrusted. */}
                <p className="text-sm text-gray-700 whitespace-pre-line break-words">{contribution.message}</p>
              </div>
            )}
          </div>

          {/* Review decision: a real radio group, so the choice is announced and not shown by colour alone. */}
          {isPending && (
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
                id="review-error"
                role="alert"
                className={error ? 'mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm' : 'sr-only'}
              >
                {error}
              </div>

              <fieldset
                className="space-y-2 mb-4"
                aria-describedby={errorField === 'action' ? 'review-error' : undefined}
              >
                <legend className="mb-2 text-sm font-medium text-gray-700">Quyết định của bạn</legend>
                {DECISIONS.map((d) => {
                  const Icon = d.icon;
                  const hintId = d.value === 'APPROVED' ? 'review-approve-hint' : undefined;
                  return (
                    <div key={d.value}>
                      <label
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors border-gray-200 text-gray-700 hover:bg-gray-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 ${d.checkedClass}`}
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
                          className="h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {d.value === 'APPROVED' ? approveActionText(contribution.type).label : d.label}
                      </label>
                      {hintId && (
                        <p id={hintId} className="mt-1 px-1 text-xs text-gray-600">
                          {approveActionText(contribution.type).hint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </fieldset>

              <div className="mb-4">
                <label htmlFor="review-feedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Phản hồi{' '}
                  <span className="font-normal text-gray-600">{feedbackRequired ? '(bắt buộc)' : '(tuỳ chọn)'}</span>
                </label>
                <textarea
                  id="review-feedback"
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    if (errorField === 'feedback') clearError();
                  }}
                  placeholder="Giải thích lý do..."
                  rows={3}
                  required={feedbackRequired}
                  aria-invalid={errorField === 'feedback' || undefined}
                  aria-describedby={
                    errorField === 'feedback' ? 'review-feedback-hint review-error' : 'review-feedback-hint'
                  }
                  className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none aria-[invalid=true]:border-red-600"
                />
                <p id="review-feedback-hint" className="mt-1 text-xs text-gray-600">
                  Bắt buộc khi yêu cầu chỉnh sửa hoặc từ chối. Người đóng góp sẽ đọc phản hồi này.
                </p>
              </div>

              <button
                type="submit"
                // aria-disabled, not disabled: the pressed button keeps focus while the decision is sent.
                aria-disabled={isSubmitting || undefined}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 aria-disabled:opacity-60 aria-disabled:cursor-wait transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

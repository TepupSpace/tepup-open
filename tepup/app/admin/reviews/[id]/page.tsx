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

export default function AdminReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contribution, setContribution] = useState<ContributionData | null>(null);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | ''>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    if (!action) return;
    if (action !== 'APPROVED' && !feedback.trim()) {
      setError('Vui lòng nhập feedback');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/contributor/reviews/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, feedback: feedback.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Lỗi');
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
        <p className="text-red-500">{error}</p>
        <Link href="/admin/reviews" className="text-blue-600 text-sm mt-2 inline-block">
          Quay lại
        </Link>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Review: {courseData.course?.name || contribution.type}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Content preview */}
        <div className="lg:col-span-2 space-y-4">
          {courseData.course && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Thông tin khóa học</h2>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Tên:</span> <span className="font-medium">{courseData.course.name}</span></div>
                <div><span className="text-gray-500">Slug:</span> <span className="font-mono text-gray-600">{courseData.course.slug}</span></div>
                {courseData.course.description && (
                  <div><span className="text-gray-500">Mô tả:</span> {courseData.course.description}</div>
                )}
              </div>
            </div>
          )}

          {/* Full read-only preview, rendered with the learner components */}
          <ContributionPreview type={contribution.type} data={courseData} accent="blue" />

          {contribution.reviews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Lịch sử review</h2>
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
                      <span className="text-gray-500">
                        bởi {review.reviewer.username || review.reviewer.name}
                      </span>
                      <span className="text-gray-400">
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
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Contributor</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{contributorName}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(contribution.contributor.role as UserRole) ?? contribution.contributor.role}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
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

          {isPending && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Hành động</h2>

              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setAction('APPROVED')}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    action === 'APPROVED'
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {approveActionText(contribution.type).label}
                </button>
                {action === 'APPROVED' && (
                  <p className="px-1 text-xs text-gray-500">{approveActionText(contribution.type).hint}</p>
                )}

                <button
                  onClick={() => setAction('CHANGES_REQUESTED')}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    action === 'CHANGES_REQUESTED'
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Yêu cầu chỉnh sửa
                </button>

                <button
                  onClick={() => setAction('REJECTED')}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    action === 'REJECTED'
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </button>
              </div>

              {(action === 'REJECTED' || action === 'CHANGES_REQUESTED') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Giải thích lý do..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!action || isSubmitting}
                className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

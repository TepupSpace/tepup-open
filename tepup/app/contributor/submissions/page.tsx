import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import Link from '@/components/ui/AppLink';
import { Send, CheckCircle, XCircle, Clock, MessageSquare, Eye, Hourglass, ExternalLink } from 'lucide-react';
import { getCoursesForContributions } from '@/lib/services/contribution-service';

const TYPE_LABELS: Record<string, string> = {
  NEW_COURSE: 'Khóa học mới',
  NEW_LEVEL: 'Level mới',
  NEW_LESSON: 'Bài học mới',
  EDIT_LESSON_CONTENT: 'Chỉnh sửa bài học',
  EDIT_COURSE: 'Chỉnh sửa khóa học',
};

const STATUS_STYLES: Record<string, { label: string; className: string; icon: typeof Send }> = {
  PENDING_REVIEW: { label: 'Chờ duyệt', className: 'bg-blue-100 text-blue-700', icon: Clock },
  APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { label: 'Bị từ chối', className: 'bg-red-100 text-red-700', icon: XCircle },
};
const APPROVED_WAITING = {
  label: 'Đã duyệt — chờ quản trị viên kích hoạt',
  className: 'bg-amber-100 text-amber-800',
  icon: Hourglass,
};
const APPROVED_LIVE = { label: 'Đã duyệt — đã lên web', className: 'bg-green-100 text-green-700', icon: CheckCircle };

export default async function SubmissionsPage() {
  const session = await requireContributor();

  const contributions = await prisma.contribution.findMany({
    where: {
      contributorId: session.user.id,
      status: { in: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'] },
    },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { reviewer: { select: { username: true, name: true } } },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });
  const courses = await getCoursesForContributions(contributions);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Đã gửi duyệt</h1>

      {contributions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có đóng góp nào được gửi duyệt.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map((contribution) => {
            const data = contribution.data as Record<string, unknown>;
            const courseName = (data?.course as Record<string, unknown>)?.name as string || 'Chưa đặt tên';
            const latestReview = contribution.reviews[0];
            // Approval creates the course HIDDEN; an admin activates it later.
            const course = courses.get(contribution.id);
            // (No course found: it was removed or never linked; show plain "Đã duyệt".)
            const waitingActivation = contribution.status === 'APPROVED' && !!course && !course.isActive;
            const statusStyle =
              contribution.status === 'APPROVED' && course
                ? waitingActivation
                  ? APPROVED_WAITING
                  : APPROVED_LIVE
                : STATUS_STYLES[contribution.status];
            const StatusIcon = statusStyle?.icon || Clock;
            // Feedback that belongs to the current state. After a resubmission the last
            // review is the old "changes requested": show it as history, not as a verdict.
            const feedback = latestReview?.feedback ?? null;
            const previousFeedback =
              contribution.status === 'PENDING_REVIEW' && latestReview?.action === 'CHANGES_REQUESTED' ? feedback : null;
            const verdictFeedback =
              latestReview && latestReview.action === contribution.status ? feedback : null;

            return (
              <div
                key={contribution.id}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle?.className || ''}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusStyle?.label || contribution.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {TYPE_LABELS[contribution.type] || contribution.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{courseName}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      {contribution.submittedAt && (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          Gửi: {contribution.submittedAt.toLocaleDateString('vi-VN')}
                        </span>
                      )}
                      {contribution.resolvedAt && contribution.status !== 'PENDING_REVIEW' && (
                        <span className="flex items-center gap-1">
                          {contribution.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {contribution.status === 'REJECTED' ? 'Từ chối' : 'Duyệt'}: {contribution.resolvedAt.toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    {waitingActivation && (
                      <p className="mt-3 text-sm text-gray-600">
                        Khóa học đã được tạo nhưng đang ẩn. Quản trị viên sẽ kiểm tra lần cuối rồi kích hoạt; khi đó
                        người học mới thấy và đường dẫn tới khóa học sẽ hiện ở đây.
                      </p>
                    )}
                    {course?.isActive && (
                      <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Xem khóa học trên Tépup
                      </Link>
                    )}

                    {/* Reviewer feedback for the current decision */}
                    {verdictFeedback && (
                      <div className={`mt-3 p-3 rounded-lg border ${
                        contribution.status === 'REJECTED'
                          ? 'bg-red-50 border-red-100'
                          : 'bg-green-50 border-green-100'
                      }`}>
                        <div className={`flex items-center gap-1 text-xs font-medium mb-1 ${
                          contribution.status === 'REJECTED' ? 'text-red-700' : 'text-green-700'
                        }`}>
                          <MessageSquare className="w-3 h-3" />
                          Góp ý từ {latestReview.reviewer.username || latestReview.reviewer.name || 'người duyệt'}
                        </div>
                        <p className={`text-sm whitespace-pre-line ${
                          contribution.status === 'REJECTED' ? 'text-red-800' : 'text-green-800'
                        }`}>
                          {verdictFeedback}
                        </p>
                      </div>
                    )}
                    {previousFeedback && (
                      <div className="mt-3 p-3 rounded-lg border bg-gray-50 border-gray-200">
                        <div className="flex items-center gap-1 text-xs font-medium mb-1 text-gray-600">
                          <MessageSquare className="w-3 h-3" />
                          Góp ý lần trước (bạn đã sửa và gửi lại)
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{previousFeedback}</p>
                      </div>
                    )}
                  </div>

                  {contribution.status === 'PENDING_REVIEW' && (
                    <div className="ml-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 bg-gray-50 rounded-lg">
                        <Eye className="w-3.5 h-3.5" />
                        Đang chờ
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

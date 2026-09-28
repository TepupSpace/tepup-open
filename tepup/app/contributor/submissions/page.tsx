import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import Link from '@/components/ui/AppLink';
import { Send, CheckCircle, XCircle, Clock, MessageSquare, Eye } from 'lucide-react';

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
            const statusStyle = STATUS_STYLES[contribution.status];
            const latestReview = contribution.reviews[0];
            const StatusIcon = statusStyle?.icon || Clock;

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
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {contribution.submittedAt && (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          Gửi: {contribution.submittedAt.toLocaleDateString('vi-VN')}
                        </span>
                      )}
                      {contribution.resolvedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Duyệt: {contribution.resolvedAt.toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    {/* Reviewer feedback */}
                    {latestReview?.feedback && (
                      <div className={`mt-3 p-3 rounded-lg border ${
                        contribution.status === 'REJECTED'
                          ? 'bg-red-50 border-red-100'
                          : 'bg-green-50 border-green-100'
                      }`}>
                        <div className={`flex items-center gap-1 text-xs font-medium mb-1 ${
                          contribution.status === 'REJECTED' ? 'text-red-700' : 'text-green-700'
                        }`}>
                          <MessageSquare className="w-3 h-3" />
                          Feedback từ {latestReview.reviewer.username || latestReview.reviewer.name || 'Reviewer'}
                        </div>
                        <p className={`text-sm ${
                          contribution.status === 'REJECTED' ? 'text-red-800' : 'text-green-800'
                        }`}>
                          {latestReview.feedback}
                        </p>
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

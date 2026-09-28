import { requireReviewer } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import Link from '@/components/ui/AppLink';
import SuggestionQueue from '@/components/review/SuggestionQueue';
import { CheckSquare, Clock, User } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  NEW_COURSE: 'Khóa học mới',
  NEW_LEVEL: 'Level mới',
  NEW_LESSON: 'Bài học mới',
  EDIT_LESSON_CONTENT: 'Chỉnh sửa bài học',
  EDIT_COURSE: 'Chỉnh sửa khóa học',
};

export default async function AdminReviewQueuePage() {
  const session = await requireReviewer();

  const contributions = await prisma.contribution.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      contributor: {
        select: { username: true, name: true },
      },
    },
    orderBy: { submittedAt: 'asc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Duyệt nội dung</h1>
        <span className="text-sm text-gray-500">
          {contributions.length} đang chờ duyệt
        </span>
      </div>

      {contributions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không có đóng góp nào cần duyệt.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map((contribution) => {
            const data = contribution.data as Record<string, unknown>;
            const courseName = (data?.course as Record<string, unknown>)?.name as string || 'Chưa đặt tên';
            const contributorName = contribution.contributor.username || contribution.contributor.name || 'Ẩn danh';

            return (
              <Link
                key={contribution.id}
                href={`/admin/reviews/${contribution.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                        <Clock className="w-3 h-3" />
                        Chờ duyệt
                      </span>
                      <span className="text-xs text-gray-400">
                        {TYPE_LABELS[contribution.type] || contribution.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{courseName}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {contributorName}
                      </span>
                      {contribution.submittedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {contribution.submittedAt.toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    Xem chi tiết →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <SuggestionQueue canEdit={session.user.role === 'ADMIN'} />
    </div>
  );
}

import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import Link from '@/components/ui/AppLink';
import { FileEdit, Clock, MessageSquare } from 'lucide-react';
import SubmitDraftButton, { DraftSubmitResult } from '@/components/contributor/SubmitDraftButton';

export const metadata = { title: 'Bản nháp' };

const TYPE_LABELS: Record<string, string> = {
  NEW_COURSE: 'Khóa học mới',
  NEW_LEVEL: 'Cấp độ mới',
  NEW_LESSON: 'Bài học mới',
  EDIT_LESSON_CONTENT: 'Chỉnh sửa bài học',
  EDIT_COURSE: 'Chỉnh sửa khóa học',
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Bản nháp', className: 'bg-gray-100 text-gray-700' },
  CHANGES_REQUESTED: { label: 'Cần chỉnh sửa', className: 'bg-amber-100 text-amber-700' },
};

export default async function DraftsPage() {
  const session = await requireContributor();

  const contributions = await prisma.contribution.findMany({
    where: {
      contributorId: session.user.id,
      status: { in: ['DRAFT', 'CHANGES_REQUESTED'] },
    },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bản nháp</h1>
        <Link
          href="/contributor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors font-medium text-sm"
        >
          Tạo mới
        </Link>
      </div>

      <DraftSubmitResult />

      {contributions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <FileEdit className="w-12 h-12 text-gray-500 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-500 mb-4">Chưa có bản nháp nào.</p>
          <Link
            href="/contributor/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-sm font-medium"
          >
            Tạo khóa học mới
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map((contribution) => {
            const data = contribution.data as Record<string, unknown>;
            const courseName = (data?.course as Record<string, unknown>)?.name as string || 'Chưa đặt tên';
            const statusStyle = STATUS_STYLES[contribution.status] || STATUS_STYLES.DRAFT;
            const latestReview = contribution.reviews[0];

            return (
              <div
                key={contribution.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle.className}`}>
                        {statusStyle.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {TYPE_LABELS[contribution.type] || contribution.type}
                      </span>
                    </div>
                    <h2 className="font-semibold text-gray-900">{courseName}</h2>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {contribution.updatedAt.toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {/* Reviewer feedback */}
                    {latestReview?.feedback && contribution.status === 'CHANGES_REQUESTED' && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <div className="flex items-center gap-1 text-xs text-amber-800 font-medium mb-1">
                          <MessageSquare className="w-3 h-3" aria-hidden="true" />
                          Góp ý từ người duyệt — sửa rồi gửi lại
                        </div>
                        <p className="text-sm text-amber-800 whitespace-pre-line">{latestReview.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/contributor/contributions/${contribution.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-teal-800 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      <FileEdit className="w-3.5 h-3.5" aria-hidden="true" />
                      Sửa<span className="sr-only">: {courseName}</span>
                    </Link>
                    <SubmitDraftButton
                      contributionId={contribution.id}
                      courseName={courseName}
                      label={contribution.status === 'CHANGES_REQUESTED' ? 'Gửi lại' : undefined}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

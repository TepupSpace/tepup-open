import { requireReviewer } from '@/lib/admin-auth';
import SuggestionQueue from '@/components/review/SuggestionQueue';
import ReviewQueueList from '@/components/review/ReviewQueueList';
import { getReviewQueue } from '@/lib/services/review-queue-service';
import type { UserRole } from '@prisma/client';

export const metadata = { title: 'Duyệt nội dung' };

export default async function AdminReviewQueuePage() {
  const session = await requireReviewer();
  // Global reviewers: every pending contribution; escalated ones first for admins.
  const queue = await getReviewQueue({ id: session.user.id, role: session.user.role as UserRole });
  const escalated = queue.items.filter((i) => i.escalatedAt).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Duyệt nội dung</h1>
        <span className="text-sm text-gray-600">
          {queue.items.filter((i) => !i.own).length} chờ bạn duyệt
          {escalated > 0 && ` · ${escalated} đã chuyển quản trị viên`}
        </span>
      </div>

      {escalated > 0 && session.user.role !== 'ADMIN' && (
        <p className="mb-4 text-sm text-gray-600">
          Mục đánh dấu &ldquo;Đã chuyển quản trị viên&rdquo; chỉ quản trị viên được duyệt; bạn vẫn có thể bình luận.
        </p>
      )}

      {/* Danh sách đóng góp và hàng đợi góp ý bên dưới là hai phần cùng cấp (h2). */}
      <h2 className="sr-only">Đóng góp chờ duyệt</h2>
      <ReviewQueueList items={queue.items} variant="admin" headingLevel={3} />
      <SuggestionQueue canEdit={session.user.role === 'ADMIN'} />
    </div>
  );
}

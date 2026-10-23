import { requireReviewer } from '@/lib/admin-auth';
import ReviewRequestList from '@/components/review-requests/ReviewRequestList';

export const metadata = { title: 'Yêu cầu duyệt' };

export default async function AdminReviewRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireReviewer();
  const { status } = await searchParams;
  return (
    <ReviewRequestList
      viewer={{ id: session.user.id, role: session.user.role }}
      basePath="/admin/review-requests"
      accent="blue"
      scope={status === 'closed' ? 'closed' : 'open'}
    />
  );
}

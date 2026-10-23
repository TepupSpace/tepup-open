import { notFound } from 'next/navigation';
import { requireReviewer } from '@/lib/admin-auth';
import { getReviewRequestForViewer } from '@/lib/services/review-request-service';
import ReviewRequestDetail from '@/components/review-requests/ReviewRequestDetail';

export const metadata = { title: 'Chi tiết yêu cầu duyệt' };

export default async function AdminReviewRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireReviewer();
  const { id } = await params;
  const data = await getReviewRequestForViewer({ id: session.user.id, role: session.user.role }, id);
  if (!data) notFound();
  return <ReviewRequestDetail data={data} accent="blue" listHref="/admin/review-requests" />;
}

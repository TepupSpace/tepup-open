import { requireContributor } from '@/lib/admin-auth';
import ReviewRequestList from '@/components/review-requests/ReviewRequestList';
import ReviewSectionTabs from '@/components/contributor/ReviewSectionTabs';

export const metadata = { title: 'Yêu cầu duyệt' };

export default async function ContributorReviewRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireContributor();
  const { status } = await searchParams;
  return (
    <>
      <ReviewSectionTabs viewer={session.user} current="/contributor/review-requests" />
      <ReviewRequestList
      viewer={{ id: session.user.id, role: session.user.role }}
      basePath="/contributor/review-requests"
      accent="teal"
      scope={status === 'closed' ? 'closed' : 'open'}
      />
    </>
  );
}

import { NextResponse } from 'next/server';
import { getContributorSession } from '@/lib/admin-auth';
import { listReviewRequestsForViewer } from '@/lib/services/review-request-service';

// GET /api/contributor/review-requests?status=open|closed
// Requests I was asked about (while I still hold the grant), plus read-only every request on
// courses where I may read history; global reviewers and admins: all.
// → { data: ReviewRequestSummaryDTO[] }
export async function GET(request: Request) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const status = new URL(request.url).searchParams.get('status') === 'closed' ? 'closed' : 'open';
  const data = await listReviewRequestsForViewer({ id: session.user.id, role: session.user.role }, status);
  return NextResponse.json({ data });
}

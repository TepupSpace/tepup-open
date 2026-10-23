import { NextResponse } from 'next/server';
import { getContributorSession } from '@/lib/admin-auth';
import { getReviewRequestForViewer } from '@/lib/services/review-request-service';

// GET /api/contributor/review-requests/[id] → { data: ReviewRequestDetailDTO }
// 404 when the request doesn't exist OR the viewer may not open it (admin, or a course role
// with READ_HISTORY on its course), so a hidden lesson's request isn't revealed.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const data = await getReviewRequestForViewer({ id: session.user.id, role: session.user.role }, id);
  if (!data) return NextResponse.json({ error: 'Không tìm thấy yêu cầu' }, { status: 404 });
  return NextResponse.json({ data });
}

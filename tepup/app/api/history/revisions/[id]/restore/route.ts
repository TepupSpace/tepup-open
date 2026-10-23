import { NextResponse } from 'next/server';
import { getContributorSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { revalidateContent, revalidateLibrary } from '@/lib/cache';
import { rateLimit } from '@/lib/security/rate-limit';
import { historyAccess, viewerOf } from '../../../_lib/access';
import { restoreRevision } from '../../../_lib/restore';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/history/revisions/[id]/restore — "Khôi phục bản này".
// Body: { baseRevisionId?: string } (the newest revision id when the page loaded; a newer
// one → 409 { code: 'stale' }).
// Admin: any target. Maintainer (ROLLBACK on the course): LESSON and COURSE_OUTLINE only;
// lesson content is re-validated strictly (422 { code: 'invalid' } for e.g. custom blocks).
// Responses: 200 { data: { revisionId } }, 400 current, 403, 404, 409 stale, 410 gone, 422.
export async function POST(request: Request, { params }: Ctx) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  let body: { baseRevisionId?: unknown } = {};
  try {
    body = (await request.json()) ?? {};
  } catch {
    // An empty body is fine.
  }
  const baseRevisionId = typeof body.baseRevisionId === 'string' && body.baseRevisionId ? body.baseRevisionId : null;

  const rev = await prisma.contentRevision.findUnique({ where: { id }, select: { targetType: true, targetId: true } });
  if (!rev) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  const viewer = viewerOf(session.user);
  const access = await historyAccess(viewer, rev.targetType, rev.targetId);
  if (!access) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  const allowed =
    access.isAdmin || (access.canRestore && (rev.targetType === 'LESSON' || rev.targetType === 'COURSE_OUTLINE'));
  if (!allowed) return NextResponse.json({ error: 'Bạn không có quyền khôi phục nội dung này' }, { status: 403 });

  const limited = rateLimit('history-restore', viewer.id, 30, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Bạn khôi phục quá nhiều lần. Hãy thử lại sau ít phút.' }, { status: 429 });
  }

  try {
    const result = await restoreRevision(viewer, id, { baseRevisionId });
    if (!result.ok) return NextResponse.json(result.body, { status: result.status });
    revalidateContent();
    revalidateLibrary();
    return NextResponse.json({ data: { revisionId: result.revisionId } });
  } catch (error) {
    console.error('Error restoring revision:', error);
    return NextResponse.json({ error: 'Không khôi phục được' }, { status: 500 });
  }
}

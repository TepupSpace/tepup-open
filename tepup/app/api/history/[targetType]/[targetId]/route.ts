import { NextResponse } from 'next/server';
import { getContributorSession } from '@/lib/admin-auth';
import type { HistoryListResponse, HistoryTargetType } from '@/components/history/types';
import { historyAccess, parseTargetType, viewerOf } from '../../_lib/access';
import { listRevisions, stripRow, targetExists, targetLabel } from '../../_lib/queries';

type Ctx = { params: Promise<{ targetType: string; targetId: string }> };

// GET /api/history/[targetType]/[targetId]?cursor= — revisions of one target, newest first
// (no snapshots). LESSON/COURSE_OUTLINE: canOnCourse(READ_HISTORY) on the course (for a
// deleted lesson, the course stored on its revisions). CHAPTER/LIBRARY_ENTRY: global
// reviewers and admins. Anything else: 404.
export async function GET(request: Request, { params }: Ctx) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { targetType: rawType, targetId } = await params;
  const targetType = parseTargetType(rawType);
  if (!targetType) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  const viewer = viewerOf(session.user);
  const access = await historyAccess(viewer, targetType, targetId);
  if (!access) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  const cursor = new URL(request.url).searchParams.get('cursor');
  const [{ items, nextCursor }, exists, label] = await Promise.all([
    listRevisions(targetType, targetId, cursor),
    targetExists(targetType, targetId),
    targetLabel(targetType, targetId),
  ]);
  if (!exists && items.length === 0) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  const body: HistoryListResponse = {
    target: {
      type: targetType as HistoryTargetType,
      id: targetId,
      label: label ?? items[0]?.label ?? '',
      exists,
      courseId: access.courseId,
    },
    viewer: { isAdmin: access.isAdmin, canRestore: access.canRestore, canPatrol: access.canPatrol },
    revisions: items.map(stripRow),
    nextCursor,
  };
  return NextResponse.json({ data: body });
}

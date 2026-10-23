import { NextResponse } from 'next/server';
import { getContributorSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import type { HistoryTargetType, RevisionDetailResponse, RevisionSourceName } from '@/components/history/types';
import { historyAccess, viewerOf } from '../../_lib/access';
import {
  REVISION_LIST_SELECT,
  entryLinkTitles,
  latestRevisionId,
  liveVersion,
  previousRevision,
  stripRow,
  targetExists,
  toListItems,
} from '../../_lib/queries';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/history/revisions/[id] — one revision with its snapshot, the previous revision's
// snapshot (for the diff) and the live version. Same access rule as the target's history.
export async function GET(_req: Request, { params }: Ctx) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const rev = await prisma.contentRevision.findUnique({
    where: { id },
    select: { ...REVISION_LIST_SELECT, snapshot: true },
  });
  const notFound = () => NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  if (!rev) return notFound();
  const access = await historyAccess(viewerOf(session.user), rev.targetType, rev.targetId);
  if (!access) return notFound();

  const [[item], previous, live, exists, latest] = await Promise.all([
    toListItems([rev]),
    previousRevision(rev),
    liveVersion(rev.targetType, rev.targetId),
    targetExists(rev.targetType, rev.targetId),
    latestRevisionId(rev.targetType, rev.targetId),
  ]);
  const linkTitles =
    rev.targetType === 'LIBRARY_ENTRY' ? await entryLinkTitles([rev.snapshot, previous?.snapshot, live]) : {};

  const body: RevisionDetailResponse = {
    revision: {
      ...stripRow(item),
      targetType: rev.targetType as HistoryTargetType,
      targetId: rev.targetId,
      courseId: rev.courseId,
    },
    snapshot: rev.snapshot,
    previous: previous
      ? {
          id: previous.id,
          createdAt: previous.createdAt.toISOString(),
          source: previous.source as RevisionSourceName,
          snapshot: previous.snapshot,
        }
      : null,
    live: exists ? live : null,
    targetExists: exists,
    latestRevisionId: latest,
    linkTitles,
    viewer: {
      isAdmin: access.isAdmin,
      canRestore: access.canRestore && exists,
      canPatrol: access.canPatrol,
    },
  };
  return NextResponse.json({ data: body });
}

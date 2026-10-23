import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getContributorSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/services/audit-service';
import { canPatrolRevision, namesById, viewerOf } from '../../../_lib/access';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/history/revisions/[id]/patrol — "Đánh dấu đã kiểm tra" (proposal §6.18 revised).
// Admins, global reviewers, and course roles with PATROL on the revision's course
// (lessons and outlines). Idempotent: an already patrolled revision returns 200 as is.
// 200 { data: { patrolled: true, patrolledBy, patrolledAt, already } }; 404 if not allowed.
export async function POST(_req: Request, { params }: Ctx) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const viewer = viewerOf(session.user);

  const rev = await prisma.contentRevision.findUnique({
    where: { id },
    select: { id: true, targetType: true, targetId: true, courseId: true, patrol: true },
  });
  if (!rev || !(await canPatrolRevision(viewer, rev))) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  const respond = async (p: { patrolledById: string | null; patrolledAt: Date }, already: boolean) => {
    const names = await namesById([p.patrolledById]);
    return NextResponse.json({
      data: {
        patrolled: true,
        patrolledBy: p.patrolledById ? (names.get(p.patrolledById) ?? null) : null,
        patrolledAt: p.patrolledAt.toISOString(),
        already,
      },
    });
  };
  if (rev.patrol) return respond(rev.patrol, true);

  try {
    const patrol = await prisma.$transaction(async (tx) => {
      const created = await tx.revisionPatrol.create({ data: { revisionId: id, patrolledById: viewer.id } });
      await audit(tx, {
        actorId: viewer.id,
        action: 'REVISION_PATROLLED',
        targetType: rev.targetType,
        targetId: rev.targetId,
        details: { revisionId: id, courseId: rev.courseId },
      });
      return created;
    });
    return respond(patrol, false);
  } catch (e) {
    // Someone patrolled it at the same moment.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const existing = await prisma.revisionPatrol.findUnique({ where: { revisionId: id } });
      if (existing) return respond(existing, true);
    }
    console.error('Error patrolling revision:', e);
    return NextResponse.json({ error: 'Không đánh dấu được' }, { status: 500 });
  }
}

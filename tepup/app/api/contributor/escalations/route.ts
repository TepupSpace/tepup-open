import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { canReviewContent } from '@/lib/role-utils';
import { canOnCourse, contributionCourseId } from '@/lib/permissions/course-roles';
import { audit } from '@/lib/services/audit-service';
import { adminIds, notify } from '@/lib/services/notification-service';
import { rateLimit } from '@/lib/security/rate-limit';

const MAX_NOTE = 2000;

// POST /api/contributor/escalations  ("Chuyển quản trị viên", proposal §6.20)
// Body: { targetType: 'CONTRIBUTION' | 'REVIEW_REQUEST', id, note }
// Who: global reviewers/admins, and course roles with ESCALATE on the item's course
// (contributions without a course — chapters, library entries, new courses — global
// reviewers only). Never on one's own contribution. While escalated, only an admin can
// approve a contribution (canDecideContribution).
// → 200 { data: { escalatedAt, already } } | 400 | 404 (missing or not allowed) | 409 (closed) | 429
export async function POST(request: Request) {
  try {
    const session = await getContributorSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const viewer = { id: session.user.id, role: session.user.role };

    const body = (await request.json().catch(() => null)) as {
      targetType?: unknown;
      id?: unknown;
      note?: unknown;
    } | null;
    const targetType = body?.targetType;
    const id = typeof body?.id === 'string' ? body.id : '';
    if ((targetType !== 'CONTRIBUTION' && targetType !== 'REVIEW_REQUEST') || !id) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const note = typeof body?.note === 'string' ? body.note.trim() : '';
    if (!note) return NextResponse.json({ error: 'Hãy ghi lý do chuyển quản trị viên' }, { status: 400 });
    if (note.length > MAX_NOTE) {
      return NextResponse.json({ error: `Lý do tối đa ${MAX_NOTE} ký tự` }, { status: 400 });
    }

    const notFound = NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    let courseId: string | null;
    let escalatedAt: Date | null;
    if (targetType === 'CONTRIBUTION') {
      const c = await prisma.contribution.findUnique({
        where: { id },
        select: { type: true, targetId: true, contributorId: true, status: true, escalatedAt: true },
      });
      if (!c || c.contributorId === viewer.id) return notFound;
      courseId = await contributionCourseId(c);
      if (!(canReviewContent(viewer.role) || (courseId && (await canOnCourse(viewer, courseId, 'ESCALATE'))))) {
        return notFound;
      }
      if (c.status !== 'PENDING_REVIEW') {
        return NextResponse.json({ error: 'Đóng góp này không còn chờ duyệt' }, { status: 409 });
      }
      escalatedAt = c.escalatedAt;
    } else {
      const r = await prisma.reviewRequest.findUnique({
        where: { id },
        select: { courseId: true, status: true, escalatedAt: true },
      });
      if (!r) return notFound;
      courseId = r.courseId;
      if (!(canReviewContent(viewer.role) || (await canOnCourse(viewer, r.courseId, 'ESCALATE')))) return notFound;
      if (r.status !== 'OPEN') {
        return NextResponse.json({ error: 'Yêu cầu này đã đóng' }, { status: 409 });
      }
      escalatedAt = r.escalatedAt;
    }

    if (escalatedAt) {
      return NextResponse.json({ data: { escalatedAt: escalatedAt.toISOString(), already: true } });
    }

    const limit = rateLimit('escalation', viewer.id, 20, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json({ error: 'Bạn thao tác quá nhanh, thử lại sau ít phút' }, { status: 429 });
    }

    const now = new Date();
    const changed = await prisma.$transaction(async (tx) => {
      const data = { escalatedAt: now, escalatedById: viewer.id, escalationNote: note };
      // Conditional update: two people escalating at once → only the first counts.
      const res =
        targetType === 'CONTRIBUTION'
          ? await tx.contribution.updateMany({ where: { id, escalatedAt: null }, data })
          : await tx.reviewRequest.updateMany({ where: { id, escalatedAt: null }, data });
      if (!res.count) return false;
      await notify(tx, await adminIds(tx), {
        kind: 'ESCALATED',
        targetType,
        targetId: id,
        actorId: viewer.id,
      });
      await audit(tx, {
        actorId: viewer.id,
        action: targetType === 'CONTRIBUTION' ? 'CONTRIBUTION_ESCALATED' : 'REVIEW_REQUEST_ESCALATED',
        targetType,
        targetId: id,
        details: { note, courseId },
      });
      return true;
    });

    return NextResponse.json({ data: { escalatedAt: now.toISOString(), already: !changed } });
  } catch (error) {
    console.error('Error escalating:', error);
    return NextResponse.json({ error: 'Không thể chuyển quản trị viên' }, { status: 500 });
  }
}

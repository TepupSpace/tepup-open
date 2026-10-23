import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { staffName } from '@/lib/credit';
import { audit } from '@/lib/services/audit-service';
import { closeOpenProposalsOnCourse, findUserByUsername } from '@/lib/services/course-roles-service';

/**
 * Admin: per-course blocks (proposal §6.20). A blocked user can't propose, comment or claim
 * suggestions on the course; blocking closes their open proposals for it as REJECTED.
 * GET → { blocks[] } · POST { username, reason? } → 201 { ok, closed } · DELETE ?userId= → { ok }
 */
const REASON_MAX = 500;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: courseId } = await params;

  const blocks = await prisma.courseBlock.findMany({ where: { courseId }, orderBy: { createdAt: 'desc' } });
  const ids = [...new Set(blocks.flatMap((b) => [b.userId, b.blockedById]).filter((x): x is string => !!x))];
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, username: true, name: true, publicHandle: true, deletedAt: true },
  });
  const nameOf = new Map(users.map((u) => [u.id, staffName(u)]));

  return NextResponse.json({
    blocks: blocks.map((b) => ({
      userId: b.userId,
      name: nameOf.get(b.userId) ?? '(không rõ)',
      reason: b.reason,
      blockedBy: b.blockedById ? nameOf.get(b.blockedById) ?? '(không rõ)' : null,
      createdAt: b.createdAt,
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: courseId } = await params;
  const body = await req.json().catch(() => null);
  // A JSON `null`, array or malformed body is a client error, not a 500.
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (reason.length > REASON_MAX) {
    return NextResponse.json({ error: `Lý do tối đa ${REASON_MAX} ký tự` }, { status: 400 });
  }
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return NextResponse.json({ error: 'Không tìm thấy khóa học' }, { status: 404 });

  const user = await findUserByUsername(body.username);
  if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản với tên đăng nhập này' }, { status: 404 });
  if (user.id === session.user.id) return NextResponse.json({ error: 'Không thể tự chặn mình' }, { status: 400 });
  if (user.role === 'ADMIN') return NextResponse.json({ error: 'Không chặn quản trị viên' }, { status: 400 });
  const member = await prisma.courseMember.findUnique({
    where: { courseId_userId: { courseId, userId: user.id } },
    select: { role: true },
  });
  if (member) {
    return NextResponse.json({ error: 'Người này đang có vai trò trong khóa học. Gỡ vai trò trước khi chặn.' }, { status: 409 });
  }

  let closed = 0;
  try {
    closed = await prisma.$transaction(async (tx) => {
      await tx.courseBlock.create({
        data: { courseId, userId: user.id, reason: reason || null, blockedById: session.user.id },
      });
      const n = await closeOpenProposalsOnCourse(tx, courseId, user.id, session.user.id);
      await audit(tx, {
        actorId: session.user.id,
        action: 'COURSE_BLOCK_ADDED',
        targetType: 'COURSE',
        targetId: courseId,
        details: { userId: user.id, reason: reason || null, closedProposals: n },
      });
      return n;
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Người này đã bị chặn ở khóa học này' }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true, closed }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: courseId } = await params;
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });

  const removed = await prisma.$transaction(async (tx) => {
    const res = await tx.courseBlock.deleteMany({ where: { courseId, userId } });
    if (res.count === 0) return false;
    await audit(tx, {
      actorId: session.user.id,
      action: 'COURSE_BLOCK_REMOVED',
      targetType: 'COURSE',
      targetId: courseId,
      details: { userId },
    });
    return true;
  });
  if (!removed) return NextResponse.json({ error: 'Không tìm thấy lượt chặn này' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

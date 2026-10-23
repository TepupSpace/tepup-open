import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { staffName } from '@/lib/credit';
import { audit } from '@/lib/services/audit-service';
import { notify } from '@/lib/services/notification-service';
import { findUserByUsername, isCourseRole } from '@/lib/services/course-roles-service';
import { isContributorOrAbove } from '@/lib/role-utils';
import { revalidateContent } from '@/lib/cache';

/**
 * Admin: course members (maintainers and trusted reviewers), proposal §6.8 / §6.14a.
 * GET  → { course, members[] } (trusted reviewers include their ReviewerProfile)
 * POST { username, role: COURSE_LEAD | TRUSTED_REVIEWER } → 201 { ok }
 *      400 bad role / account deleted, banned or not a contributor · 404 course/user · 409 already a member or blocked
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isActive: true,
      members: {
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        select: {
          role: true,
          disclosure: true,
          addedById: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              publicHandle: true,
              deletedAt: true,
              isBanned: true,
              role: true,
              reviewerProfile: {
                select: {
                  publicName: true,
                  credential: true,
                  affiliation: true,
                  disclosure: true,
                  verifiedAt: true,
                  verifiedById: true,
                  verificationNote: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!course) return NextResponse.json({ error: 'Không tìm thấy khóa học' }, { status: 404 });

  const otherIds = [
    ...new Set(
      course.members.flatMap((m) => [m.addedById, m.user.reviewerProfile?.verifiedById]).filter((x): x is string => !!x)
    ),
  ];
  const others = await prisma.user.findMany({
    where: { id: { in: otherIds } },
    select: { id: true, username: true, name: true, publicHandle: true, deletedAt: true },
  });
  const nameOf = new Map(others.map((u) => [u.id, staffName(u)]));

  return NextResponse.json({
    course: { id: course.id, name: course.name, isActive: course.isActive },
    members: course.members.map((m) => {
      const p = m.user.reviewerProfile;
      return {
        userId: m.user.id,
        username: m.user.username,
        name: staffName(m.user),
        globalRole: m.user.role,
        isBanned: m.user.isBanned,
        deleted: !!m.user.deletedAt,
        role: m.role,
        disclosure: m.disclosure,
        addedBy: m.addedById ? nameOf.get(m.addedById) ?? '(không rõ)' : null,
        createdAt: m.createdAt,
        profile: p
          ? {
              publicName: p.publicName,
              credential: p.credential,
              affiliation: p.affiliation,
              disclosure: p.disclosure,
              verifiedAt: p.verifiedAt,
              verifiedBy: p.verifiedById ? nameOf.get(p.verifiedById) ?? '(không rõ)' : null,
              verificationNote: p.verificationNote,
              updatedAt: p.updatedAt,
            }
          : null,
      };
    }),
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

  if (!isCourseRole(body.role)) {
    return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 });
  }
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return NextResponse.json({ error: 'Không tìm thấy khóa học' }, { status: 404 });

  const user = await findUserByUsername(body.username);
  if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản với tên đăng nhập này' }, { status: 404 });
  if (user.deletedAt) return NextResponse.json({ error: 'Tài khoản này đã bị xóa' }, { status: 400 });
  if (user.isBanned) return NextResponse.json({ error: 'Tài khoản này đang bị khóa' }, { status: 400 });
  if (!isContributorOrAbove(user.role)) {
    return NextResponse.json(
      { error: 'Tài khoản cần có cấp truy cập Người soạn thảo trở lên (đổi trong Quản trị → Người dùng)' },
      { status: 400 }
    );
  }

  const [existing, blocked] = await Promise.all([
    prisma.courseMember.findUnique({ where: { courseId_userId: { courseId, userId: user.id } }, select: { role: true } }),
    prisma.courseBlock.findUnique({ where: { courseId_userId: { courseId, userId: user.id } }, select: { userId: true } }),
  ]);
  if (existing) {
    return NextResponse.json({ error: 'Người này đã có vai trò trong khóa học. Hãy đổi vai trò ở danh sách.' }, { status: 409 });
  }
  if (blocked) {
    return NextResponse.json({ error: 'Người này đang bị chặn ở khóa học này. Bỏ chặn trước.' }, { status: 409 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.courseMember.create({ data: { courseId, userId: user.id, role: body.role, addedById: session.user.id } });
      await audit(tx, {
        actorId: session.user.id,
        action: 'COURSE_ROLE_ADDED',
        targetType: 'COURSE',
        targetId: courseId,
        details: { userId: user.id, role: body.role },
      });
      await notify(tx, [user.id], {
        kind: 'COURSE_ROLE_GRANTED',
        targetType: 'COURSE',
        targetId: courseId,
        actorId: session.user.id,
      });
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Người này đã có vai trò trong khóa học' }, { status: 409 });
    }
    throw e;
  }

  revalidateContent(); // course credits list maintainers and reviewers
  return NextResponse.json({ ok: true }, { status: 201 });
}

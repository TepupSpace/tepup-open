import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';

/** The signed-in user's course roles (settings → "Vai trò trong khóa học"). */
export async function GET() {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [rows, profile] = await Promise.all([
    prisma.courseMember.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      select: {
        role: true,
        disclosure: true,
        createdAt: true,
        course: { select: { id: true, name: true, isActive: true } },
      },
    }),
    prisma.reviewerProfile.findUnique({ where: { userId: session.user.id }, select: { disclosure: true } }),
  ]);

  return NextResponse.json({
    profileDisclosure: profile?.disclosure ?? 'NONE',
    roles: rows.map((r) => ({
      courseId: r.course.id,
      courseName: r.course.name,
      courseActive: r.course.isActive,
      role: r.role,
      disclosure: r.disclosure,
      createdAt: r.createdAt,
    })),
  });
}

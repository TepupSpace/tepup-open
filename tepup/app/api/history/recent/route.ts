import { NextResponse } from 'next/server';
import type { Prisma, RevisionTarget } from '@prisma/client';
import { getContributorSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { courseIdsWhere } from '@/lib/permissions/course-roles';
import type { HistoryTargetType, RecentChangesResponse } from '@/components/history/types';
import { parseTargetType, recentChangesScope, viewerOf } from '../_lib/access';
import { REVISION_LIST_SELECT, existingTargets, stripRow, toListItems } from '../_lib/queries';

const PAGE = 50;
const COURSE_TYPES: RevisionTarget[] = ['LESSON', 'COURSE_OUTLINE'];

// GET /api/history/recent?unpatrolled=1&courseId= (alias: course)&targetType=&cursor= — "Thay đổi gần đây"
// (proposal §6.18). Admins and global reviewers see everything; course roles see lessons and
// outlines of their courses only. BASELINE revisions are not changes and are left out.
export async function GET(request: Request) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const viewer = viewerOf(session.user);
  const sp = new URL(request.url).searchParams;
  const unpatrolled = sp.get('unpatrolled') === '1';
  const courseFilter = sp.get('courseId') || sp.get('course') || null;
  const typeFilter = parseTargetType(sp.get('targetType'));
  const cursor = sp.get('cursor') || null;

  const scope = await recentChangesScope(viewer);
  const global = scope === null;

  const where: Prisma.ContentRevisionWhereInput = { source: { not: 'BASELINE' } };
  const empty = (): NextResponse =>
    NextResponse.json({ data: { rows: [], nextCursor: null, viewer: { isAdmin: viewer.role === 'ADMIN', global }, courses: [] } });

  if (global) {
    if (typeFilter) where.targetType = typeFilter;
    if (courseFilter) where.courseId = courseFilter;
  } else {
    if (typeFilter && !COURSE_TYPES.includes(typeFilter)) return empty();
    where.targetType = typeFilter ?? { in: COURSE_TYPES };
    const allowed = courseFilter ? scope.filter((id) => id === courseFilter) : scope;
    if (!allowed.length) return empty();
    where.courseId = { in: allowed };
  }
  if (unpatrolled) where.patrol = { is: null };

  const rows = await prisma.contentRevision.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: PAGE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: REVISION_LIST_SELECT,
  });
  const more = rows.length > PAGE;
  const page = more ? rows.slice(0, PAGE) : rows;

  const courseIds = [...new Set(page.map((r) => r.courseId).filter((x): x is string => !!x))];
  const [items, existing, patrolScope, rowCourses, filterCourses] = await Promise.all([
    toListItems(page),
    existingTargets(page),
    global ? Promise.resolve(null) : courseIdsWhere(viewer.id, 'PATROL'),
    courseIds.length ? prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, name: true } }) : [],
    prisma.course.findMany({
      where: global ? {} : { id: { in: scope } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 500,
    }),
  ]);
  const courseName = new Map(rowCourses.map((c) => [c.id, c.name]));

  const body: RecentChangesResponse = {
    rows: items.map((item) => {
      const r = item.row;
      return {
        ...stripRow(item),
        targetType: r.targetType as HistoryTargetType,
        targetId: r.targetId,
        courseId: r.courseId,
        courseName: r.courseId ? (courseName.get(r.courseId) ?? null) : null,
        targetExists: existing.has(`${r.targetType}:${r.targetId}`),
        canPatrol: patrolScope === null || (!!r.courseId && patrolScope.includes(r.courseId)),
      };
    }),
    nextCursor: more ? page[page.length - 1].id : null,
    viewer: { isAdmin: viewer.role === 'ADMIN', global },
    courses: filterCourses,
  };
  return NextResponse.json({ data: body });
}

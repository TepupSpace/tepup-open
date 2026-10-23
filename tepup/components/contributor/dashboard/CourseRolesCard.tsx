import Link from '@/components/ui/AppLink';
import { prisma } from '@/lib/prisma';
import { Wrench, ShieldCheck } from 'lucide-react';
import type { CourseRole } from '@prisma/client';
import { COURSE_ROLE_TERM } from '@/lib/terms';

/**
 * Dashboard: "Khóa bạn phụ trách", grouped by role (Trưởng khóa học / Người duyệt tin cậy) (proposal §6.8, §6.14a), with counts of
 * proposals waiting (not the user's own) and, for maintainers, open reader suggestions.
 * Renders nothing when the user holds no course role.
 */
export default async function CourseRolesCard({ userId }: { userId: string }) {
  const memberships = await prisma.courseMember.findMany({
    where: { userId },
    select: { role: true, course: { select: { id: true, name: true, isActive: true } } },
    orderBy: { createdAt: 'asc' },
  });
  if (memberships.length === 0) return null;

  const courseIds = memberships.map((m) => m.course.id);
  const lessons = await prisma.lesson.findMany({
    where: { courseId: { in: courseIds } },
    select: { id: true, courseId: true },
  });
  const courseOfLesson = new Map(lessons.map((l) => [l.id, l.courseId]));
  const lessonIds = lessons.map((l) => l.id);
  const maintainedLessonIds = lessons
    .filter((l) => memberships.some((m) => m.role === 'COURSE_LEAD' && m.course.id === l.courseId))
    .map((l) => l.id);

  const [lessonProposals, outlineProposals, suggestions] = await Promise.all([
    prisma.contribution.groupBy({
      by: ['targetId'],
      where: {
        type: 'EDIT_LESSON_CONTENT',
        status: 'PENDING_REVIEW',
        contributorId: { not: userId },
        targetId: { in: lessonIds },
      },
      _count: { _all: true },
    }),
    prisma.contribution.groupBy({
      by: ['targetId'],
      where: { type: 'EDIT_COURSE', status: 'PENDING_REVIEW', contributorId: { not: userId }, targetId: { in: courseIds } },
      _count: { _all: true },
    }),
    maintainedLessonIds.length
      ? prisma.suggestion.groupBy({
          by: ['targetId'],
          where: { targetType: 'LESSON', status: { in: ['PENDING', 'ACCEPTED'] }, targetId: { in: maintainedLessonIds } },
          _count: { _all: true },
        })
      : Promise.resolve([] as { targetId: string; _count: { _all: number } }[]),
  ]);

  const proposalsByCourse = new Map<string, number>();
  const add = (map: Map<string, number>, key: string | null | undefined, n: number) => {
    if (key) map.set(key, (map.get(key) ?? 0) + n);
  };
  for (const p of lessonProposals) add(proposalsByCourse, p.targetId && courseOfLesson.get(p.targetId), p._count._all);
  for (const p of outlineProposals) add(proposalsByCourse, p.targetId, p._count._all);
  const suggestionsByCourse = new Map<string, number>();
  for (const s of suggestions) add(suggestionsByCourse, courseOfLesson.get(s.targetId), s._count._all);

  const groups: { role: CourseRole; title: string; Icon: typeof Wrench }[] = [
    { role: 'COURSE_LEAD', title: `Bạn là ${COURSE_ROLE_TERM.COURSE_LEAD.toLocaleLowerCase('vi')}`, Icon: Wrench },
    { role: 'TRUSTED_REVIEWER', title: `Bạn là ${COURSE_ROLE_TERM.TRUSTED_REVIEWER.toLocaleLowerCase('vi')}`, Icon: ShieldCheck },
  ];

  return (
    <section aria-labelledby="course-roles-title" className="bg-white rounded-xl border border-gray-100 p-6" data-testid="course-roles-card">
      <h2 id="course-roles-title" className="text-lg font-semibold text-gray-900 mb-3">
        Khóa bạn phụ trách
      </h2>
      {groups.map(({ role, title, Icon }) => {
        const rows = memberships.filter((m) => m.role === role);
        if (!rows.length) return null;
        return (
          <div key={role} className="mt-3 first:mt-0">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Icon className="w-4 h-4 text-teal-700" aria-hidden="true" />
              {title}
            </h3>
            <ul className="divide-y divide-gray-100">
              {rows.map(({ course }) => {
                const proposals = proposalsByCourse.get(course.id) ?? 0;
                const open = suggestionsByCourse.get(course.id) ?? 0;
                return (
                  <li key={course.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/contributor/maintain/${course.id}`}
                        className="font-medium text-gray-900 underline-offset-2 hover:underline"
                      >
                        {course.name}
                      </Link>
                      {!course.isActive && <span className="ml-2 text-xs text-amber-900">(đang ẩn)</span>}
                      <p className="mt-0.5 text-xs text-gray-600">
                        {proposals} đề xuất chờ duyệt
                        {role === 'COURSE_LEAD' && ` · ${open} góp ý đang mở`}
                      </p>
                    </div>
                    <Link
                      href={`/contributor/reviews?course=${encodeURIComponent(course.id)}`}
                      className="text-sm font-medium text-teal-800 underline underline-offset-2"
                    >
                      Duyệt<span className="sr-only"> đề xuất cho {course.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

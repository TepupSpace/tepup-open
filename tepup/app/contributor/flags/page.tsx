import type { Metadata } from 'next';
import type { Prisma, UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { canReviewContent } from '@/lib/role-utils';
import { courseIdsWhere } from '@/lib/permissions/course-roles';
import { FLAG_KIND_LABELS, learnerBanner } from '@/components/contributor/hub/flag-kinds';
import ReviewSectionTabs from '@/components/contributor/ReviewSectionTabs';

export const metadata: Metadata = { title: 'Cờ bảo trì đang mở' };

const dateFmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Open maintenance flags (proposal §6.21) on every course where the user may FLAG: all
 * courses for global reviewers and admins, otherwise the courses they maintain or review.
 * Everyone with FLAG on a course may also see its hidden lessons, so nothing hidden leaks.
 */
export default async function FlagsPage() {
  const session = await requireContributor();
  const role = session.user.role as UserRole;
  const global = canReviewContent(role);
  const courseIds = global ? null : await courseIdsWhere(session.user.id, 'FLAG');

  const where: Prisma.LessonFlagWhereInput = { resolvedAt: null, ...(courseIds ? { courseId: { in: courseIds } } : {}) };
  const flags = courseIds && courseIds.length === 0 ? [] : await prisma.lessonFlag.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });

  const lessons = flags.length
    ? await prisma.lesson.findMany({
        where: { id: { in: [...new Set(flags.map((f) => f.lessonId))] } },
        select: { id: true, name: true, courseId: true, course: { select: { name: true } } },
      })
    : [];
  const lessonById = new Map(lessons.map((l) => [l.id, l]));

  // Group by course, then lesson.
  const byCourse = new Map<string, { name: string; lessons: Map<string, { name: string; flags: typeof flags }> }>();
  for (const f of flags) {
    const l = lessonById.get(f.lessonId);
    if (!l) continue; // lesson deleted
    if (courseIds && !courseIds.includes(l.courseId)) continue;
    const c = byCourse.get(l.courseId) ?? { name: l.course.name, lessons: new Map() };
    byCourse.set(l.courseId, c);
    const entry = c.lessons.get(l.id) ?? { name: l.name, flags: [] };
    c.lessons.set(l.id, entry);
    entry.flags.push(f);
  }

  return (
    <div className="max-w-4xl">
      <ReviewSectionTabs viewer={session.user} current="/contributor/flags" />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Cờ bảo trì đang mở</h1>
      <p className="mb-6 text-sm text-gray-600">
        {global
          ? 'Mọi khóa học.'
          : 'Các khóa bạn phụ trách hoặc duyệt.'}{' '}
        Mở trang công cụ của bài để gỡ cờ hoặc gắn thêm cờ.
      </p>

      {byCourse.size === 0 ? (
        <p className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-600">Không có cờ nào đang mở.</p>
      ) : (
        <div className="space-y-6">
          {[...byCourse].map(([courseId, c]) => (
            <section key={courseId} aria-labelledby={`flags-course-${courseId}`} className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 id={`flags-course-${courseId}`} className="mb-3 text-lg font-semibold text-gray-900">
                {c.name}
              </h2>
              <ul className="space-y-3">
                {[...c.lessons].map(([lessonId, l]) => (
                  <li key={lessonId}>
                    <Link href={`/contributor/lessons/${lessonId}`} className="font-medium text-teal-800 underline underline-offset-2">
                      {l.name}
                    </Link>
                    <ul className="mt-1 space-y-1 pl-4 text-sm">
                      {l.flags.map((f) => (
                        <li key={f.id} className="text-gray-800">
                          {FLAG_KIND_LABELS[f.kind]}
                          <span className="text-gray-600">
                            {' '}
                            · {learnerBanner(f.kind) ? 'người học thấy' : 'chỉ nhân sự thấy'} · từ {dateFmt.format(f.createdAt)}
                          </span>
                          {f.note && <p className="whitespace-pre-line text-gray-700">Ghi chú: {f.note}</p>}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

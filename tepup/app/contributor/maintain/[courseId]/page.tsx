import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { canOnCourse, getCourseRole } from '@/lib/permissions/course-roles';
import { canReviewContent } from '@/lib/role-utils';
import { staffName } from '@/lib/credit';
import { COURSE_ROLE_LABEL } from '@/lib/contribution-labels';
import LessonVisibilityToggle from './LessonVisibilityToggle';

export const metadata: Metadata = { title: 'Khóa học bạn phụ trách' };

/**
 * Maintainer's view of one course (proposal §6.8): outline with show/hide where allowed,
 * open proposals and suggestions per lesson, members (read-only), links to history.
 * Access: any course role on this course, or a global reviewer. 404 otherwise.
 */
export default async function MaintainCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const session = await requireContributor();
  const { courseId } = await params;
  const viewer = { id: session.user.id, role: session.user.role as UserRole };

  const myRole = await getCourseRole(courseId, viewer.id);
  if (!myRole && !canReviewContent(viewer.role)) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      levels: {
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          name: true,
          lessons: {
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
            select: { id: true, name: true, slug: true, isActive: true },
          },
        },
      },
      members: {
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        select: {
          role: true,
          createdAt: true,
          user: { select: { id: true, username: true, name: true, publicHandle: true, deletedAt: true } },
        },
      },
    },
  });
  if (!course) notFound();

  const isAdmin = viewer.role === 'ADMIN';
  const [mayToggle, maySuggestions] = await Promise.all([
    canOnCourse(viewer, courseId, 'TOGGLE_LESSON'),
    canOnCourse(viewer, courseId, 'ACCEPT_SUGGESTION'),
  ]);
  const canToggle = mayToggle && (course.isActive || isAdmin);

  const lessonIds = course.levels.flatMap((l) => l.lessons.map((x) => x.id));
  const [proposalCounts, outlineProposals, suggestionCounts] = await Promise.all([
    prisma.contribution.groupBy({
      by: ['targetId'],
      where: { type: 'EDIT_LESSON_CONTENT', status: 'PENDING_REVIEW', targetId: { in: lessonIds } },
      _count: { _all: true },
    }),
    prisma.contribution.count({ where: { type: 'EDIT_COURSE', status: 'PENDING_REVIEW', targetId: courseId } }),
    maySuggestions
      ? prisma.suggestion.groupBy({
          by: ['targetId'],
          where: { targetType: 'LESSON', status: { in: ['PENDING', 'ACCEPTED'] }, targetId: { in: lessonIds } },
          _count: { _all: true },
        })
      : Promise.resolve([] as { targetId: string; _count: { _all: number } }[]),
  ]);
  const proposalsBy = new Map(proposalCounts.map((p) => [p.targetId, p._count._all]));
  const suggestionsBy = new Map(suggestionCounts.map((s) => [s.targetId, s._count._all]));
  const totalProposals = proposalCounts.reduce((n, p) => n + p._count._all, 0) + outlineProposals;

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <p className="text-sm text-gray-600">
          {myRole ? `Vai trò của bạn: ${COURSE_ROLE_LABEL[myRole]}` : 'Bạn xem với quyền người duyệt chung'}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          {!course.isActive && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              Khóa học đang ẩn với người học
            </span>
          )}
          <Link href={`/courses/${course.slug}`} className="text-teal-800 underline">
            Mở trang khóa học
          </Link>
          <Link href={`/contributor/reviews?course=${encodeURIComponent(course.id)}`} className="text-teal-800 underline">
            Đề xuất chờ duyệt ({totalProposals})
          </Link>
          <Link href={`/contributor/history/COURSE_OUTLINE/${encodeURIComponent(course.id)}`} className="text-teal-800 underline">
            Lịch sử dàn bài
          </Link>
          <Link href={`/contributor/recent-changes?course=${encodeURIComponent(course.id)}`} className="text-teal-800 underline">
            Thay đổi gần đây
          </Link>
        </div>
      </header>

      <section aria-labelledby="maintain-outline">
        <h2 id="maintain-outline" className="mb-2 text-lg font-semibold text-gray-900">
          Dàn bài
        </h2>
        {mayToggle && !canToggle && (
          <p className="mb-3 text-sm text-gray-600">
            Khóa học đang ẩn, nên chỉ quản trị viên được hiện hoặc ẩn bài trong khóa này.
          </p>
        )}
        {!mayToggle && (
          <p className="mb-3 text-sm text-gray-600">Chỉ trưởng khóa học và quản trị viên được hiện hoặc ẩn bài.</p>
        )}
        {course.levels.length === 0 ? (
          <p className="text-sm text-gray-600">Khóa học chưa có cấp độ nào.</p>
        ) : (
          <div className="space-y-6">
            {course.levels.map((level) => (
              <div key={level.id} className="rounded-xl border border-gray-100 bg-white">
                <h3 className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-900">{level.name}</h3>
                {level.lessons.length === 0 ? (
                  <p className="px-5 py-3 text-sm text-gray-600">Chưa có bài học.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {level.lessons.map((lesson) => {
                      const proposals = proposalsBy.get(lesson.id) ?? 0;
                      const suggestions = suggestionsBy.get(lesson.id) ?? 0;
                      return (
                        <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <Link
                              href={`/contributor/lessons/${lesson.id}`}
                              className="font-medium text-gray-900 underline-offset-2 hover:underline"
                            >
                              {lesson.name}
                            </Link>
                            <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-600">
                              <span>{lesson.isActive ? 'Đang hiển thị' : 'Đang ẩn'}</span>
                              {proposals > 0 && <span>{proposals} đề xuất chờ duyệt</span>}
                              {suggestions > 0 && <span>{suggestions} góp ý đang mở</span>}
                            </p>
                          </div>
                          {canToggle && (
                            <LessonVisibilityToggle lessonId={lesson.id} lessonName={lesson.name} isActive={lesson.isActive} />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="maintain-members">
        <h2 id="maintain-members" className="mb-2 text-lg font-semibold text-gray-900">
          Thành viên khóa học
        </h2>
        {course.members.length === 0 ? (
          <p className="text-sm text-gray-600">Khóa học chưa có trưởng khóa học hay người duyệt tin cậy.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
            {course.members.map((m) => (
              <li key={m.user.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <span className="font-medium text-gray-900">{staffName(m.user)}</span>
                <span className="text-gray-600">
                  {COURSE_ROLE_LABEL[m.role]} · từ {m.createdAt.toLocaleDateString('vi-VN')}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-gray-600">Quản trị viên thêm hoặc gỡ thành viên.</p>
      </section>
    </div>
  );
}

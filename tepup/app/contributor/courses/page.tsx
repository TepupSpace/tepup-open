import type { Metadata } from 'next';
import type { UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { canReviewContent } from '@/lib/role-utils';
import { canOnCourse, getMemberships } from '@/lib/permissions/course-roles';
import { COURSE_ROLE_LABEL } from '@/lib/contribution-labels';
import { TYPE_LABELS as ENTRY_TYPE_LABELS, type EntryType } from '@/lib/library/schemas';
import ProposeEditButton from '@/components/contributor/proposal/ProposeEditButton';
import SectionTabs, { FIND_WORK_TABS, NewCourseButton } from '@/components/contributor/SectionTabs';

export const metadata: Metadata = { title: 'Khóa học và thư viện' };

const hiddenBadge = (
  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Đang ẩn</span>
);

/**
 * Where contributors find content to improve (proposal §6.3): courses → levels → lessons,
 * stories → chapters, and a library search, each linking to its hub ("Đề xuất sửa", history,
 * discussion). Hidden content follows the same rule as everywhere: lessons/courses only with
 * canOnCourse(SEE_HIDDEN), hidden chapters/stories/entries only for global reviewers.
 * Staff-only page (not cached).
 */
export default async function ContributorCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const session = await requireContributor();
  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const globalReviewer = canReviewContent(viewer.role);
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 100) ?? '';

  const [courses, memberships, characters, entries] = await Promise.all([
    prisma.course.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        isActive: true,
        levels: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            name: true,
            lessons: {
              orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
              select: { id: true, name: true, isActive: true },
            },
          },
        },
      },
    }),
    getMemberships(viewer.id),
    prisma.character.findMany({
      where: globalReviewer ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        isActive: true,
        stories: {
          where: globalReviewer ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            isActive: true,
            chapters: {
              where: globalReviewer ? {} : { isActive: true },
              orderBy: { sortOrder: 'asc' },
              select: { id: true, title: true, isActive: true },
            },
          },
        },
      },
    }),
    q
      ? prisma.libraryEntry.findMany({
          where: {
            ...(globalReviewer ? {} : { isActive: true }),
            title: { contains: q, mode: 'insensitive' },
          },
          orderBy: { title: 'asc' },
          take: 50,
          select: { id: true, title: true, type: true, isActive: true, summary: true },
        })
      : Promise.resolve([]),
  ]);

  // Hidden lessons/courses: only where the user may see hidden content of that course.
  const visible = [];
  for (const course of courses) {
    const hasHidden = !course.isActive || course.levels.some((l) => l.lessons.some((x) => !x.isActive));
    const seeHidden = hasHidden ? await canOnCourse(viewer, course.id, 'SEE_HIDDEN') : false;
    if (!course.isActive && !seeHidden) continue;
    visible.push({
      ...course,
      seeHidden,
      // A level whose lessons are all hidden is dropped too: its name would leak (same rule as
      // getCourseBySlugInternal). Levels that really are empty still show.
      levels: course.levels
        .map((l) => ({ ...l, lessons: l.lessons.filter((x) => x.isActive || seeHidden), hadLessons: l.lessons.length > 0 }))
        .filter((l) => seeHidden || l.lessons.length > 0 || !l.hadLessons),
    });
  }

  return (
    <div className="max-w-5xl space-y-10">
      <header>
        <SectionTabs label="Tìm bài để sửa" tabs={FIND_WORK_TABS} current="/contributor/courses">
          <NewCourseButton />
        </SectionTabs>
        <h1 className="text-2xl font-bold text-gray-900">Khóa học và thư viện</h1>
        <p className="mt-1 text-sm text-gray-700">
          Chọn một bài, một chương hoặc một mục thư viện để đề xuất sửa, xem lịch sử và thảo luận. Muốn viết khóa mới?{' '}
          <Link href="/contributor/courses/new" className="text-teal-800 underline underline-offset-2">
            Tạo khóa học mới
          </Link>
          .
        </p>
      </header>

      <section aria-labelledby="browse-courses">
        <h2 id="browse-courses" className="mb-3 text-xl font-semibold text-gray-900">
          Khóa học
        </h2>
        {visible.length === 0 ? (
          <p className="text-sm text-gray-600">Chưa có khóa học nào.</p>
        ) : (
          <ul className="space-y-3">
            {visible.map((course) => {
              const role = memberships.get(course.id);
              const lessonCount = course.levels.reduce((n, l) => n + l.lessons.length, 0);
              return (
                <li key={course.id} id={`course-${course.id}`} className="rounded-xl border border-gray-100 bg-white">
                  <details>
                    <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-4 py-3 text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-xs text-gray-600">{lessonCount} bài</span>
                      {role && (
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-900">
                          {COURSE_ROLE_LABEL[role] ?? role}
                        </span>
                      )}
                      {!course.isActive && hiddenBadge}
                    </summary>
                    <div className="space-y-4 border-t border-gray-100 px-4 py-4">
                      <ProposeEditButton
                        type="EDIT_COURSE"
                        targetId={course.id}
                        label="Đề xuất sửa mục lục"
                        className="inline-flex items-center gap-2 rounded-lg border border-teal-700 bg-white px-3 py-1.5 text-sm font-medium text-teal-800 hover:bg-teal-50 aria-disabled:cursor-wait aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                      />
                      {course.levels.map((level) => (
                        <div key={level.id}>
                          <h3 className="text-sm font-semibold text-gray-800">{level.name}</h3>
                          {level.lessons.length === 0 ? (
                            <p className="text-sm text-gray-600">Chưa có bài.</p>
                          ) : (
                            <ul className="mt-1 space-y-1">
                              {level.lessons.map((lesson) => (
                                <li key={lesson.id} className="flex flex-wrap items-center gap-2 text-sm">
                                  <Link
                                    href={`/contributor/lessons/${lesson.id}`}
                                    className="text-teal-800 underline underline-offset-2"
                                  >
                                    {lesson.name}
                                  </Link>
                                  {!lesson.isActive && hiddenBadge}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="browse-stories">
        <h2 id="browse-stories" className="mb-3 text-xl font-semibold text-gray-900">
          Truyện
        </h2>
        {characters.every((c) => c.stories.length === 0) ? (
          <p className="text-sm text-gray-600">Chưa có truyện nào.</p>
        ) : (
          <ul className="space-y-3">
            {characters.flatMap((character) =>
              character.stories.map((story) => (
                <li key={story.id} className="rounded-xl border border-gray-100 bg-white">
                  <details>
                    <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-4 py-3 text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
                      <span className="font-medium">{story.title}</span>
                      <span className="text-xs text-gray-600">
                        {character.name} · {story.chapters.length} chương
                      </span>
                      {(!story.isActive || !character.isActive) && hiddenBadge}
                    </summary>
                    <ul className="space-y-1 border-t border-gray-100 px-4 py-3">
                      {story.chapters.length === 0 && <li className="text-sm text-gray-600">Chưa có chương.</li>}
                      {story.chapters.map((chapter) => (
                        <li key={chapter.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <Link
                            href={`/contributor/chapters/${chapter.id}`}
                            className="text-teal-800 underline underline-offset-2"
                          >
                            {chapter.title}
                          </Link>
                          {!chapter.isActive && hiddenBadge}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="browse-library">
        <h2 id="browse-library" className="mb-3 text-xl font-semibold text-gray-900">
          Thư viện
        </h2>
        <form method="get" role="search" className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="library-q" className="mb-1 block text-sm font-medium text-gray-700">
              Tìm mục theo tiêu đề
            </label>
            <input
              id="library-q"
              name="q"
              type="search"
              defaultValue={q}
              maxLength={100}
              className="w-72 max-w-full rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            Tìm
          </button>
        </form>
        {q && (
          <div className="mt-4">
            {entries.length === 0 ? (
              <p className="text-sm text-gray-600">Không có mục nào khớp «{q}».</p>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-700">
                  {entries.length === 50 ? 'Hơn 50' : entries.length} mục khớp «{q}».
                </p>
                <ul className="space-y-2">
                  {entries.map((e) => (
                    <li key={e.id} className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/contributor/library/${e.id}`} className="font-medium text-teal-800 underline underline-offset-2">
                          {e.title}
                        </Link>
                        <span className="text-xs text-gray-600">{ENTRY_TYPE_LABELS[e.type as EntryType] ?? e.type}</span>
                        {!e.isActive && hiddenBadge}
                      </div>
                      <p className="mt-0.5 text-gray-700">{e.summary}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

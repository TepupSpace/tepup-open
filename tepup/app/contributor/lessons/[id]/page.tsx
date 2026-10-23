import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { getLessonForViewerById } from '@/lib/services/content-service';
import ProposeEditSection from '@/components/contributor/hub/ProposeEditSection';
import FlagsSection from '@/components/contributor/hub/FlagsSection';
import HistorySection from '@/components/history/HistorySection';
import DiscussionThread from '@/components/discussion/DiscussionThread';

export const metadata: Metadata = { title: 'Công cụ cho bài học' };

/**
 * Lesson hub for contributors: propose an edit, flags, history and discussion in one place.
 * Reached from the staff view's wrench button. Same hidden-content rule as the staff view:
 * 404 for a lesson the user may not see (getLessonForViewerById).
 */
export default async function LessonHubPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireContributor();
  const { id } = await params;
  const lesson = await getLessonForViewerById(id, { id: session.user.id, role: session.user.role as UserRole });
  if (!lesson) notFound();

  const context = await prisma.lesson.findUnique({
    where: { id },
    select: { slug: true, level: { select: { name: true } }, course: { select: { name: true, slug: true } } },
  });
  if (!context) notFound();
  const hidden = !lesson.isActive || !lesson.course.isActive;

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <p className="text-sm text-gray-600">
          {context.course.name} › {context.level.name}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{lesson.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <Link href={`/courses/${context.course.slug}/${context.slug}`} className="text-teal-800 underline">
            Mở bài học
          </Link>
          {hidden && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              Đang ẩn với người học
            </span>
          )}
        </p>
      </header>

      <ProposeEditSection targetType="LESSON" targetId={id} />
      <FlagsSection lessonId={id} courseId={lesson.courseId} />
      <HistorySection targetType="LESSON" targetId={id} />

      <section aria-labelledby="hub-discussion">
        <h2 id="hub-discussion" className="mb-3 text-lg font-semibold text-gray-900">
          Thảo luận
        </h2>
        <DiscussionThread targetType="LESSON" targetId={id} />
      </section>
    </div>
  );
}

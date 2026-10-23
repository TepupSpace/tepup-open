import { requireContributor } from '@/lib/admin-auth';
import Link from '@/components/ui/AppLink';
import SuggestionQueue from '@/components/review/SuggestionQueue';
import ReviewQueueList from '@/components/review/ReviewQueueList';
import { getReviewQueue } from '@/lib/services/review-queue-service';
import { courseScope } from '@/lib/permissions/course-roles';
import { CheckSquare } from 'lucide-react';
import type { UserRole } from '@prisma/client';
import ReviewSectionTabs from '@/components/contributor/ReviewSectionTabs';

export const metadata = { title: 'Duyệt nội dung' };

/**
 * Review queue for global reviewers (everything) and course roles (their courses only,
 * proposal §6.8). The same filtering runs in GET /api/contributor/reviews and, per item,
 * in the review detail routes (canViewContributionForReview / canDecideContribution).
 */
export default async function ReviewQueuePage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const session = await requireContributor();
  const viewer = { id: session.user.id, role: session.user.role as UserRole };
  const { course } = await searchParams;
  const courseFilter = typeof course === 'string' && course ? course : null;

  const [queue, suggestionScope] = await Promise.all([
    getReviewQueue(viewer, { courseId: courseFilter }),
    courseScope(viewer, 'ACCEPT_SUGGESTION'),
  ]);
  const showSuggestions = suggestionScope === null || suggestionScope.length > 0;

  if (queue.scope === 'NONE' && !showSuggestions) {
    return (
      <div>
        <ReviewSectionTabs viewer={viewer} current="/contributor/reviews" />
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Duyệt nội dung</h1>
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-700">Bạn chưa có nội dung nào để duyệt.</p>
          <p className="mt-2 text-sm text-gray-600">
            Khi quản trị viên giao cho bạn vai trò trưởng khóa học hoặc người duyệt tin cậy của một khóa học, các đề
            xuất cho khóa đó sẽ hiện ở đây.
          </p>
        </div>
      </div>
    );
  }

  const filteredCourseName = courseFilter
    ? queue.courses.find((c) => c.id === courseFilter)?.name ?? queue.items.find((i) => i.courseId === courseFilter)?.courseName
    : null;

  return (
    <div>
      <ReviewSectionTabs viewer={viewer} current="/contributor/reviews" />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Duyệt nội dung</h1>
        <span className="text-sm text-gray-600">{queue.items.filter((i) => !i.own).length} chờ bạn duyệt</span>
      </div>

      {queue.scope === 'COURSES' && (
        <p className="mb-4 text-sm text-gray-600">
          Bạn thấy các đề xuất cho những khóa học bạn phụ trách hoặc duyệt. Đề xuất của chính bạn do người khác duyệt.
        </p>
      )}

      {/* Course filter: course roles pick among their courses; global reviewers can clear a filter from a link. */}
      {(queue.courses.length > 1 || courseFilter) && (
        <nav aria-label="Lọc theo khóa học" className="mb-4">
          <ul className="flex flex-wrap gap-2 text-sm">
            <li>
              <Link
                href="/contributor/reviews"
                aria-current={!courseFilter ? 'page' : undefined}
                className="inline-block rounded-full border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50 aria-[current=page]:border-teal-700 aria-[current=page]:bg-teal-50 aria-[current=page]:text-teal-800 aria-[current=page]:font-medium"
              >
                Tất cả
              </Link>
            </li>
            {queue.courses.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contributor/reviews?course=${encodeURIComponent(c.id)}`}
                  aria-current={courseFilter === c.id ? 'page' : undefined}
                  className="inline-block rounded-full border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50 aria-[current=page]:border-teal-700 aria-[current=page]:bg-teal-50 aria-[current=page]:text-teal-800 aria-[current=page]:font-medium"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            {courseFilter && queue.courses.length === 0 && (
              <li className="px-3 py-1 text-teal-800 font-medium">{filteredCourseName ?? 'Một khóa học'}</li>
            )}
          </ul>
        </nav>
      )}

      {queue.scope !== 'NONE' && (
        <>
          <h2 className="sr-only">Đóng góp chờ duyệt</h2>
          <ReviewQueueList items={queue.items} variant="contributor" headingLevel={3} />
        </>
      )}
      {showSuggestions && <SuggestionQueue canEdit={session.user.role === 'ADMIN'} />}
    </div>
  );
}

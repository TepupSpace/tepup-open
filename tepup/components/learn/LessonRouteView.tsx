import Link from '@/components/ui/AppLink';
import LessonPlayer from '@/components/learn/LessonPlayer';
import type { LessonPage } from '@/lib/types/content';

/**
 * Phần thân chung của trang bài học: route công khai (ISR) và route staff
 * (`/staff-view/...`, proxy.ts rewrite tới cho người đã đăng nhập) render y hệt nhau.
 */
export default function LessonRouteView({
  data,
  isHidden = false,
}: {
  data: LessonPage;
  isHidden?: boolean;
}) {
  const exitHref = `/courses/${data.course.slug}`;

  const hiddenBadge = isHidden ? (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 shadow-md ring-1 ring-amber-300">
      Bài này đang ẩn — người học không thấy
    </div>
  ) : null;

  // No content authored yet. Say so — never invent placeholder lessons, which is
  // what previously made an unreachable lesson look like a real (fake) one.
  if (!data.content || data.content.blocks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        {hiddenBadge}
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{data.lesson.name}</h1>
          <p className="text-gray-500 mb-6">Bài học này chưa có nội dung.</p>
          <Link
            href={exitHref}
            className="inline-block px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Quay lại khoá học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {hiddenBadge}
      <LessonPlayer
        contentId={data.lesson.id}
        contentType="lesson"
        title={data.content.title || data.lesson.name}
        blocks={data.content.blocks}
        exitHref={exitHref}
      />
    </>
  );
}

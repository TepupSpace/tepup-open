import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getLessonPageForViewer } from '@/lib/services/content-service';
import LessonRouteView from '@/components/learn/LessonRouteView';

/**
 * Trang bài học cho người đã đăng nhập. proxy.ts rewrite `/courses/[slug]/[lessonSlug]`
 * tới đây khi request có cookie phiên, nên URL trên thanh địa chỉ không đổi.
 *
 * Reviewer/Admin xem được cả bài đang ẩn; contributor chỉ xem được bài ẩn trong khoá
 * do chính họ tạo. Người khác thấy đúng như trang công khai (bài ẩn → 404).
 * Mở thẳng `/staff-view/...` cũng an toàn: quyền được kiểm tra ở đây, không ở proxy.
 */
export const dynamic = 'force-dynamic';

interface StaffLessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

// getLessonPageForViewer không cache (kết quả tuỳ người xem); bọc cache() để
// generateMetadata và trang dùng chung một lượt query trong cùng request.
const loadLesson = cache(async (slug: string, lessonSlug: string) => {
  const session = await auth();
  const viewer = session?.user ? { id: session.user.id, role: session.user.role } : null;
  return getLessonPageForViewer(slug, lessonSlug, viewer);
});

// Tiêu đề riêng cho từng trang: trình thông báo route của Next chỉ đọc khi
// document.title đổi.
export async function generateMetadata({ params }: StaffLessonPageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const result = await loadLesson(slug, lessonSlug);
  const robots = { index: false, follow: false };
  if (!result) return { robots };
  return { title: `${result.page.lesson.name} — ${result.page.course.name} | Tepup`, robots };
}

export default async function StaffLessonRoute({ params }: StaffLessonPageProps) {
  const { slug, lessonSlug } = await params;

  const result = await loadLesson(slug, lessonSlug);
  if (!result) notFound();

  return <LessonRouteView data={result.page} isHidden={result.isHidden} />;
}

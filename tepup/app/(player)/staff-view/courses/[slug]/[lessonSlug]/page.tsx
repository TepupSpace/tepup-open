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

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface StaffLessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export default async function StaffLessonRoute({ params }: StaffLessonPageProps) {
  const { slug, lessonSlug } = await params;

  const session = await auth();
  const viewer = session?.user ? { id: session.user.id, role: session.user.role } : null;

  const result = await getLessonPageForViewer(slug, lessonSlug, viewer);
  if (!result) notFound();

  return <LessonRouteView data={result.page} isHidden={result.isHidden} />;
}

import { notFound } from 'next/navigation';
import { getLessonPage } from '@/lib/services/content-service';

/**
 * Bài học không tồn tại hoặc đang ẩn → HTTP 404 thật cho người học.
 *
 * `page.tsx` cũng gọi `notFound()`, nhưng nằm TRONG Suspense của `loading.tsx` cùng segment,
 * nên status 200 đã được gửi trước ("soft 404"). Layout nằm ngoài boundary đó.
 * `getLessonPage` được `cache()` gộp với lời gọi trong page, không tốn thêm query.
 *
 * Người đã đăng nhập không tới đây: proxy.ts rewrite sang `/staff-view/...` (route khác,
 * không qua layout này), nên staff vẫn xem được bài đang ẩn ở đúng URL này.
 */
export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  if (!(await getLessonPage(slug, lessonSlug))) notFound();
  return children;
}

import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/lib/services/content-service';

/**
 * Khoá không tồn tại hoặc đang ẩn → HTTP 404 thật.
 *
 * `page.tsx` cũng gọi `notFound()`, nhưng nó nằm TRONG Suspense của `loading.tsx` cùng
 * segment: tới lúc page chạy, Next đã gửi status 200 và chỉ vẽ trang 404 bên trong
 * ("soft 404", bị Google index và bị cache như trang thường). Layout nằm NGOÀI boundary đó,
 * nên `notFound()` ở đây xảy ra trước khi có byte nào được gửi và status là 404.
 *
 * Không tốn thêm query: `getCourseBySlug` được `cache()` gộp với lời gọi trong page.
 * Không đọc cookie/header, nên vẫn là ISR và an toàn với cache Cloudflare (CLAUDE.md, "Edge caching").
 */
export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getCourseBySlug(slug))) notFound();
  return children;
}

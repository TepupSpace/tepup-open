import { notFound } from 'next/navigation';
import { getLessonPage } from '@/lib/services/content-service';
import LessonRouteView from '@/components/learn/LessonRouteView';

// ISR. Trước đây `.next/prerender-manifest.json` có `dynamicRoutes: {}` — nghĩa là
// mọi route nội dung đều SSR lại từ đầu ở mỗi lượt xem, không hề có cache CDN.
// Người đầu tiên trả giá, những người sau ăn cache. An toàn vì các route này
// không đọc cookie/header, và admin lưu bài sẽ xoá cache ngay.
// Người đã đăng nhập không tới đây: proxy.ts rewrite họ sang /staff-view/... để
// người có quyền xem được cả bài đang ẩn ở đúng URL này.
export const revalidate = 300;

/**
 * Mảng rỗng = không prerender sẵn đường nào lúc build (nội dung nằm ở DB, không
 * muốn build phụ thuộc vào nó), nhưng vẫn ĐĂNG KÝ route này là ISR: lượt xem đầu
 * tiên render rồi được cache, những lượt sau ăn cache.
 *
 * Cần thiết vì `export const revalidate` một mình không đủ — không có hàm này thì
 * `prerender-manifest.json` để `dynamicRoutes: {}` và route SSR lại từ đầu ở mỗi
 * lượt xem, không có cache CDN nào.
 */
export async function generateStaticParams() {
  return [];
}



interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export default async function LessonRoute({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;

  const data = await getLessonPage(slug, lessonSlug);
  if (!data) notFound();

  return <LessonRouteView data={data} />;
}

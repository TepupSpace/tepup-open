import { notFound } from 'next/navigation';
import { getCharacterBySlug } from '@/lib/services/content-service';

/**
 * Nhân vật không tồn tại hoặc đang ẩn → HTTP 404 thật.
 *
 * `page.tsx` cũng gọi `notFound()`, nhưng nằm TRONG Suspense của `loading.tsx` cùng
 * segment, nên status 200 đã được gửi trước ("soft 404"). Layout nằm ngoài boundary
 * đó (cùng cách với app/(player)/courses/[slug]/[lessonSlug]/layout.tsx).
 * `getCharacterBySlug` đã cache (cùng key với generateMetadata), không tốn thêm query.
 * Bọc luôn cả /story/<nhân vật>/<câu chuyện>: trang đó vốn cũng 404 khi nhân vật ẩn.
 */
export default async function CharacterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = await params;
  if (!(await getCharacterBySlug(characterId))) notFound();
  return children;
}

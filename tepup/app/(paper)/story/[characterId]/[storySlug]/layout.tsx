import { notFound } from 'next/navigation';
import { getStoryBySlug } from '@/lib/services/content-service';

/**
 * Câu chuyện không tồn tại, đang ẩn, hoặc không thuộc nhân vật trong URL → HTTP 404 thật.
 *
 * `page.tsx` cũng gọi `notFound()`, nhưng nằm TRONG Suspense của `loading.tsx` cùng segment,
 * nên status 200 đã được gửi trước ("soft 404"). Layout nằm ngoài boundary đó.
 * `getStoryBySlug` được cache (unstable_cache), gọi lại trong page không tốn thêm query.
 * Không đọc cookie/header: trang được cache công khai.
 */
export default async function StoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ characterId: string; storySlug: string }>;
}) {
  const { characterId, storySlug } = await params;
  const story = await getStoryBySlug(storySlug);
  if (!story || story.characterId !== characterId) notFound();
  return children;
}

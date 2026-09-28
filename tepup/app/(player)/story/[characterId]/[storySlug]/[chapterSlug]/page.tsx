import { notFound } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import { getChapterPage } from '@/lib/services/content-service';
import LessonPlayer from '@/components/learn/LessonPlayer';

// ISR. Trước đây `.next/prerender-manifest.json` có `dynamicRoutes: {}` — nghĩa là
// mọi route nội dung đều SSR lại từ đầu ở mỗi lượt xem, không hề có cache CDN.
// Người đầu tiên trả giá, những người sau ăn cache. An toàn vì các route này
// không đọc cookie/header, và admin lưu bài sẽ xoá cache ngay.
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



interface ChapterPageProps {
  params: Promise<{ characterId: string; storySlug: string; chapterSlug: string }>;
}

export default async function ChapterRoute({ params }: ChapterPageProps) {
  const { characterId, storySlug, chapterSlug } = await params;

  const data = await getChapterPage(characterId, storySlug, chapterSlug);
  if (!data) notFound();

  const exitHref = `/story/${data.story.characterId}/${data.story.slug}`;

  if (!data.content || data.content.blocks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{data.chapter.title}</h1>
          <p className="text-gray-500 mb-6">Chương này chưa có nội dung.</p>
          <Link
            href={exitHref}
            className="inline-block px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Quay lại câu chuyện
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LessonPlayer
      contentId={data.chapter.id}
      contentType="chapter"
      title={data.content.title || data.chapter.title}
      blocks={data.content.blocks}
      exitHref={exitHref}
    />
  );
}

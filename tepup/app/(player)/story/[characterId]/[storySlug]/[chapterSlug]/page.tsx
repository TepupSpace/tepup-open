import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getChapterPage } from '@/lib/services/content-service';
import LessonPlayer from '@/components/learn/LessonPlayer';
import PaperEmptyState from '@/components/learn/PaperEmptyState';
import { tvReferencesEnabled } from '@/lib/library/flags';
import { itemAfter } from '@/lib/utils/next-item';

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

// Tiêu đề riêng cho từng trang: trình thông báo route của Next chỉ đọc khi
// document.title đổi. Hàm lấy dữ liệu đã được cache nên không tốn thêm query.
export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { characterId, storySlug, chapterSlug } = await params;
  const data = await getChapterPage(characterId, storySlug, chapterSlug);
  return data ? { title: `${data.chapter.title} — ${data.story.title} | Tepup` } : {};
}

export default async function ChapterRoute({ params }: ChapterPageProps) {
  const { characterId, storySlug, chapterSlug } = await params;

  const data = await getChapterPage(characterId, storySlug, chapterSlug);
  if (!data) notFound();

  const exitHref = `/story/${data.story.characterId}/${data.story.slug}`;

  if (!data.content || data.content.blocks.length === 0) {
    return (
      <PaperEmptyState
        title={data.chapter.title}
        message="Chương này chưa có nội dung."
        backHref={exitHref}
        backLabel="Quay lại câu chuyện"
      />
    );
  }

  // Chương kế tiếp, kể cả sang phần sau; trang đã có đủ thứ tự các phần và chương.
  const nextChapter = itemAfter(data.story.parts.flatMap((p) => p.chapters), data.chapter.id);

  return (
    <LessonPlayer
      contentId={data.chapter.id}
      contentType="chapter"
      title={data.content.title || data.chapter.title}
      blocks={data.content.blocks}
      exitHref={exitHref}
      next={nextChapter ? { href: `${exitHref}/${nextChapter.slug}`, title: nextChapter.title } : null}
      references={tvReferencesEnabled()}
    />
  );
}

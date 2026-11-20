import BackButton from '@/components/BackButton';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CharacterStories from '@/components/paper/CharacterStories';
import { toBookCharacters, type BookTopic } from '@/components/paper/book-data';
import { getCharacterBySlug, getCharacters, getStoryTeasers } from '@/lib/services/content-service';

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

interface StoryPageProps {
  params: Promise<{ characterId: string }>;
}

// Tiêu đề riêng cho từng trang: trình thông báo route của Next chỉ đọc khi
// document.title đổi. Hàm lấy dữ liệu đã được cache nên không tốn thêm query.
// (Đổi nhân vật ngay trên sổ thì CharacterStories tự đặt document.title cùng mẫu.)
export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { characterId } = await params;
  const character = await getCharacterBySlug(characterId);
  return character ? { title: `Câu chuyện của ${character.name} | Tepup` } : {};
}

/**
 * Câu chuyện của một nhân vật (demo-course-stories màn 2): sổ tem + thẻ câu chuyện.
 *
 * Nạp sẵn danh sách câu chuyện của MỌI nhân vật (2 query đã cache, vài chục dòng)
 * để đổi nhân vật trên sổ ngay tại chỗ, không điều hướng: xem CharacterStories.
 * HTML giống nhau cho mọi người xem → cache công khai an toàn.
 */
export default async function StoryPage({ params }: StoryPageProps) {
  const { characterId } = await params;
  const [characters, teasers] = await Promise.all([getCharacters(), getStoryTeasers()]);

  const index = characters.findIndex((c) => c.slug === characterId);
  // layout.tsx đã trả 404 thật; đây chỉ là chốt phòng hờ.
  if (index < 0) notFound();

  const topics: Record<string, BookTopic[]> = {};
  for (const t of teasers) {
    (topics[t.characterSlug] ??= []).push({ slug: t.slug, title: t.title, teaser: t.teaser });
  }

  return (
    <>
    <div className="paper-backrow">
      <BackButton variant="paper" fallbackUrl="/courses" label="Khoá học" />
    </div>
    <main id="main-content" className="paper-shell sb-story">
      <CharacterStories characters={toBookCharacters(characters)} topics={topics} initialIndex={index} />
    </main>
    </>
  );
}

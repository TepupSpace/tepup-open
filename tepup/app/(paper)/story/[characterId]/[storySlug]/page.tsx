import BackButton from '@/components/BackButton';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import ChapterShelf, { type ShelfChapter } from '@/components/paper/ChapterShelf';
import { getCharacterBySlug, getStoryBySlug, getCoursesByStory } from '@/lib/services/content-service';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';

// ISR: route không đọc cookie/header/searchParams, admin lưu bài sẽ xoá cache ngay.
export const revalidate = 300;

/**
 * Mảng rỗng = không prerender sẵn lúc build, nhưng vẫn ĐĂNG KÝ route là ISR (không có
 * hàm này thì `export const revalidate` một mình không đủ để có cache).
 */
export async function generateStaticParams() {
  return [];
}

interface StoryDetailPageProps {
  params: Promise<{ characterId: string; storySlug: string }>;
}

// Tiêu đề riêng cho từng trang: trình thông báo route của Next chỉ đọc khi
// document.title đổi. Hàm lấy dữ liệu đã được cache nên không tốn thêm query.
export async function generateMetadata({ params }: StoryDetailPageProps): Promise<Metadata> {
  const { characterId, storySlug } = await params;
  const story = await getStoryBySlug(storySlug);
  if (!story || story.characterId !== characterId) return {};
  return { title: `${story.title} | Tepup` };
}

/**
 * Trang chi tiết câu chuyện (demo-course-stories, màn 3): kệ folder các chương +
 * "Khoá học liên quan". Server render dữ liệu giống nhau cho mọi người; trạng thái
 * học (Học ngay / Nhảy cóc / Hoàn thành) do ChapterShelf tính ở client từ localStorage.
 */
export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { characterId, storySlug } = await params;

  const [character, story, relatedCourses] = await Promise.all([
    getCharacterBySlug(characterId),
    getStoryBySlug(storySlug),
    getCoursesByStory(storySlug),
  ]);

  if (!character || !story || story.characterId !== characterId) {
    notFound();
  }

  const chapters: ShelfChapter[] = story.parts.flatMap((part) =>
    part.chapters.map((c) => ({ id: c.id, slug: c.slug, title: c.title, partName: part.name })),
  );

  // Khoá liên quan: bảng CourseStoryRecommendation (admin sửa được).
  const courses = relatedCourses.filter(Boolean);

  return (
    <>
    <div className="paper-backrow">
      <BackButton variant="paper" fallbackUrl={`/story/${character.slug}`} label={`Câu chuyện của ${character.name}`} />
    </div>
    <ChapterShelf
      characterSlug={character.slug}
      storySlug={story.slug}
      title={story.title}
      teaser={story.teaser}
      estimatedTime={story.estimatedTime}
      chapters={chapters}
    >
      {courses.length > 0 && (
        <section className="lesson__related" aria-labelledby="lesson-related-title">
          <h2 id="lesson-related-title">
            {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh 28px */}
            <img src="/paper/lesson-icon-related.svg" alt="" width={28} height={28} />
            Khoá học liên quan
          </h2>
          <ul className="lesson__courses">
            {courses.map((course) => (
              <li key={course.slug}>
                <Link href={`/courses/${course.slug}`}>
                  <div className="lcourse">
                    {isAllowedMediaUrl(course.imageUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element -- ảnh bìa từ Supabase Storage (đã qua isAllowedMediaUrl)
                      <img className="lcourse__img" src={course.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="lcourse__img" aria-hidden="true" />
                    )}
                    <div className="lcourse__body">
                      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh thân folder tĩnh */}
                      <img src="/paper/folder-blue.webp" alt="" />
                      <span className="lcourse__title paper-serif">{course.name}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ChapterShelf>
    </>
  );
}

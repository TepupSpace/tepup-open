import Link from '@/components/ui/AppLink';
import { ChevronRight } from 'lucide-react';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import { getStoriesByCourse, getCharactersBySlugs } from '@/lib/services/content-service';

/**
 * Ô "Câu chuyện liên quan" của trang chi tiết khoá học.
 *
 * Tách riêng để bọc được trong <Suspense>. Phần này cần thêm một vòng query nhân
 * vật nối đuôi sau khi biết danh sách truyện; để nguyên trong trang thì cả trang
 * phải chờ vòng đó, dù đây chỉ là nội dung bổ trợ nằm dưới lộ trình học.
 */

function SectionHeading() {
  return (
    // h2: cùng cấp với các chương của lộ trình học, đều ngay dưới h1 tên khoá
    <h2 id="cp-related-title" className="cp-card__title paper-serif">
      {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh 28px */}
      <img src="/paper/lesson-icon-related.svg" alt="" width={28} height={28} />
      Câu chuyện liên quan
    </h2>
  );
}

/** Giữ chỗ đúng khung để lúc nội dung về không đẩy phần dưới nhảy xuống. */
export function RelatedStoriesSkeleton() {
  return (
    <section className="cp-card" aria-labelledby="cp-related-title">
      <SectionHeading />
      <ul className="cp-stories" aria-hidden="true">
        {Array.from({ length: 2 }).map((_, i) => (
          <li key={i} className="cp-story cp-story--ghost">
            <span className="cp-story__avatar animate-pulse" />
            <span className="cp-story__text">
              <span className="block h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
              <span className="mt-2 block h-3 w-1/3 rounded bg-gray-200 animate-pulse" />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function RelatedStories({ courseSlug }: { courseSlug: string }) {
  const relatedStories = await getStoriesByCourse(courseSlug);
  if (relatedStories.length === 0) return null;

  const uniqueCharacterSlugs = [...new Set(relatedStories.map((s) => s.characterId))];
  const characters = await getCharactersBySlugs(uniqueCharacterSlugs);
  const charactersMap = new Map(characters.map((c) => [c.slug, c]));

  return (
    <section className="cp-card" aria-labelledby="cp-related-title">
      <SectionHeading />
      <ul className="cp-stories">
        {relatedStories.map((story) => {
          const character = charactersMap.get(story.characterId);
          if (!character) return null;
          // Ảnh nhân vật chỉ từ host cho phép (không lộ IP người học); không có thì chữ cái đầu.
          const avatar = isAllowedMediaUrl(character.avatarUrl) ? character.avatarUrl : null;

          return (
            <li key={story.slug}>
              <Link href={`/story/${character.slug}/${story.slug}`} className="cp-story">
                <span className="cp-story__avatar" aria-hidden="true">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- ảnh nhân vật nhỏ từ Supabase Storage (đã qua isAllowedMediaUrl)
                    <img src={avatar} alt="" loading="lazy" />
                  ) : (
                    character.name.charAt(0)
                  )}
                </span>
                <span className="cp-story__text">
                  <span className="cp-story__title">{story.title}</span>
                  <span className="cp-story__by">Câu chuyện của {character.name}</span>
                </span>
                <ChevronRight className="cp-story__arrow" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

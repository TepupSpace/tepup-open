import Link from '@/components/ui/AppLink';
import { Headphones, GraduationCap, Briefcase, Store } from 'lucide-react';
import { getStoriesByCourse, getCharactersBySlugs } from '@/lib/services/content-service';

/**
 * Ô "Câu chuyện liên quan" của trang chi tiết khoá học.
 *
 * Tách riêng để bọc được trong <Suspense>. Phần này cần thêm một vòng query nhân
 * vật nối đuôi sau khi biết danh sách truyện; để nguyên trong trang thì cả trang
 * phải chờ vòng đó, dù đây chỉ là nội dung bổ trợ nằm dưới lộ trình học.
 */

const characterIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'store': Store,
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  'text-teal-600': { bg: 'bg-teal-50', text: 'text-teal-600', border: 'hover:border-teal-300' },
  'text-blue-600': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-300' },
  'text-orange-600': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'hover:border-orange-300' },
};

function SectionHeading() {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Headphones className="w-4 h-4 text-purple-500" />
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Câu chuyện liên quan
      </h3>
    </div>
  );
}

/** Giữ chỗ đúng khung để lúc nội dung về không đẩy phần dưới nhảy xuống. */
export function RelatedStoriesSkeleton() {
  return (
    <div className="lg:col-span-1">
      <SectionHeading />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white"
            aria-hidden="true"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function RelatedStories({ courseSlug }: { courseSlug: string }) {
  const relatedStories = await getStoriesByCourse(courseSlug);
  if (relatedStories.length === 0) return null;

  const uniqueCharacterSlugs = [...new Set(relatedStories.map((s) => s.characterId))];
  const characters = await getCharactersBySlugs(uniqueCharacterSlugs);
  const charactersMap = new Map(characters.map((c) => [c.slug, c]));

  return (
    <div className="lg:col-span-1">
      <SectionHeading />
      <div className="space-y-3">
        {relatedStories.map((story) => {
          const character = charactersMap.get(story.characterId);
          if (!character) return null;

          const CharacterIcon = characterIconMap[character.icon] || GraduationCap;
          const colors = colorClasses[character.color] || colorClasses['text-blue-600'];

          return (
            <Link
              key={story.slug}
              href={`/story/${character.slug}/${story.slug}`}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 ${colors.border} bg-white transition-all hover:shadow-md group`}
            >
              <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                <CharacterIcon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors truncate">
                  {story.title}
                </p>
                <p className="text-sm text-gray-500">của {character.name}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

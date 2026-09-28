import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import StoryCard from '@/components/StoryCard';
import { getCharacterBySlug, getStoriesByCharacter } from '@/lib/services/content-service';
import { GraduationCap, Briefcase, Store, Headphones } from 'lucide-react';

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



const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'store': Store,
};

interface StoryPageProps {
  params: Promise<{ characterId: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { characterId } = await params;
  const [character, characterStories] = await Promise.all([
    getCharacterBySlug(characterId),
    getStoriesByCharacter(characterId),
  ]);

  if (!character) {
    notFound();
  }

  const IconComponent = iconMap[character.icon] || GraduationCap;

  // Color mapping
  const colorClasses: Record<string, { bg: string; text: string; iconBg: string; gradientFrom: string; gradientTo: string }> = {
    'text-teal-600': {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      iconBg: 'bg-teal-100',
      gradientFrom: 'from-teal-500',
      gradientTo: 'to-emerald-500',
    },
    'text-blue-600': {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-500',
    },
    'text-orange-600': {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-amber-500',
    },
  };

  const colors = colorClasses[character.color] || colorClasses['text-blue-600'];

  return (
    <div className="bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <BackButton fallbackUrl="/courses" />

        {/* Character Hero */}
        <div className={`${colors.bg} rounded-3xl p-8 mb-8`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div
              className={`
                w-24 h-24 rounded-3xl bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}
                flex items-center justify-center shadow-lg
              `}
            >
              <IconComponent className="w-12 h-12 text-white" />
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{character.name}</h1>
              <p className={`text-lg font-medium ${colors.text} mb-3`}>{character.role}</p>
              <p className="text-gray-600 text-lg max-w-xl">
                "{character.description}"
              </p>
            </div>
          </div>
        </div>

        {/* Stories Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
              <Headphones className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Lắng nghe câu chuyện của {character.name}</h2>
              <p className="text-gray-500 text-sm">Khám phá kiến thức qua những trải nghiệm thực tế</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characterStories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

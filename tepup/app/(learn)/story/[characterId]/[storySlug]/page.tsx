import { notFound } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import BackButton from '@/components/BackButton';
import ChapterPath from '@/components/ChapterPath';
import { getCharacterBySlug, getStoryBySlug, getCoursesByStory } from '@/lib/services/content-service';
import {
  Receipt,
  TrendingUp,
  PiggyBank,
  Store,
  BookOpen,
  Clock,
  BookMarked,
  Lightbulb,
  Binary,
  Building,
  PieChart,
  Scale,
  Coins,
} from 'lucide-react';

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


const storyIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'receipt': Receipt,
  'trending-up': TrendingUp,
  'piggy-bank': PiggyBank,
  'store': Store,
  'book-open': BookOpen,
};

const courseIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'lightbulb': Lightbulb,
  'binary': Binary,
  'receipt': Receipt,
  'building': Building,
  'pie-chart': PieChart,
  'book-open': BookOpen,
  'scale': Scale,
  'coins': Coins,
};

interface StoryDetailPageProps {
  params: Promise<{ characterId: string; storySlug: string }>;
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { characterId, storySlug } = await params;

  // Cả ba query đều chỉ phụ thuộc vào tham số URL, nên đi cùng một lượt. Trước
  // đây `getCoursesByStory` xếp sau chốt 404 và tốn thêm một vòng round-trip —
  // đắt hơn nhiều so với việc thi thoảng chạy thừa một query trên đường 404.
  const [character, story, relatedCourses] = await Promise.all([
    getCharacterBySlug(characterId),
    getStoryBySlug(storySlug),
    getCoursesByStory(storySlug),
  ]);

  if (!character || !story || story.characterId !== characterId) {
    notFound();
  }

  const IconComponent = storyIconMap[story.icon] || BookOpen;

  // Related courses come from the CourseStoryRecommendation join table — the same
  // table the admin UI edits. Previously this read a denormalized array of course
  // slugs, so admin edits never showed up here.
  const validRelatedCourses = relatedCourses;

  // Color mapping
  const colorClasses: Record<string, { bg: string; text: string; iconBg: string; gradientFrom: string; gradientTo: string; badge: string; border: string }> = {
    'text-teal-600': {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      iconBg: 'bg-teal-100',
      gradientFrom: 'from-teal-500',
      gradientTo: 'to-emerald-500',
      badge: 'bg-teal-100 text-teal-700',
      border: 'hover:border-teal-300',
    },
    'text-blue-600': {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-500',
      badge: 'bg-blue-100 text-blue-700',
      border: 'hover:border-blue-300',
    },
    'text-orange-600': {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-amber-500',
      badge: 'bg-orange-100 text-orange-700',
      border: 'hover:border-orange-300',
    },
  };

  const colors = colorClasses[character.color] || colorClasses['text-blue-600'];

  return (
    <div className="bg-gray-50">

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <BackButton fallbackUrl={`/story/${characterId}`} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Story Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              {/* Story Icon */}
              <div
                className={`
                  w-24 h-24 rounded-2xl bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}
                  flex items-center justify-center mb-4 shadow-lg
                `}
              >
                <IconComponent className="w-12 h-12 text-white" />
              </div>

              {/* Character Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.badge} text-sm font-medium mb-3`}>
                <span>Câu chuyện của {character.name}</span>
              </div>

              {/* Story Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {story.title}
              </h1>

              {/* Story Teaser */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                "{story.teaser}"
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5" />
                  <span>{story.chaptersCount} Chương</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{story.estimatedTime}</span>
                </div>
              </div>
            </div>

            {/* Related Courses */}
            {validRelatedCourses.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Khoá học liên quan
                  </h3>
                </div>
                <div className="space-y-3">
                  {validRelatedCourses.map((course) => {
                    if (!course) return null;
                    const CourseIcon = courseIconMap[course.icon] || BookOpen;
                    return (
                      <Link
                        key={course.slug}
                        href={`/courses/${course.slug}`}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 ${colors.border} bg-white transition-all hover:shadow-md group`}
                      >
                        <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                          <CourseIcon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                            {course.name}
                          </p>
                          <p className="text-sm text-gray-500">{course.lessonsCount} bài học</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Chapter Path */}
          <div className="lg:col-span-2">
            <ChapterPath
              parts={story.parts}
              characterSlug={character.slug}
              storySlug={story.slug}
              colorClass={character.color}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

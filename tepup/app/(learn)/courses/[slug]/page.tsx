import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import BackButton from '@/components/BackButton';
import LearningPath from '@/components/LearningPath';
import { getCourseBySlug } from '@/lib/services/content-service';
import RelatedStories, { RelatedStoriesSkeleton } from '@/components/RelatedStories';
import {
  Lightbulb,
  Binary,
  Receipt,
  Building,
  PieChart,
  BookOpen,
  Scale,
  Coins,
  GraduationCap,
  Headphones,
  Store,
  Briefcase,
  Landmark,
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


const characterIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'store': Store,
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  binary: Binary,
  receipt: Receipt,
  building: Building,
  'pie-chart': PieChart,
  'book-open': BookOpen,
  scale: Scale,
  coins: Coins,
  landmark: Landmark,
};

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  // Chỉ chờ đúng thứ dựng nên nửa trên màn hình. Truyện liên quan nằm dưới lộ
  // trình học và cần thêm một vòng query nhân vật, nên để nó stream vào sau.
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const IconComponent = iconMap[course.icon] || BookOpen;

  return (
    <div className="bg-gray-50">
      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <BackButton fallbackUrl="/courses" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-1">
            {/* Dính vào chỗ chỉ có ý nghĩa khi bên cạnh là cột lộ trình học; trên
                mobile nó nằm trên cùng và sẽ ăn mất một phần màn hình khi cuộn. */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24">
              {/* Course Icon */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <IconComponent className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />
              </div>

              {/* Course Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {course.name}
              </h1>

              {/* Course Description */}
              <p className="text-gray-600 mb-6">{course.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>{course.lessonsCount} Bài học</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Learning Path */}
          <div className="lg:col-span-2">
            <LearningPath levels={course.levels} courseSlug={course.slug} />
          </div>

          {/* Câu chuyện liên quan là phần bổ trợ, nên tách thành ô lưới riêng đặt
              sau lộ trình học. Khi nằm chung cột trái, trên mobile nó chen vào giữa
              phần giới thiệu và danh sách bài, đẩy bài học xuống dưới màn hình đầu. */}
          <Suspense fallback={<RelatedStoriesSkeleton />}>
            <RelatedStories courseSlug={slug} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

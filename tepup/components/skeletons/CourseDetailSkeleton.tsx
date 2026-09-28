import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/**
 * Khung `/courses/[slug]`. Cột trái là thẻ giới thiệu khoá, cột phải là lộ trình
 * học — các node so le đúng như `LearningPath` để không bị giật khi đổi.
 */
export default function CourseDetailSkeleton() {
  return (
    <div className="bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-5 w-24 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
              <Skeleton className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl mb-4" />
              <Skeleton className="h-8 w-3/4 mb-3" />
              <SkeletonText lines={2} className="mb-6" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>

          <div className="lg:col-span-2">
            <Skeleton className="h-7 w-40 mb-6" />
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={i % 2 === 0 ? '' : 'translate-x-8 sm:translate-x-16'}
                >
                  <Skeleton className="w-16 h-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

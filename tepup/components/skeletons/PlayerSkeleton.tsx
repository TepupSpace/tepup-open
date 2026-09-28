import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/**
 * Khung của `LessonPlayer` trong lúc chờ nội dung bài.
 *
 * Dựng đúng ba tầng của trang thật (header dính, thân cuộn, chân trang dính) để
 * khi nội dung về thì chỉ có phần giữa được điền vào, không có cú nhảy layout.
 */
export default function PlayerSkeleton() {
  return (
    <div className="min-h-screen-dvh bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 pt-safe">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 ml-2 mr-1 sm:mx-8">
            <div className="h-2 bg-gray-100 rounded-full" />
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-3/4 mb-6" />
          <SkeletonText lines={4} className="mb-8" />
          <Skeleton className="h-48 w-full rounded-2xl mb-8" />
          <SkeletonText lines={3} />
        </div>
      </main>

      <footer className="sticky bottom-0 z-40 bg-white border-t border-gray-100 px-4 pt-4 pb-safe-4">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </footer>
    </div>
  );
}

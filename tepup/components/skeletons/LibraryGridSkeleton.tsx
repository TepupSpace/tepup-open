import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/** Khung `/library`: tiêu đề, hàng bộ lọc, rồi lưới thẻ tài liệu. */
export default function LibraryGridSkeleton() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-80 mb-8" />

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-full sm:w-48 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-5">
            <Skeleton className="h-5 w-3/4 mb-3" />
            <SkeletonText lines={2} className="mb-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </main>
  );
}

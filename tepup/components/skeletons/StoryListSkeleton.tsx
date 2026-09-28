import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/Skeleton';

/** Khung trang nhân vật `/story/[characterId]`: hero rồi lưới thẻ truyện. */
export default function StoryListSkeleton() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-5 w-24 mb-6" />

      <div className="rounded-3xl border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <SkeletonCircle className="w-20 h-20" />
          <div className="flex-1">
            <Skeleton className="h-8 w-1/2 mb-3" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
        <SkeletonText lines={2} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-6">
            <Skeleton className="h-6 w-2/3 mb-3" />
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </main>
  );
}

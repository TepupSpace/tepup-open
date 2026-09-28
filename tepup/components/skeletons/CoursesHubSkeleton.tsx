import { Skeleton, SkeletonCircle } from '@/components/ui/Skeleton';

/**
 * Khung trang `/courses` theo bố cục giấy: tiêu đề giữa, khối nhân vật, rồi các
 * kệ thẻ khoá học. Dùng lại class của courses-hub.css để khớp kích thước thật.
 */
export default function CoursesHubSkeleton() {
  return (
    <main className="ch-main" aria-busy="true">
      <div className="ch-pagehead">
        <Skeleton className="h-14 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-72 mx-auto" />
      </div>

      <div className="ch-shell ch-sections">
        <div className="ch-skel-story">
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-5 w-96 max-w-full mb-6" />
          <div className="ch-skel-panel">
            <div className="ch-cast">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonCircle className="w-[70px] h-[70px] shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-20 mb-2" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s} className="flex flex-col items-center gap-7">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-[32rem] max-w-full" />
            <div className="flex flex-wrap justify-center gap-9">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-[220px] h-[280px] rounded-[20px]!" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

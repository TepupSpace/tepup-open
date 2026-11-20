import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/**
 * Khung `/courses/[slug]` (giao diện giấy, app/(paper)/courses/[slug]/course.css): cột trái
 * folder bìa + giới thiệu, cột phải các thẻ chương với hàng bài học — khớp LearningPath
 * để không bị giật khi nội dung về.
 */
export default function CourseDetailSkeleton() {
  return (
    <>
      <div className="paper-backrow">
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <main className="cp" aria-busy="true">
        <div className="cp-side">
          <div className="cp-cover">
            <Skeleton className="w-[220px] h-[289px] rounded-3xl" />
          </div>
          <div className="cp-info">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-9 w-3/4 mb-3" />
            <SkeletonText lines={3} className="mb-4" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <div className="cp-main">
          <div className="cp-level">
            <div className="cp-level__head">
              <Skeleton className="h-4 w-20 mx-auto mb-2" />
              <Skeleton className="h-7 w-2/3 mx-auto" />
            </div>
            <ol className="cp-nodes" aria-hidden="true">
              {[0, -1, 0, 1].map((x, j) => (
                <li key={j} style={{ ['--x' as string]: x }}>
                  <div className="flex items-center gap-6">
                    <Skeleton className="w-[88px] h-20 rounded-full" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </main>
    </>
  );
}

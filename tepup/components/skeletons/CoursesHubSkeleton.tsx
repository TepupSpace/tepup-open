import { Skeleton } from '@/components/ui/Skeleton';
import StoryBookSkeleton from './StoryBookSkeleton';

/**
 * Khung trang `/courses` theo bố cục giấy: tiêu đề giữa, sổ tem nhân vật, rồi khối
 * "Học qua Chuyên đề" với từng nhóm (nhãn nhỏ + dải thẻ). Dùng lại class của courses-hub.css để khớp kích thước thật.
 */
export default function CoursesHubSkeleton() {
  return (
    <main className="ch-main" aria-busy="true">
      <div className="ch-shell ch-sections">
        <div className="sb-stories">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-10 w-80 max-w-full" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
          <StoryBookSkeleton />
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
          {Array.from({ length: 2 }).map((_, g) => (
            <div key={g} className="flex flex-col gap-3.5">
              <Skeleton className="h-[55px] w-80 max-w-full rounded-[14px]!" />
              <div className="flex flex-wrap justify-center gap-9">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-[220px] h-[280px] rounded-[20px]!" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

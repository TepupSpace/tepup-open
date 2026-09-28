/**
 * Khung xám chờ nội dung.
 *
 * Dùng `animate-pulse` của Tailwind — khối `prefers-reduced-motion` toàn cục ở
 * cuối `app/globals.css` đã tắt sẵn animation này cho người bật giảm chuyển động,
 * nên không cần khai báo keyframe riêng.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} aria-hidden="true" />;
}

export function SkeletonCircle({ className = 'w-12 h-12' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-full bg-gray-200 ${className}`} aria-hidden="true" />;
}

/**
 * Nhiều dòng chữ giả. Dòng cuối ngắn lại để trông giống đoạn văn thật chứ không
 * phải một khối chữ nhật đặc.
 */
export function SkeletonText({ lines = 3, className = '' }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded bg-gray-200 h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`rounded-2xl border border-gray-100 p-5 ${className}`} aria-hidden="true">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle className="w-10 h-10" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export default Skeleton;

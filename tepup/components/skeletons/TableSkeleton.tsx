import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Khung bảng dùng chung cho admin và contributor. Cả hai khu vực đều là danh sách
 * dạng bảng nên một khung là đủ, không cần dựng riêng cho từng trang con.
 */
export default function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-5 py-3">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <Skeleton className="h-4 flex-1 max-w-sm" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

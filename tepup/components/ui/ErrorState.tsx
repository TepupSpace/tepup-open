'use client';

/**
 * Màn báo lỗi dùng chung cho các `error.tsx`.
 *
 * Trước đây khi query hỏng, người dùng chỉ thấy trang đứng im rồi màn trắng của
 * Next. Thà báo lỗi nhanh kèm nút thử lại còn hơn để họ ngồi đoán.
 */

import { useEffect } from 'react';
import Link from '@/components/ui/AppLink';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  /** Lối thoát khi thử lại vẫn không ăn thua. */
  homeHref?: string;
  homeLabel?: string;
}

export default function ErrorState({
  error,
  reset,
  title = 'Đã có lỗi xảy ra',
  homeHref = '/courses',
  homeLabel = 'Về trang khoá học',
}: ErrorStateProps) {
  // Giữ lại trong log runtime — `digest` là thứ duy nhất nối màn hình này với
  // dòng log tương ứng ở phía server.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 mb-6">
          Chưa tải được nội dung này. Bạn thử lại giúp nhé — nếu vẫn lỗi thì quay lại sau ít phút.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors active:scale-[0.98]"
          >
            Thử lại
          </button>
          <Link
            href={homeHref}
            className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            {homeLabel}
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">Mã lỗi: {error.digest}</p>
        )}
      </div>
    </div>
  );
}

'use client';

/**
 * Chốt chặn cuối: lỗi xảy ra ngay trong root layout thì các `error.tsx` khác
 * không kịp render, nên file này phải tự dựng cả <html> và <body>.
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="antialiased bg-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Đã có lỗi xảy ra</h1>
            <p className="text-gray-500 mb-6">
              Trang gặp sự cố ngoài dự kiến. Bạn thử tải lại giúp nhé.
            </p>
            <button
              onClick={reset}
              className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Tải lại
            </button>
            {error.digest && <p className="mt-6 text-xs text-gray-400">Mã lỗi: {error.digest}</p>}
          </div>
        </div>
      </body>
    </html>
  );
}

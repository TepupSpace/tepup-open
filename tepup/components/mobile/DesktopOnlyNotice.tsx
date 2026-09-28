'use client';

import { useState } from 'react';
import { Monitor } from 'lucide-react';

/**
 * Chắn khu quản trị và khu đóng góp trên màn hình hẹp.
 *
 * Hai khu này cố ý không được làm giao diện mobile: trình soạn thảo nội dung dựa
 * trên BlockNote và Sandpack vốn không thiết kế cho cảm ứng, mà công sức chuyển
 * đổi thì lớn còn nhu cầu soạn bài trên điện thoại gần như không có.
 *
 * Vẫn để lối đi tiếp, vì đôi khi chỉ cần liếc nhanh một trang.
 */
export default function DesktopOnlyNotice() {
  const [bypassed, setBypassed] = useState(false);

  if (bypassed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white p-6 lg:hidden">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <Monitor className="h-7 w-7 text-gray-500" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">Hãy dùng máy tính</h1>
        <p className="mt-2 text-sm text-gray-600">
          Khu quản trị được thiết kế cho màn hình lớn. Trình soạn nội dung cần chuột
          và bàn phím nên trên điện thoại sẽ rất khó thao tác.
        </p>
        <button
          onClick={() => setBypassed(true)}
          className="mt-6 text-sm font-medium text-gray-500 underline underline-offset-4 hover:text-gray-700"
        >
          Vẫn xem trên điện thoại
        </button>
      </div>
    </div>
  );
}

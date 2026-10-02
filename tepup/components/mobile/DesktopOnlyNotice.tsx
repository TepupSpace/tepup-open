'use client';

import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

/**
 * Chắn khu quản trị và khu đóng góp trên màn hình hẹp.
 *
 * Hai khu này cố ý không được làm giao diện mobile: trình soạn thảo nội dung dựa
 * trên BlockNote và Sandpack vốn không thiết kế cho cảm ứng, mà công sức chuyển
 * đổi thì lớn còn nhu cầu soạn bài trên điện thoại gần như không có.
 *
 * Vẫn để lối đi tiếp, vì đôi khi chỉ cần liếc nhanh một trang. Lựa chọn "Vẫn xem"
 * được nhớ trong phiên (sessionStorage), để không hỏi lại sau mỗi lần tải trang.
 */
const BYPASS_KEY = 'tepup:desktop-notice-bypassed';

const COPY = {
  admin: 'Khu quản trị được thiết kế cho màn hình lớn. Trình soạn nội dung cần chuột và bàn phím nên trên điện thoại sẽ rất khó thao tác.',
  contributor:
    'Khu đóng góp được thiết kế cho màn hình lớn. Trên điện thoại bạn vẫn xem được bản nháp, trạng thái duyệt và góp ý, nhưng soạn bài cần chuột và bàn phím nên sẽ rất khó thao tác.',
} as const;

export default function DesktopOnlyNotice({ area = 'admin' }: { area?: keyof typeof COPY }) {
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    try {
      // Reading browser storage after mount (not during render) keeps hydration stable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem(BYPASS_KEY) === '1') setBypassed(true);
    } catch {
      /* storage blocked: just ask again */
    }
  }, []);

  if (bypassed) return null;

  const bypass = () => {
    setBypassed(true);
    try {
      sessionStorage.setItem(BYPASS_KEY, '1');
    } catch {
      /* storage blocked */
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white p-6 lg:hidden">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <Monitor className="h-7 w-7 text-gray-500" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">Hãy dùng máy tính</h1>
        <p className="mt-2 text-sm text-gray-600">{COPY[area]}</p>
        <button
          onClick={bypass}
          className="mt-6 text-sm font-medium text-gray-500 underline underline-offset-4 hover:text-gray-700"
        >
          Vẫn xem trên điện thoại
        </button>
      </div>
    </div>
  );
}

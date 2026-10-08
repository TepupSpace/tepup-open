'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Monitor } from 'lucide-react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';

/**
 * Chắn khu quản trị và khu đóng góp trên điện thoại/máy tính bảng.
 *
 * Hai khu này cố ý không được làm giao diện mobile: trình soạn thảo nội dung dựa
 * trên BlockNote và Sandpack vốn không thiết kế cho cảm ứng, mà công sức chuyển
 * đổi thì lớn còn nhu cầu soạn bài trên điện thoại gần như không có.
 *
 * Chỉ hiện khi màn hình hẹp VÀ con trỏ chính là cảm ứng (`pointer: coarse`): người
 * dùng máy tính phóng to trang 200–400% cũng có "màn hình hẹp", nhưng không được chặn.
 *
 * Là hộp thoại modal thật: phần ứng dụng phía sau bị `inert` khi hộp thoại hiện,
 * focus đặt vào nút "Vẫn xem", tiêu đề là h2 (trang phía sau có h1 riêng).
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
  const touchAndNarrow = useMediaQuery('(pointer: coarse) and (max-width: 1023px)');
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const textId = useId();
  const shown = touchAndNarrow && !bypassed;

  useEffect(() => {
    try {
      // Reading browser storage after mount (not during render) keeps hydration stable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem(BYPASS_KEY) === '1') setBypassed(true);
    } catch {
      /* storage blocked: just ask again */
    }
  }, []);

  // While shown: everything next to the notice (the app shell) is inert, and focus starts on
  // the only action. The layouts render the notice as a sibling of the app, so siblings it is.
  useEffect(() => {
    if (!shown) return;
    const self = dialogRef.current;
    const parent = self?.parentElement;
    if (!self || !parent) return;
    const madeInert: Element[] = [];
    for (const el of Array.from(parent.children)) {
      if (el === self || el.hasAttribute('inert')) continue;
      el.setAttribute('inert', '');
      madeInert.push(el);
    }
    buttonRef.current?.focus();
    return () => madeInert.forEach((el) => el.removeAttribute('inert'));
  }, [shown]);

  if (!shown) return null;

  const bypass = () => {
    setBypassed(true);
    try {
      sessionStorage.setItem(BYPASS_KEY, '1');
    } catch {
      /* storage blocked */
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={textId}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-white p-6"
    >
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <Monitor className="h-7 w-7 text-gray-600" aria-hidden="true" />
        </div>
        <h2 id={titleId} className="text-lg font-bold text-gray-900">
          Hãy dùng máy tính
        </h2>
        <p id={textId} className="mt-2 text-sm text-gray-600">
          {COPY[area]}
        </p>
        <button
          ref={buttonRef}
          type="button"
          onClick={bypass}
          className="mt-6 rounded px-2 py-1 text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700"
        >
          Vẫn xem trên điện thoại
        </button>
      </div>
    </div>
  );
}

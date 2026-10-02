'use client';

import { useEffect } from 'react';

const DEFAULT_MESSAGE =
  'Bạn có thay đổi chưa được lưu. Rời trang này sẽ mất các thay đổi đó. Bạn vẫn muốn rời đi?';

/**
 * Cảnh báo trước khi rời trang khi còn thay đổi chưa lưu.
 *
 * - Đóng tab / tải lại / sang trang khác origin: `beforeunload`, trình duyệt tự
 *   hiện hộp thoại của nó (nội dung `message` không được hiển thị ở đây).
 * - Bấm link trong app: App Router không có API chặn chuyển trang, nên ta bắt cú
 *   nhấp ở pha capture trên `document`. Pha capture trên `document` chạy trước khi
 *   sự kiện đi xuống tới thẻ <a> rồi nổi lên lại gốc React, nơi React phát onClick
 *   (kể cả onClick của next/link). Người dùng bấm Huỷ thì preventDefault +
 *   stopPropagation: trình duyệt không đi theo href và next/link không router.push.
 *
 * Không chặn nút Lùi/Tiến của trình duyệt: App Router tự xử lý popstate, giành
 * quyền với nó không đáng tin. Tự lưu nháp giữ khoảng thời gian chưa lưu ngắn.
 * Điều hướng bằng lệnh (`router.push` trong code) cũng không bị bắt; nơi nào gọi
 * nó thì tự hỏi trước.
 */
export function useUnsavedChangesGuard(when: boolean, message: string = DEFAULT_MESSAGE): void {
  useEffect(() => {
    if (!when) return;

    // Người dùng vừa đồng ý rời đi qua một link thường (không phải next/link): trang
    // sẽ tải lại toàn bộ, đừng để beforeunload hỏi thêm lần nữa.
    let skipUnloadUntil = 0;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (Date.now() < skipUnloadUntil) return;
      event.preventDefault();
      // Chrome/Edge cũ chỉ hiện hộp thoại khi có returnValue.
      event.returnValue = '';
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const target = anchor.getAttribute('target');
      if (target && target.toLowerCase() !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      // Khác origin (kể cả mailto:, tel:) thì beforeunload lo, nếu trang thật sự bị rời.
      if (url.origin !== window.location.origin) return;
      // Cùng path + query: chỉ đổi hash, hoặc link tới chính trang này; trình soạn vẫn còn.
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      if (window.confirm(message)) {
        skipUnloadUntil = Date.now() + 2_000;
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [when, message]);
}

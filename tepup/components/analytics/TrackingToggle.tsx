'use client';

import { useEffect, useId, useState } from 'react';
import Link from '@/components/ui/AppLink';
import { resetAnonId } from '@/lib/analytics/ids';
import {
  TRACKING_PREF_EVENT,
  hasGlobalPrivacyControl,
  isSwitchedOff,
  setTrackingSwitchedOff,
} from '@/lib/analytics/consent';

/**
 * Công tắc "Đóng góp số liệu ẩn danh" (CLAUDE.md › Analytics), mặc định bật. GPC của trình
 * duyệt thắng. Tắt: xoá mã ẩn danh; chỉ còn số đếm tổng và lỗi, không gắn mã.
 * Chỉ nằm ở hộp thoại ⚙ Cài đặt, mục "Quyền riêng tư" (không đặt trong bảng "Aa" của trang học).
 */
export default function TrackingToggle() {
  const id = useId();
  // Chỉ render trong bảng/hộp thoại đã mở (sau hydrate), nên đọc localStorage ngay là an toàn.
  const [off, setOff] = useState(() => typeof window !== 'undefined' && isSwitchedOff());
  const [gpc] = useState(() => typeof window !== 'undefined' && hasGlobalPrivacyControl());
  const [note, setNote] = useState('');

  useEffect(() => {
    const sync = () => setOff(isSwitchedOff());
    window.addEventListener(TRACKING_PREF_EVENT, sync);
    return () => window.removeEventListener(TRACKING_PREF_EVENT, sync);
  }, []);

  const on = !gpc && !off;
  const toggle = () => {
    if (gpc) return;
    const next = !off;
    if (next) resetAnonId(); // bật lại sau này sẽ là một mã hoàn toàn mới
    setTrackingSwitchedOff(next);
    setOff(next);
    setNote(next ? 'Đã tắt. Tepup chỉ còn cộng vào số đếm tổng, không gắn mã.' : 'Đã bật.');
  };

  const hint = gpc
    ? 'Trình duyệt của bạn đang bật “Global Privacy Control”, nên Tepup không gửi số liệu có mã.'
    : 'Giúp đánh giá bài học nào được học xong và chỗ nào khó. Không làm lộ danh tính.';

  return (
    <div className="st-track">
      <div className="st-track__row">
        <span>
          <span id={`${id}-label`} className="st-legend">
            Đóng góp số liệu ẩn danh
          </span>
          <span id={`${id}-hint`} className="st-hint st-track__hint">
            {hint}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint`}
          // aria-disabled thay vì disabled: GPC đang bật thì nút vẫn giữ được focus.
          aria-disabled={gpc}
          onClick={toggle}
          className="st-switch"
        >
          <span aria-hidden="true" className="st-switch__knob" />
          <span className="sr-only">{on ? 'Đang bật' : 'Đang tắt'}</span>
        </button>
      </div>
      <div className="st-track__links">
        <Link href="/du-lieu" className="st-link">
          Xem Tepup thu thập gì
        </Link>
      </div>
      {/* Luôn gắn sẵn cùng khối; chỉ chữ bên trong đổi (CLAUDE.md › Accessibility). */}
      <p aria-live="polite" className="sr-only">
        {note}
      </p>
    </div>
  );
}

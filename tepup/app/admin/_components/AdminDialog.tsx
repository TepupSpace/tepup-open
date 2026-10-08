'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import FocusTrap from 'focus-trap-react';

/**
 * Hộp thoại (modal) dùng chung cho trang quản trị.
 *
 * - Giữ focus bên trong (focus-trap-react), focus ban đầu vào `initialFocus` hoặc phần tử
 *   đầu tiên bấm được; Escape để đóng.
 * - Khi đóng, trả focus về nút đã mở hộp thoại. Nếu nút đó không còn (ví dụ: hàng vừa bị
 *   xoá), focus sang `fallbackFocus`, hoặc tiêu đề h1 của trang, để focus không rơi về <body>.
 *
 * Thư mục `_components` có dấu gạch dưới nên Next không coi nó là route.
 */
export interface AdminDialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** CSS selector (trong hộp thoại) của phần tử nhận focus khi mở. */
  initialFocus?: string;
  /** `alertdialog` cho hộp xác nhận (xoá…). */
  role?: 'dialog' | 'alertdialog';
  /** id của đoạn mô tả, để trình đọc màn hình đọc kèm tiêu đề. */
  describedBy?: string;
  /** Nơi nhận focus khi nút mở hộp thoại đã biến mất. */
  fallbackFocus?: () => HTMLElement | null;
  /** Đang lưu/xoá: Escape và bấm nền không đóng hộp thoại. */
  busy?: boolean;
  /** Bấm ra nền tối thì đóng (chỉ là tiện cho chuột; bàn phím dùng Escape hoặc nút Huỷ). */
  closeOnBackdrop?: boolean;
  /** Lớp độ rộng của khung, mặc định `max-w-md`. */
  widthClassName?: string;
}

/** Tiêu đề h1 của trang, dùng làm chỗ đặt focus dự phòng. */
function pageHeading(): HTMLElement | null {
  const h1 = document.querySelector<HTMLElement>('#main-content h1');
  if (h1 && !h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
  return h1;
}

export default function AdminDialog({
  title,
  onClose,
  children,
  initialFocus,
  role = 'dialog',
  describedBy,
  fallbackFocus,
  busy = false,
  closeOnBackdrop = false,
  widthClassName = 'max-w-md',
}: AdminDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Phần tử đang có focus lúc hộp thoại mở: đọc trong lúc render đầu, trước khi
  // FocusTrap kéo focus vào trong.
  const [opener] = useState<HTMLElement | null>(() =>
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null)
  );
  const latest = useRef({ onClose, busy, fallbackFocus });
  useEffect(() => {
    latest.current = { onClose, busy, fallbackFocus };
  });

  // Escape đóng hộp thoại (chỉ khi focus đang ở trong nó).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape' || latest.current.busy) return;
      if (!dialogRef.current?.contains(document.activeElement)) return;
      e.preventDefault();
      latest.current.onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Trả focus khi đóng. Chạy sau khi React gỡ xong cả hộp thoại lẫn hàng vừa xoá (nếu có),
  // nên biết chắc nút mở còn trong trang hay không. `mounted` bỏ qua lần gỡ-gắn lại giả
  // của StrictMode khi dev.
  useEffect(() => {
    const mounted = { current: true };
    return () => {
      mounted.current = false;
      window.setTimeout(() => {
        if (mounted.current) return;
        const target =
          opener && opener.isConnected ? opener : (latest.current.fallbackFocus?.() ?? pageHeading());
        target?.focus();
      }, 0);
    };
  }, [opener]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Nền tối: bấm vào chỉ là tiện cho chuột; bàn phím đóng bằng Escape hoặc nút Huỷ. */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={closeOnBackdrop && !busy ? onClose : undefined}
      />
      <FocusTrap
        focusTrapOptions={{
          initialFocus: initialFocus ?? undefined,
          fallbackFocus: () => dialogRef.current ?? document.body,
          escapeDeactivates: false,
          allowOutsideClick: true,
          // Tự trả focus ở effect phía trên (kể cả khi nút mở đã bị gỡ khỏi trang).
          returnFocusOnDeactivate: false,
        }}
      >
        <div
          ref={dialogRef}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={describedBy}
          tabIndex={-1}
          className={`relative w-full ${widthClassName} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl`}
        >
          <h2 id={titleId} className="mb-4 text-lg font-semibold text-gray-900">
            {title}
          </h2>
          {children}
        </div>
      </FocusTrap>
    </div>
  );
}

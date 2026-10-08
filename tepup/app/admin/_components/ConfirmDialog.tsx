'use client';

import { useId, type ReactNode } from 'react';
import AdminDialog from './AdminDialog';

/**
 * Hộp xác nhận cho thao tác không hoàn tác được (xoá…).
 *
 * Focus ban đầu ở nút "Huỷ" (lựa chọn an toàn). Lỗi hiện ngay trong hộp thoại, trong vùng
 * `role="alert"` luôn có mặt, vì hộp thoại che mất thông báo lỗi của trang phía sau.
 */
export default function ConfirmDialog({
  title = 'Xác nhận xóa',
  children,
  confirmLabel = 'Xóa',
  busyLabel = 'Đang xóa…',
  onConfirm,
  onCancel,
  busy = false,
  error = '',
  fallbackFocus,
}: {
  title?: string;
  children: ReactNode;
  confirmLabel?: string;
  busyLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  error?: string;
  fallbackFocus?: () => HTMLElement | null;
}) {
  const descId = useId();
  return (
    <AdminDialog
      title={title}
      role="alertdialog"
      describedBy={descId}
      onClose={onCancel}
      busy={busy}
      initialFocus="[data-dialog-cancel]"
      fallbackFocus={fallbackFocus}
    >
      <div id={descId} className="mb-4 text-gray-600">
        {children}
      </div>
      <div role="alert" className="empty:hidden mb-4">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          data-dialog-cancel
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => {
            if (!busy) onConfirm();
          }}
          aria-disabled={busy || undefined}
          className="rounded-xl bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 aria-disabled:cursor-wait aria-disabled:opacity-70"
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </AdminDialog>
  );
}

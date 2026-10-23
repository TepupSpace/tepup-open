import type { ReviewVerdict } from '@prisma/client';

/** Shared labels for "Gửi người duyệt" screens (client-safe). */
export const VERDICT_LABEL: Record<ReviewVerdict, string> = {
  ENDORSED: 'Đồng ý xuất bản',
  CHANGES_SUGGESTED: 'Cần sửa',
};

/** Badge classes: always paired with the text label, never colour alone. */
export const VERDICT_BADGE: Record<ReviewVerdict, string> = {
  ENDORSED: 'border-green-300 bg-green-50 text-green-800',
  CHANGES_SUGGESTED: 'border-amber-300 bg-amber-50 text-amber-900',
};

export const NO_OPINION_BADGE = 'border-gray-300 bg-gray-50 text-gray-700';

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

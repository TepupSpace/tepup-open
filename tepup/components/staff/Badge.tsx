import type { HTMLAttributes } from 'react';

/**
 * Nhãn trạng thái kiểu giấy. Đừng chỉ dựa vào màu: chữ trong nhãn phải tự nói trạng thái
 * (CLAUDE.md › Accessibility).
 * - neutral: mặc định / nháp   - red: nhấn (vai trò, mới)   - green: đã duyệt / đang hiện
 * - warning: chờ / cần sửa      - wrong: từ chối / lỗi / bị khoá   - info: thông tin
 */
export type StaffBadgeTone = 'neutral' | 'red' | 'green' | 'warning' | 'wrong' | 'info';

export default function Badge({
  tone = 'neutral',
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: StaffBadgeTone }) {
  return <span className={`staff-badge staff-badge--${tone}${className ? ` ${className}` : ''}`} {...props} />;
}

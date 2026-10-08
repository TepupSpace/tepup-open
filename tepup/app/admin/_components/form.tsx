import { ArrowLeft } from 'lucide-react';
import Link from '@/components/ui/AppLink';

/**
 * Mảnh dùng chung cho các form quản trị.
 *
 * - Viền ô nhập gray-500 (≥ 3:1 so với nền, WCAG 1.4.11); gray-200 cũ gần như không thấy.
 * - Vòng focus blue-600; `aria-invalid` tô viền đỏ cho ô đang lỗi.
 */
export const inputClass =
  'w-full px-4 py-3 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent aria-[invalid=true]:border-red-600';

export const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export const checkboxClass = 'w-5 h-5 rounded border-gray-500 text-blue-600 focus:ring-blue-600';

/** Dấu * cho trường bắt buộc. Ẩn với trình đọc màn hình: ô nhập đã có `required`. */
export function RequiredMark() {
  return (
    <span className="text-red-700" aria-hidden="true">
      *
    </span>
  );
}

/** Dòng giải thích dấu * (đặt ở đầu form). */
export function RequiredNote() {
  return (
    <p className="text-sm text-gray-600">
      Trường có dấu <RequiredMark /> là bắt buộc.
    </p>
  );
}

/**
 * Vùng lỗi của form: luôn có mặt trong DOM, chỉ đổi nội dung, để trình đọc màn hình
 * đọc lỗi ngay khi nó xuất hiện (một vùng live gắn cùng lúc với chữ thường bị bỏ qua).
 */
export function FormError({ id, message, className = 'mb-4' }: { id?: string; message: string; className?: string }) {
  return (
    <div role="alert" id={id} className={`empty:hidden ${className}`}>
      {message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 whitespace-pre-line">{message}</div>
      )}
    </div>
  );
}

/** Nút quay lại chỉ có biểu tượng: cần tên cho trình đọc màn hình. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
      <ArrowLeft className="w-5 h-5" />
    </Link>
  );
}

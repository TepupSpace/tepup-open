/**
 * Vòng xoay chờ dùng chung.
 *
 * Trước đây hai biến thể này bị chép tay ở ~25 chỗ dưới dạng div inline. Component
 * giữ nguyên đúng class cũ nên không có gì đổi về mặt hình ảnh.
 */

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-4',
} as const;

const TONES = {
  /** Trên nền sáng — biến thể mặc định của trang. */
  brand: 'border-blue-500 border-t-transparent',
  /** Trên nút màu đặc. */
  onDark: 'border-white border-t-transparent',
  /** Chờ kín đáo, cạnh chữ xám. */
  muted: 'border-gray-400 border-t-transparent',
} as const;

interface SpinnerProps {
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  className?: string;
  /**
   * Đặt `label` khi vòng xoay đứng một mình. Bỏ trống khi cạnh nó đã có chữ
   * ("Đang mở…") — lúc đó đọc thêm nhãn ẩn chỉ tổ lặp với trình đọc màn hình.
   */
  label?: string;
}

export default function Spinner({ size = 'md', tone = 'brand', className = '', label }: SpinnerProps) {
  return (
    <span
      className={`inline-block rounded-full animate-spin ${SIZES[size]} ${TONES[tone]} ${className}`}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

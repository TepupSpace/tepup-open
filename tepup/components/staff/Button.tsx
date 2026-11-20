import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from 'react';
import Link from '@/components/ui/AppLink';

/**
 * Nút của khu nhân sự (admin, contributor, đăng nhập): viên thuốc kiểu giấy, app/staff-paper.css.
 *
 * - `primary`: đỏ đặc, mép dưới đậm. Một nút chính mỗi vùng.
 * - `secondary`: nền thẻ, viền.  `ghost`: không nền.  `danger`: viền đỏ lỗi (xoá, khoá…).
 * - Đang bận / không bấm được: truyền `aria-disabled` (đừng dùng `disabled` cho nút người dùng
 *   vừa bấm: focus sẽ rơi mất, xem CLAUDE.md › Accessibility). Nút tự chặn onClick khi aria-disabled.
 */

export type StaffButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type StaffButtonSize = 'md' | 'sm';

export function staffButtonClass(
  variant: StaffButtonVariant = 'primary',
  size: StaffButtonSize = 'md',
  className = ''
): string {
  return `staff-btn staff-btn--${variant}${size === 'sm' ? ' staff-btn--sm' : ''}${className ? ` ${className}` : ''}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: StaffButtonVariant;
  size?: StaffButtonSize;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', onClick, ...props },
  ref
) {
  const off = props['aria-disabled'] === true || props['aria-disabled'] === 'true';
  return (
    <button
      ref={ref}
      type={type}
      className={staffButtonClass(variant, size, className)}
      onClick={(e) => {
        if (off) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
});

export default Button;

type LinkProps = ComponentProps<typeof Link> & {
  variant?: StaffButtonVariant;
  size?: StaffButtonSize;
};

/** Liên kết trông như nút (điều hướng sang trang khác). */
export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: LinkProps) {
  return <Link className={staffButtonClass(variant, size, className)} {...props} />;
}

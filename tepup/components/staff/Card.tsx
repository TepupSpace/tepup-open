import type { HTMLAttributes } from 'react';

/**
 * Thẻ trắng kiểu giấy (bo 24px, mép dưới dày), app/staff-paper.css.
 * `flat`: bỏ mép dưới, cho thẻ lồng trong thẻ hoặc danh sách dày.
 * `as`: đổi thẻ HTML (section, article, li…) khi thẻ là một vùng có tiêu đề.
 */
type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section' | 'article' | 'li' | 'aside';
  flat?: boolean;
};

export default function Card({ as: Tag = 'div', flat = false, className = '', ...props }: CardProps) {
  return <Tag className={`staff-card${flat ? ' staff-card--flat' : ''}${className ? ` ${className}` : ''}`} {...props} />;
}

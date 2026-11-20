import type { ReactNode } from 'react';

/**
 * Đầu trang của khu nhân sự: kicker (tuỳ chọn), tiêu đề h1 serif, mô tả, vùng nút bên phải.
 * Mỗi trang đúng một h1 (CLAUDE.md › Accessibility).
 */
export default function PageHeader({
  title,
  kicker,
  description,
  actions,
  className = '',
}: {
  title: ReactNode;
  kicker?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`staff-pagehead${className ? ` ${className}` : ''}`}>
      <div className="min-w-0">
        {kicker && <p className="staff-pagehead__kicker">{kicker}</p>}
        <h1 className="break-words">{title}</h1>
        {description && <p className="staff-pagehead__desc">{description}</p>}
      </div>
      {actions && <div className="staff-pagehead__actions">{actions}</div>}
    </div>
  );
}

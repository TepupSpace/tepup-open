'use client';

import type { ReactNode } from 'react';
import { usePaperPlayer } from '@/components/learn/paper-context';

interface Props {
  /**
   * Nền và viền riêng của từng loại block. Shell chỉ sở hữu phần layout — nhịp dọc,
   * bo góc, đệm — nên `skin` không bao giờ chọi với class của shell.
   */
  skin?: string;
  className?: string;
  /**
   * Sắc chủ đạo của block (indigo, sky, cyan…). Trong trang học giấy, sắc này được
   * trỏ về màu nhấn đỏ của thiết kế (components/learn/player-paper.css), để nút và
   * trạng thái chọn của mọi block cùng một bộ màu.
   */
  accent?: 'indigo' | 'violet' | 'purple' | 'sky' | 'cyan' | 'fuchsia' | 'pink';
  children: ReactNode;
}

/**
 * Khung ngoài dùng chung cho mọi block tương tác.
 *
 * Trước đây mỗi block tự viết khung của mình và trôi khỏi nhau: `p-5`, `p-6`, `p-8`,
 * `mb-6` lẫn `my-6`, và không cái nào đổi đệm theo kích thước màn. Trên màn 390px,
 * `p-6` ăn mất 48px — hơn 12% chiều rộng — đúng phần mà nội dung đang thiếu.
 *
 * Trong trang học giấy: thẻ trắng bo 20px (demo `.lw`), bỏ `skin` gradient riêng.
 */
export default function BlockShell({
  skin = 'border border-gray-200 bg-white',
  className = '',
  accent,
  children,
}: Props) {
  const paper = usePaperPlayer();
  if (paper) {
    return (
      <div className={`lw ${className}`} data-pl-accent={accent}>
        {children}
      </div>
    );
  }
  return (
    <div className={`my-6 rounded-2xl p-4 sm:p-6 ${skin} ${className}`}>{children}</div>
  );
}

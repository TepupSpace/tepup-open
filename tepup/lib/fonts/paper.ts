import { Fraunces, Be_Vietnam_Pro } from 'next/font/google';

/**
 * Bộ chữ của giao diện "giấy" (landing v2, /courses): Fraunces cho tiêu đề,
 * Be Vietnam Pro cho chữ thường. Chỉ layout nào import file này mới nạp font;
 * phần còn lại của site vẫn chạy Geist khai báo ở app/layout.tsx.
 */

/* Không khai `weight`: Fraunces là font biến thiên, bỏ trống thì next/font nạp
   cả dải wght và mới cho phép kèm `axes` — CSS cần SOFT/WONK để ra đúng dáng
   chữ trong Figma. */
export const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin', 'vietnamese'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  display: 'swap',
});

export const beVietnam = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

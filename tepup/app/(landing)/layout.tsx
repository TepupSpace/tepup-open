import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { fraunces, beVietnam } from '@/lib/fonts/paper';
import './landing-v2.css';

/**
 * Layout riêng cho trang chủ.
 *
 * Trang chủ cố ý tách khỏi nhóm (marketing): header pill nổi đè lên hero, và
 * thanh tab dưới đáy sẽ che mất đoàn nhân vật diễu hành — nên ở đây không dùng
 * MarketingHeader / MarketingFooter / BottomTabBar. Các trang marketing còn lại
 * vẫn giữ nguyên bộ chrome cũ.
 *
 * Fraunces + Be Vietnam Pro dùng chung với /courses (lib/fonts/paper.ts); Voyage
 * chỉ nạp cho route này.
 */

/**
 * Voyage chỉ có glyph cho slogan hero ("Tép riu / Stép up / Stép out") — bộ chữ
 * thiếu 44/67 dấu tiếng Việt thường dùng, nên dùng nó ở chỗ khác sẽ rơi về font
 * dự phòng ngay giữa câu. Đừng tái sử dụng.
 */
const voyage = { variable: '' };

export const metadata: Metadata = {
  title: 'Tépup — Kiến thức công dân thực dụng bằng tiếng Việt',
  description:
    'Nền tảng học những điều cơ bản về xã hội bạn đang sống — thuế, tư duy, quyền số — theo cách dễ hiểu, gần gũi, và hoàn toàn miễn phí.',
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`lp ${fraunces.variable} ${beVietnam.variable} ${voyage.variable}`}>
      {children}
    </div>
  );
}

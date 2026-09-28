import type { Metadata } from 'next';
import { fraunces, beVietnam } from '@/lib/fonts/paper';
import HubHeader from '@/components/courses-hub/HubHeader';
import BottomTabBar from '@/components/mobile/BottomTabBar';
import './courses-hub.css';

/**
 * Layout riêng cho trang hub `/courses` (design demo-course-stories): nền giấy,
 * header pill. Tách khỏi nhóm (learn) để /library, /story và trang chi tiết
 * khoá học vẫn giữ LearnHeader cũ cho tới khi được thiết kế lại.
 */

export const metadata: Metadata = {
  title: 'Khoá học — Tépup',
  description: 'Khám phá các khoá học của Tépup: học qua câu chuyện nhân vật và các môn nền tảng.',
};

export default function CoursesHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ch ${fraunces.variable} ${beVietnam.variable}`}>
      <HubHeader />
      {/* Chừa chỗ cho thanh tab dính ở đáy trên mobile. */}
      <div className="ch-page pb-tab-bar md:pb-0">{children}</div>
      <BottomTabBar />
    </div>
  );
}

import type { Metadata } from 'next';
import { fraunces, beVietnam } from '@/lib/fonts/paper';
import PaperHeader from '@/components/paper/PaperHeader';
import BottomTabBar from '@/components/mobile/BottomTabBar';
import LicenceFooterLine from '@/components/LicenceFooterLine';
import '../paper.css';
import './courses-hub.css';

/**
 * Layout riêng cho trang hub `/courses` (design demo-course-stories): nền giấy
 * (token chung trong app/paper.css), header pill. /story/**, /courses/[slug] (nhóm
 * paper) và /thu-vien/** (nhóm library) dùng cùng giao diện qua PaperShell.
 */

export const metadata: Metadata = {
  title: 'Khoá học — Tépup',
  description: 'Khám phá các khoá học của Tépup: học qua câu chuyện nhân vật và các môn nền tảng.',
};

export default function CoursesHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`paper ch ${fraunces.variable} ${beVietnam.variable}`}>
      <PaperHeader current="courses" />
      {/* Chừa chỗ cho thanh tab dính ở đáy trên mobile. */}
      <div className="ch-page pb-tab-bar md:pb-0">
        {children}
        {/* Same for every visitor (cache-safe). Colour from the hub's theme token. */}
        <footer className="px-4 py-6 text-center">
          <LicenceFooterLine
            className="text-xs text-[color:var(--muted)]"
            linkClassName="underline underline-offset-2 hover:text-[color:var(--ink-strong)]"
          />
        </footer>
      </div>
      <BottomTabBar />
    </div>
  );
}

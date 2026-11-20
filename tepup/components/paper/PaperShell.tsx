import { fraunces, beVietnam } from '@/lib/fonts/paper';
import PaperHeader from '@/components/paper/PaperHeader';
import BottomTabBar from '@/components/mobile/BottomTabBar';
import LicenceFooterLine from '@/components/LicenceFooterLine';
import '@/app/paper.css';

/**
 * Khung giấy dùng chung cho trang học viên (/story/**, /thu-vien/**): nền giấy,
 * header pill, thanh tab đáy trên mobile.
 *
 * Theme sáng cố định như /courses (.ch) và landing (.lp), không dùng .reader:
 * xem mục Accessibility trong CLAUDE.md. Trang dùng khung này có thể được cache
 * công khai → không đọc cookie/session/searchParams trên server ở đây.
 */
export default function PaperShell({
  current,
  children,
}: {
  current: 'courses' | 'library';
  children: React.ReactNode;
}) {
  return (
    <div className={`paper ${fraunces.variable} ${beVietnam.variable}`}>
      <PaperHeader current={current} />
      {/* Chừa chỗ cho thanh tab dính ở đáy trên mobile. */}
      <div className="paper-page pb-tab-bar md:pb-0">
        {children}
        {/* Same for every visitor (cache-safe). */}
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

import LearnHeader from '@/components/LearnHeader';
import BottomTabBar from '@/components/mobile/BottomTabBar';

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <LearnHeader />
      {/* Chừa chỗ cho thanh tab dính ở đáy, nếu không phần cuối trang bị che khuất. */}
      <div className="pb-tab-bar md:pb-0">{children}</div>
      <BottomTabBar />
    </div>
  );
}

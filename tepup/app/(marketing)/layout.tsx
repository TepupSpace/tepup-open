import MarketingHeader from '@/components/MarketingHeader';
import MarketingFooter from '@/components/MarketingFooter';
import BottomTabBar from '@/components/mobile/BottomTabBar';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MarketingHeader />
      <div className="flex-1">{children}</div>
      {/* Chừa chỗ cho thanh tab dính ở đáy, nếu không chân trang bị che khuất. */}
      <div className="pb-tab-bar md:pb-0">
        <MarketingFooter />
      </div>
      <BottomTabBar />
    </div>
  );
}

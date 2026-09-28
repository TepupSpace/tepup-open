import LandingHeader from '@/components/landing/LandingHeader';
import HeroScroller from '@/components/landing/HeroScroller';
import HowSection from '@/components/landing/sections/HowSection';
import PillarsSection from '@/components/landing/sections/PillarsSection';
import OpenSection from '@/components/landing/sections/OpenSection';
import FinalCta from '@/components/landing/sections/FinalCta';
import LandingFooter from '@/components/landing/LandingFooter';

/**
 * Trang chủ v2.
 *
 * Hai section đầu port 1:1 từ tepup-demo-v2/demo-landing-v2.html (dải cuộn dính
 * 250vh, hai trang chồng nhau). Các section sau dựng theo Figma
 * "Web Design - Tepup" node 140:5491. Footer không có trong Figma nên dựng lại
 * bằng cùng bộ token.
 */

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main id="main-content">
        <HeroScroller />

        <div className="lp-flow">
          <div className="lp-sections">
            <HowSection />
            <PillarsSection />
            <OpenSection />
            <FinalCta />
          </div>
          <LandingFooter />
        </div>
      </main>
    </>
  );
}

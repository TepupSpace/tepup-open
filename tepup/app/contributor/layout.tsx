import { requireContributor } from '@/lib/admin-auth';
import ContributorSidebar from '@/components/contributor/ContributorSidebar';
import ContributorHeader from '@/components/contributor/ContributorHeader';
import DesktopOnlyNotice from '@/components/mobile/DesktopOnlyNotice';
import { SessionProvider } from 'next-auth/react';

export const metadata = {
  title: 'Contributor - Tepup',
  description: 'Đóng góp nội dung cho Tepup',
};

export default async function ContributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireContributor();

  return (
    <SessionProvider>
      <DesktopOnlyNotice />
      <div className="min-h-screen bg-gray-50">
        <ContributorSidebar />
        <div className="lg:pl-64 transition-all duration-300">
          <ContributorHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

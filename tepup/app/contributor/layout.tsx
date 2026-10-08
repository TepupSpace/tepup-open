import { requireContributor } from '@/lib/admin-auth';
import ContributorSidebar from '@/components/contributor/ContributorSidebar';
import ContributorHeader from '@/components/contributor/ContributorHeader';
import DesktopOnlyNotice from '@/components/mobile/DesktopOnlyNotice';
import { SessionProvider } from 'next-auth/react';

export const metadata = {
  // Trang con đặt `metadata.title` riêng ("Khoá học", "Bản nháp"…): mỗi trang một tiêu đề, để
  // trình đọc màn hình đọc được khi chuyển trang (Next chỉ thông báo khi tiêu đề đổi).
  title: { default: 'Cộng tác viên | Tepup', template: '%s — Cộng tác viên | Tepup' },
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
      <DesktopOnlyNotice area="contributor" />
      {/* `reader`: tuỳ chọn đọc (sáng/tối, phông, cỡ chữ) áp dụng ở đây như ở trang học. */}
      <div className="reader min-h-screen bg-gray-50">
        <ContributorSidebar />
        <div className="lg:pl-64 transition-all duration-300">
          <ContributorHeader />
          <main id="main-content" className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

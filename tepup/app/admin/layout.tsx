import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin-auth';
import { canReviewContent } from '@/lib/role-utils';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DesktopOnlyNotice from '@/components/mobile/DesktopOnlyNotice';
import { SessionProvider } from 'next-auth/react';

export const metadata = {
  // Trang con đặt `metadata.title` riêng ("Khoá học", "Bản nháp"…): mỗi trang một tiêu đề, để
  // trình đọc màn hình đọc được khi chuyển trang (Next chỉ thông báo khi tiêu đề đổi).
  title: { default: 'Quản trị | Tepup', template: '%s — Quản trị | Tepup' },
  description: 'Quản trị nội dung Tepup',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The admin shell is for reviewers and admins. Reviewers reach the dashboard, reviews/ and
  // settings/; everything ADMIN-only sits in (restricted)/, which checks requireAdmin() itself.
  // Contributors have their own area. (API routes check their own sessions; see CLAUDE.md.)
  const session = await requireAuth();
  if (!canReviewContent(session.user.role)) {
    redirect('/contributor');
  }

  return (
    <SessionProvider>
      <DesktopOnlyNotice />
      {/* `reader`: tuỳ chọn đọc (sáng/tối, phông, cỡ chữ) áp dụng ở đây như ở trang học. */}
      <div className="reader min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="lg:pl-64 transition-all duration-300">
          <AdminHeader />
          <main id="main-content" className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

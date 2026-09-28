import { requireAuth } from '@/lib/admin-auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DesktopOnlyNotice from '@/components/mobile/DesktopOnlyNotice';
import { SessionProvider } from 'next-auth/react';

export const metadata = {
  title: 'Admin - Tepup',
  description: 'Quản trị nội dung Tepup',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check login (admin role check is handled per-route)
  await requireAuth();

  return (
    <SessionProvider>
      <DesktopOnlyNotice />
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="lg:pl-64 transition-all duration-300">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

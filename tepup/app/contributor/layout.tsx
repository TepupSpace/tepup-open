import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import ContributorSidebar from '@/components/contributor/ContributorSidebar';
import ContributorHeader from '@/components/contributor/ContributorHeader';
import DesktopOnlyNotice from '@/components/mobile/DesktopOnlyNotice';
import { SessionProvider } from 'next-auth/react';
import { TERMS, roleBadge } from '@/lib/terms';
import type { UserRole } from '@prisma/client';

export const metadata = {
  // Trang con đặt `metadata.title` riêng ("Khoá học", "Bản nháp"…): mỗi trang một tiêu đề, để
  // trình đọc màn hình đọc được khi chuyển trang (Next chỉ thông báo khi tiêu đề đổi).
  title: { default: `${TERMS.area} | Tepup`, template: `%s — ${TERMS.area} | Tepup` },
  description: 'Đóng góp nội dung cho Tepup',
};

export default async function ContributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireContributor();
  // Which menu items apply (the pages check permissions again themselves).
  const roles = await prisma.courseMember.findMany({
    where: { userId: session.user.id },
    select: { role: true, course: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  const hasCourseRole = roles.length > 0;
  const isTrustedReviewer = roles.some((r) => r.role === 'TRUSTED_REVIEWER');
  // Badge under the name: the most specific role (course role beats the access level).
  const role = session.user.role as UserRole;
  const badge = roleBadge(
    role,
    roles.map((r) => ({ role: r.role, courseName: r.course.name }))
  );
  const badgeIsCourseRole = hasCourseRole && role !== 'ADMIN' && role !== 'REVIEWER';

  return (
    <SessionProvider>
      <DesktopOnlyNotice area="contributor" />
      {/* `reader`: tuỳ chọn đọc (sáng/tối, phông, cỡ chữ) áp dụng ở đây như ở trang học. */}
      <div className="reader min-h-screen bg-gray-50">
        <ContributorSidebar hasCourseRole={hasCourseRole} isTrustedReviewer={isTrustedReviewer} />
        <div className="lg:pl-64 transition-all duration-300">
          <ContributorHeader badge={badge} badgeIsCourseRole={badgeIsCourseRole} />
          <main id="main-content" className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

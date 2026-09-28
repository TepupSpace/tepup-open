import { requireAdmin } from '@/lib/admin-auth';

export default async function RestrictedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}

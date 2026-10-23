import type { Metadata } from 'next';
import { requireContributor } from '@/lib/admin-auth';
import NotificationsPage from '@/components/notifications/NotificationsPage';

export const metadata: Metadata = { title: 'Thông báo' };

export default async function ContributorNotificationsPage() {
  await requireContributor();
  return <NotificationsPage area="contributor" />;
}

import type { Metadata } from 'next';
import { requireReviewer } from '@/lib/admin-auth';
import NotificationsPage from '@/components/notifications/NotificationsPage';

export const metadata: Metadata = { title: 'Thông báo' };

/** Admin layout is REVIEWER+; this page sits outside (restricted) so reviewers reach it too. */
export default async function AdminNotificationsPage() {
  await requireReviewer();
  return <NotificationsPage area="admin" />;
}

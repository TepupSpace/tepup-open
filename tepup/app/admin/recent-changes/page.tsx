import type { Metadata } from 'next';
import RecentChangesPage from '@/components/history/RecentChangesPage';

export const metadata: Metadata = { title: 'Thay đổi gần đây' };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <RecentChangesPage area="admin" searchParams={searchParams} />;
}

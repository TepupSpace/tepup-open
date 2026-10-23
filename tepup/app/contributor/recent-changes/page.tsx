import type { Metadata } from 'next';
import RecentChangesPage from '@/components/history/RecentChangesPage';
import ReviewSectionTabs from '@/components/contributor/ReviewSectionTabs';
import { requireContributor } from '@/lib/admin-auth';

export const metadata: Metadata = { title: 'Thay đổi gần đây' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireContributor();
  return (
    <>
      <ReviewSectionTabs viewer={session.user} current="/contributor/recent-changes" />
      <RecentChangesPage area="contributor" searchParams={searchParams} />
    </>
  );
}

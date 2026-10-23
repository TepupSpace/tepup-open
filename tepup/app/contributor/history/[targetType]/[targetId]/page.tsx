import type { Metadata } from 'next';
import HistoryPage from '@/components/history/HistoryPage';

export const metadata: Metadata = { title: 'Lịch sử thay đổi' };

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ targetType: string; targetId: string }>;
  searchParams: Promise<{ rev?: string | string[] }>;
}) {
  return <HistoryPage area="contributor" params={params} searchParams={searchParams} />;
}

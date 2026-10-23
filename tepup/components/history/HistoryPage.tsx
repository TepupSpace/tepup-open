import { notFound, redirect } from 'next/navigation';
import { getContributorSession } from '@/lib/admin-auth';
import { historyAccess, parseTargetType, viewerOf } from '@/app/api/history/_lib/access';
import { targetLabel } from '@/app/api/history/_lib/queries';
import { prisma } from '@/lib/prisma';
import HistoryView from './HistoryView';
import { TARGET_LABELS, type HistoryArea, type HistoryTargetType } from './types';

/**
 * Page body for /admin/history/[targetType]/[targetId] and /contributor/history/…
 * Checks access on the server (404 when the viewer may not read this history); the client
 * view loads the list and diffs from /api/history, which checks again.
 */
export default async function HistoryPage({
  area,
  params,
  searchParams,
}: {
  area: HistoryArea;
  params: Promise<{ targetType: string; targetId: string }>;
  searchParams: Promise<{ rev?: string | string[] }>;
}) {
  const session = await getContributorSession();
  if (!session) redirect(`/login?callbackUrl=/${area}`);
  const { targetType: rawType, targetId } = await params;
  const targetType = parseTargetType(rawType);
  if (!targetType) notFound();
  const access = await historyAccess(viewerOf(session.user), targetType, targetId);
  if (!access) notFound();

  const sp = await searchParams;
  const rev = typeof sp.rev === 'string' ? sp.rev : null;
  const label =
    (await targetLabel(targetType, targetId)) ??
    (
      await prisma.contentRevision.findFirst({
        where: { targetType, targetId },
        orderBy: { createdAt: 'desc' },
        select: { label: true },
      })
    )?.label;
  if (label == null) notFound();

  return (
    <div className="max-w-6xl space-y-4">
      <header>
        <p className="text-sm text-gray-600">Lịch sử thay đổi · {TARGET_LABELS[targetType as HistoryTargetType]}</p>
        <h1 className="text-2xl font-bold text-gray-900">{label}</h1>
      </header>
      <HistoryView targetType={targetType as HistoryTargetType} targetId={targetId} area={area} initialRevisionId={rev} />
    </div>
  );
}

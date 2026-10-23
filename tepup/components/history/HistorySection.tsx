import Link from '@/components/ui/AppLink';
import { getContributorSession } from '@/lib/admin-auth';
import { historyAccess, viewerOf } from '@/app/api/history/_lib/access';
import { listRevisions } from '@/app/api/history/_lib/queries';
import { SOURCE_LABELS, formatTime, historyHref, type HistoryArea } from './types';

/**
 * Hub section: recent revisions of the target, with links to diffs (if the viewer may read history).
 * Renders nothing when the viewer may not read this history (server-side check).
 */
export default async function HistorySection({
  targetType,
  targetId,
  area = 'contributor',
}: {
  targetType: 'LESSON' | 'CHAPTER' | 'LIBRARY_ENTRY' | 'COURSE_OUTLINE';
  targetId: string;
  area?: HistoryArea;
}) {
  const session = await getContributorSession();
  if (!session) return null;
  const access = await historyAccess(viewerOf(session.user), targetType, targetId);
  if (!access) return null;
  const { items } = await listRevisions(targetType, targetId, null, 5);
  const link = area === 'admin' ? 'text-blue-700 underline' : 'text-teal-800 underline';
  const headingId = `history-${targetType}-${targetId}`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-3 text-lg font-semibold text-gray-900">
        Lịch sử
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-600">Chưa có phiên bản nào được ghi.</p>
      ) : (
        <ol className="space-y-1 text-sm">
          {items.map((r) => (
            <li key={r.id} className="flex flex-wrap gap-x-2">
              <Link href={historyHref(area, targetType, targetId, r.id)} className={link}>
                {formatTime(r.createdAt)}
              </Link>
              <span className="text-gray-700">
                {SOURCE_LABELS[r.source]}
                {r.actor ? ` · ${r.actor}` : ''}
                {r.patrolled ? '' : ' · chưa kiểm tra'}
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-2 text-sm">
        <Link href={historyHref(area, targetType, targetId)} className={link}>
          Xem toàn bộ lịch sử
        </Link>
      </p>
    </section>
  );
}

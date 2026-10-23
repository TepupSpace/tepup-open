import { redirect } from 'next/navigation';
import { getContributorSession } from '@/lib/admin-auth';
import { parseTargetType, recentChangesScope, viewerOf } from '@/app/api/history/_lib/access';
import RecentChanges from './RecentChanges';
import type { HistoryArea, HistoryTargetType } from './types';

/**
 * Page body for /admin/recent-changes and /contributor/recent-changes (proposal §6.18).
 * Admins and global reviewers see every change; course roles see their courses' lessons
 * and outlines. Query: ?course= (or ?courseId=), ?targetType=, ?unpatrolled=1.
 */
export default async function RecentChangesPage({
  area,
  searchParams,
}: {
  area: HistoryArea;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getContributorSession();
  if (!session) redirect(`/login?callbackUrl=/${area}`);
  const scope = await recentChangesScope(viewerOf(session.user));
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : '');

  return (
    <div className="max-w-6xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Thay đổi gần đây</h1>
        <p className="mt-1 text-sm text-gray-600">
          {scope === null
            ? 'Mọi thay đổi đã lên trang, mới nhất trước.'
            : 'Thay đổi ở bài học và mục lục của các khóa học bạn phụ trách hoặc duyệt, mới nhất trước.'}
        </p>
      </header>
      {scope !== null && scope.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          Bạn chưa có vai trò ở khóa học nào, nên chưa có thay đổi để xem.
        </p>
      ) : (
        <RecentChanges
          area={area}
          initial={{
            courseId: one('course') || one('courseId'),
            targetType: (parseTargetType(one('targetType')) ?? '') as HistoryTargetType | '',
            unpatrolled: one('unpatrolled') === '1',
          }}
        />
      )}
    </div>
  );
}

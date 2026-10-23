import { ClipboardCheck, Clock, ShieldAlert, User } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import type { Viewer } from '@/lib/permissions/course-roles';
import { listReviewRequestsForViewer, type ReviewRequestListScope } from '@/lib/services/review-request-service';
import { NO_OPINION_BADGE, VERDICT_BADGE, VERDICT_LABEL, formatDateTime } from './labels';

/**
 * "Yêu cầu duyệt" queue (server). Mounted at /contributor/review-requests (teal) and
 * /admin/review-requests (blue). The service applies the access rules.
 */
export default async function ReviewRequestList({
  viewer,
  basePath,
  accent,
  scope,
}: {
  viewer: Viewer;
  basePath: string;
  accent: 'teal' | 'blue';
  scope: ReviewRequestListScope;
}) {
  const items = await listReviewRequestsForViewer(viewer, scope);
  const teal = accent === 'teal';
  const tabActive = teal ? 'border-teal-700 text-teal-800' : 'border-blue-600 text-blue-700';
  const focus = teal ? 'focus-visible:ring-teal-700' : 'focus-visible:ring-blue-600';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu duyệt</h1>
        <span className="text-sm text-gray-500">
          {items.length} yêu cầu {scope === 'open' ? 'đang mở' : 'đã đóng (gần đây)'}
        </span>
      </div>
      <p className="mb-4 max-w-3xl text-sm text-gray-600">
        Đội ngũ gửi bài học do mình viết để người duyệt góp ý trước khi xuất bản. Ý kiến của bạn
        chỉ mang tính tư vấn: quản trị viên quyết định xuất bản.
      </p>

      <nav aria-label="Lọc yêu cầu" className="mb-4 flex gap-4 border-b border-gray-200">
        {(['open', 'closed'] as const).map((s) => (
          <Link
            key={s}
            href={s === 'open' ? basePath : `${basePath}?status=closed`}
            aria-current={scope === s ? 'page' : undefined}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 ${focus} ${
              scope === s ? tabActive : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {s === 'open' ? 'Đang mở' : 'Đã đóng'}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <ClipboardCheck className="mx-auto mb-3 h-12 w-12 text-gray-500" aria-hidden="true" />
          <p className="text-gray-500">
            {scope === 'open' ? 'Không có yêu cầu duyệt nào đang mở.' : 'Chưa có yêu cầu nào đã đóng.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => {
            const waiting = r.asked && !r.myVerdict && r.status === 'OPEN';
            return (
              <li key={r.id}>
                <Link
                  href={`${basePath}/${r.id}`}
                  className={`block rounded-xl border bg-white p-5 transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 ${focus} ${
                    r.escalatedAt ? 'border-amber-300' : 'border-gray-100'
                  }`}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {r.escalatedAt && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                        Đã chuyển quản trị viên
                      </span>
                    )}
                    {waiting && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        Chờ ý kiến của bạn
                      </span>
                    )}
                    {r.asked && r.myVerdict && (
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${VERDICT_BADGE[r.myVerdict]}`}>
                        Bạn: {VERDICT_LABEL[r.myVerdict]}
                      </span>
                    )}
                    {!r.asked && (
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${NO_OPINION_BADGE}`}>Chỉ xem</span>
                    )}
                    {r.status === 'CLOSED' && (
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${NO_OPINION_BADGE}`}>
                        {r.published ? 'Đã xuất bản đúng bản này' : 'Đã đóng'}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{r.courseName}</span>
                  </div>
                  <h2 className="font-semibold text-gray-900">{r.lessonName}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {r.requestedBy && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" aria-hidden="true" />
                        {r.requestedBy}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatDateTime(r.createdAt)}
                    </span>
                    <span>
                      {r.reviewers.filter((x) => x.verdict === 'ENDORSED').length} đồng ý ·{' '}
                      {r.reviewers.filter((x) => x.verdict === 'CHANGES_SUGGESTED').length} cần sửa ·{' '}
                      {r.reviewers.filter((x) => !x.verdict).length} chưa trả lời
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

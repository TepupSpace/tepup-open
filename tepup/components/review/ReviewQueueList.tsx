import Link from '@/components/ui/AppLink';
import { AlertTriangle, CheckSquare, Clock, Star, User } from 'lucide-react';
import type { ReviewQueueItem } from '@/lib/services/review-queue-service';
import { ROLE_LABEL } from '@/lib/terms';

/**
 * The list of contributions waiting for review, shared by /contributor/reviews (teal) and
 * /admin/reviews (blue). Data comes from getReviewQueue (already filtered per viewer).
 */
export default function ReviewQueueList({
  items,
  variant,
  headingLevel = 2,
}: {
  items: ReviewQueueItem[];
  variant: 'contributor' | 'admin';
  headingLevel?: 2 | 3;
}) {
  const admin = variant === 'admin';
  const hrefBase = admin ? '/admin/reviews' : '/contributor/reviews';
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <CheckSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" aria-hidden="true" />
        <p className="text-gray-500">Không có đóng góp nào cần duyệt.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li key={c.id}>
          <Link
            href={`${hrefBase}/${c.id}`}
            className={`block bg-white rounded-xl border p-5 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 ${
              c.escalatedAt ? 'border-red-300' : 'border-gray-100'
            } ${admin ? 'hover:border-blue-200 focus-visible:ring-blue-600' : 'hover:border-teal-200 focus-visible:ring-teal-700'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {c.escalatedAt ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      Đã chuyển quản trị viên
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      Chờ duyệt
                    </span>
                  )}
                  {c.trustedAuthor && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                      <Star className="w-3 h-3" aria-hidden="true" />
                      {ROLE_LABEL.TRUSTED_AUTHOR}
                    </span>
                  )}
                  <span className="text-xs text-gray-600">{c.typeLabel}</span>
                  {c.courseName && c.type !== 'EDIT_COURSE' && (
                    <span className="text-xs text-gray-600">· {c.courseName}</span>
                  )}
                  {c.own && <span className="text-xs text-gray-600">· Đề xuất của bạn</span>}
                </div>
                <Heading className="font-semibold text-gray-900 break-words">{c.title}</Heading>
                {c.escalatedAt && c.escalationNote && (
                  <p className="mt-1 text-xs text-red-800 whitespace-pre-wrap break-words">
                    Lý do chuyển: {c.escalationNote}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" aria-hidden="true" />
                    {c.contributorName}
                  </span>
                  {c.submittedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {c.submittedAt.toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-sm font-medium shrink-0 ${admin ? 'text-blue-700' : 'text-teal-700'}`} aria-hidden="true">
                Xem chi tiết →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

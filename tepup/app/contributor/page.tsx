import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { Bell, ClipboardCheck, Lightbulb, MessageSquare, PlusCircle, Search, ShieldCheck, Star } from 'lucide-react';
import CourseRolesCard from '@/components/contributor/dashboard/CourseRolesCard';
import WaitingForYou, { type WaitingItem } from '@/components/contributor/dashboard/WaitingForYou';
import { contributionTypeLabel } from '@/lib/contribution-labels';
import { describeProposalTargets } from '@/lib/services/proposal-service';
import { pendingRequestsForReviewer } from '@/lib/services/review-request-service';
import { getReviewQueue } from '@/lib/services/review-queue-service';
import { countVisibleUnread, UNREAD_SCAN_LIMIT } from '@/lib/services/notification-render';
import { listClaimableSuggestions } from '@/app/api/contributor/suggestions/claimable/list-claimable';
import { ROLE_LABEL } from '@/lib/terms';

export const metadata = { title: 'Bảng điều khiển' };

const DETAILS_SHOWN = 5;

export default async function ContributorDashboard() {
  const session = await requireContributor();
  const userId = session.user.id;
  const role = session.user.role as UserRole;
  const viewer = { id: userId, role };

  const [
    draftCount,
    changesRequested,
    pendingCount,
    approvedCount,
    rejectedCount,
    courseRoleCount,
    reviewRequests,
    queue,
    unread,
    claimable,
  ] = await Promise.all([
    prisma.contribution.count({ where: { contributorId: userId, status: 'DRAFT' } }),
    prisma.contribution.findMany({
      where: { contributorId: userId, status: 'CHANGES_REQUESTED' },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, data: true, type: true, status: true, targetId: true, baseUpdatedAt: true, baseSnapshot: true },
    }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'PENDING_REVIEW' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'APPROVED' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'REJECTED' } }),
    prisma.courseMember.count({ where: { userId } }),
    // Same sources as the linked pages: review-request inbox, review queue, notifications, suggestions.
    pendingRequestsForReviewer(userId, role, DETAILS_SHOWN),
    getReviewQueue(viewer),
    countVisibleUnread(viewer),
    listClaimableSuggestions(viewer),
  ]);
  const changesCount = changesRequested.length;

  // Edit proposals are named by their target ("Chỉnh sửa bài học: X"), new courses by their name.
  const targets = await describeProposalTargets(viewer, changesRequested);
  const nameOf = (c: { id: string; type: string; data: unknown }) => {
    const target = targets.get(c.id);
    if (target) return `${contributionTypeLabel(c.type)}: ${target.name}`;
    return ((c.data as { course?: { name?: unknown } } | null)?.course?.name as string | undefined) || 'Chưa đặt tên';
  };

  // Proposals by others this user may decide (the queue page also lists a global reviewer's own ones).
  const toReview = queue.items.filter((i) => !i.own);
  const myClaims = claimable.filter((s) => s.claim.state === 'mine');
  const freeSuggestions = claimable.filter((s) => s.claim.state === 'free').length;

  const waiting: WaitingItem[] = [
    {
      key: 'review-requests',
      Icon: ClipboardCheck,
      count: reviewRequests.count,
      label: 'yêu cầu duyệt chờ ý kiến của bạn',
      href: '/contributor/review-requests',
      action: 'Mở yêu cầu duyệt',
      details: reviewRequests.items.map((r) => ({
        id: r.id,
        href: `/contributor/review-requests/${r.id}`,
        text: r.lessonName,
        context: r.courseName || null,
      })),
    },
    {
      key: 'reviews',
      Icon: ShieldCheck,
      count: toReview.length,
      label: queue.scope === 'ALL' ? 'đề xuất chờ bạn duyệt' : 'đề xuất cho khóa bạn phụ trách chờ bạn duyệt',
      href: '/contributor/reviews',
      action: 'Mở hàng duyệt',
      details: toReview.slice(0, DETAILS_SHOWN).map((i) => ({
        id: i.id,
        href: `/contributor/reviews/${i.id}`,
        text: `${i.typeLabel}: ${i.title}`,
        context: i.courseName && i.courseName !== i.title ? i.courseName : null,
      })),
    },
    {
      key: 'changes-requested',
      Icon: MessageSquare,
      count: changesCount,
      label: 'đề xuất của bạn được yêu cầu chỉnh sửa',
      href: '/contributor/drafts',
      action: 'Xem bản nháp',
      details: changesRequested.slice(0, DETAILS_SHOWN).map((c) => ({
        id: c.id,
        href: `/contributor/contributions/${c.id}/edit`,
        text: nameOf(c),
      })),
    },
    {
      key: 'my-claims',
      Icon: Lightbulb,
      count: myClaims.length,
      label: 'góp ý của người đọc bạn đang nhận làm',
      href: '/contributor/suggestions',
      action: 'Xem góp ý',
      details: myClaims.slice(0, DETAILS_SHOWN).map((s) => ({
        id: s.id,
        href: s.claim.myProposalId ? `/contributor/contributions/${s.claim.myProposalId}/edit` : '/contributor/suggestions',
        text: s.target.title,
        context: s.target.context || null,
      })),
    },
    {
      key: 'notifications',
      Icon: Bell,
      count: unread,
      label: unread >= UNREAD_SCAN_LIMIT ? 'thông báo chưa đọc trở lên' : 'thông báo chưa đọc',
      href: '/contributor/notifications',
      action: 'Mở thông báo',
    },
  ];
  // Open suggestions anyone may take on: only offered when nothing else is waiting.
  if (waiting.every((w) => w.count === 0)) {
    waiting.push({
      key: 'claimable',
      Icon: Lightbulb,
      count: freeSuggestions,
      label: 'góp ý của người đọc đã được chấp nhận, chưa có người nhận làm',
      href: '/contributor/suggestions',
      action: 'Nhận làm một góp ý',
    });
  }

  const ownStats = [
    { key: 'drafts', label: 'Bản nháp', count: draftCount, href: '/contributor/drafts' },
    { key: 'pending', label: 'Đang chờ người khác duyệt', count: pendingCount, href: '/contributor/submissions' },
    { key: 'changes', label: 'Cần bạn sửa', count: changesCount, href: '/contributor/drafts' },
    { key: 'approved', label: 'Đã duyệt', count: approvedCount, href: '/contributor/submissions' },
    { key: 'rejected', label: 'Bị từ chối', count: rejectedCount, href: '/contributor/submissions' },
  ];
  const isNewcomer = ownStats.every((s) => s.count === 0);

  // Access level box: only for members without a course role or global review power.
  const showAccessLevel = courseRoleCount === 0 && (role === 'AUTHOR' || role === 'TRUSTED_AUTHOR');

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/contributor/courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors font-medium text-sm"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            Tìm bài để sửa
          </Link>
          <Link
            href="/contributor/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teal-800 border border-teal-200 rounded-xl hover:bg-teal-50 transition-colors font-medium text-sm"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            Tạo khóa học mới
          </Link>
        </div>
      </div>

      {/* Quick start for brand-new contributors. */}
      {isNewcomer && (
        <div className="mb-8 rounded-xl border border-teal-100 bg-teal-50 p-5">
          <h2 className="font-semibold text-gray-900">Bắt đầu đóng góp</h2>
          <p className="mt-1 text-sm text-gray-700">
            Chọn một bài trong &ldquo;Tìm bài để sửa&rdquo; và đề xuất chỉnh sửa, hoặc tạo khóa học mới. Chưa rõ cách làm?{' '}
            <Link href="/contributor-guide" className="font-medium text-teal-800 underline underline-offset-2">
              Đọc hướng dẫn
            </Link>
            .
          </p>
        </div>
      )}

      <WaitingForYou items={waiting} />

      {/* The user's own contributions: one compact row. */}
      <section aria-labelledby="own-contributions-title" className="mb-8">
        <h2 id="own-contributions-title" className="text-lg font-semibold text-gray-900 mb-3">
          Đóng góp của bạn
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ownStats.map((s) => (
            <li key={s.key}>
              <Link
                href={s.href}
                className={`block h-full rounded-lg border bg-white px-3 py-2 hover:shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  s.key === 'changes' && s.count > 0 ? 'border-amber-300' : 'border-gray-100'
                }`}
                data-testid={`own-stat-${s.key}`}
              >
                <span className="block text-xl font-bold text-gray-900">{s.count}</span>
                <span className="block text-xs text-gray-600">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mb-8">
        <CourseRolesCard userId={userId} />
      </div>

      {/* Access level: promotion is a manual admin decision (auto-promotion was removed). */}
      {showAccessLevel && (
        <section aria-labelledby="access-level-title" className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
          <h2 id="access-level-title" className="font-semibold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-teal-700" aria-hidden="true" />
            Cấp truy cập: <span className="text-teal-800">{ROLE_LABEL[role]}</span>
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {role === 'AUTHOR'
              ? `Lên ${ROLE_LABEL.TRUSTED_AUTHOR.toLocaleLowerCase('vi')} do ban quản trị xét theo các đóng góp đã duyệt (bạn có ${approvedCount}).`
              : 'Đề xuất của bạn được ưu tiên trong hàng duyệt.'}
          </p>
        </section>
      )}

      {/* Feature requests: the only feedback channel to the team. */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" aria-hidden="true" />
            Thiếu công cụ bạn cần?
          </h2>
          <p className="text-sm text-gray-600 mt-1">Gửi đề xuất tính năng hoặc báo chỗ khó dùng cho đội ngũ Tépup.</p>
        </div>
        <Link
          href="/feature-request"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 text-sm font-medium"
        >
          Đề xuất tính năng
        </Link>
      </div>
    </div>
  );
}

import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { getRoleDisplayName } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { FileEdit, Send, CheckCircle, XCircle, PlusCircle, Star, MessageSquare, Lightbulb } from 'lucide-react';

export default async function ContributorDashboard() {
  const session = await requireContributor();
  const userId = session.user.id;
  const role = session.user.role as UserRole;

  const [draftCount, changesRequested, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.contribution.count({ where: { contributorId: userId, status: 'DRAFT' } }),
    prisma.contribution.findMany({
      where: { contributorId: userId, status: 'CHANGES_REQUESTED' },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, data: true },
    }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'PENDING_REVIEW' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'APPROVED' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'REJECTED' } }),
  ]);
  const changesCount = changesRequested.length;
  const nameOf = (data: unknown) =>
    ((data as { course?: { name?: unknown } } | null)?.course?.name as string | undefined) || 'Chưa đặt tên';

  const showPromotionNote = role === 'CONTRIBUTOR';
  const card = 'bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/contributor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Tạo khóa học mới
        </Link>
      </div>

      {/* Reviewer asked for changes: the most important thing on this page. */}
      {changesCount > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5" data-testid="changes-requested-banner">
          <h2 className="flex items-center gap-2 font-semibold text-amber-900">
            <MessageSquare className="w-5 h-5" />
            Người duyệt yêu cầu chỉnh sửa {changesCount} đóng góp
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            Mở đóng góp để đọc góp ý (hiện ngay trong trình soạn), sửa rồi bấm &ldquo;Gửi lại&rdquo;.
          </p>
          <ul className="mt-3 space-y-1">
            {changesRequested.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contributor/contributions/${c.id}/edit`}
                  className="text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700"
                >
                  {nameOf(c.data)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Link href="/contributor/drafts" className={`${card} border-gray-100`}>
          <div className="flex items-center gap-3 mb-2">
            <FileEdit className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Bản nháp</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
        </Link>

        <Link
          href="/contributor/drafts"
          className={`${card} ${changesCount > 0 ? 'border-amber-300 bg-amber-50' : 'border-gray-100'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-gray-600">Cần chỉnh sửa</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{changesCount}</p>
        </Link>

        <Link href="/contributor/submissions" className={`${card} border-gray-100`}>
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-600">Chờ duyệt</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
        </Link>

        <Link href="/contributor/submissions" className={`${card} border-gray-100`}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-600">Đã duyệt</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
        </Link>

        <Link href="/contributor/submissions" className={`${card} border-gray-100`}>
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-600">Bị từ chối</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
        </Link>
      </div>

      {/* Trust level: promotion is a manual admin decision (auto-promotion was removed). */}
      {showPromotionNote && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-teal-500" />
            Cấp độ của bạn
          </h2>
          <p className="text-sm text-gray-600">
            Cấp hiện tại: <span className="font-semibold text-teal-600">{getRoleDisplayName(role)}</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Việc thăng cấp lên Trusted Contributor do ban quản trị xem xét dựa trên các đóng góp đã được duyệt
            (bạn đang có {approvedCount}); hệ thống không tự động thăng cấp.
          </p>
        </div>
      )}

      {/* Feature requests: the only feedback channel to the team. */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
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

      {/* Quick start guide for new contributors */}
      {draftCount === 0 && changesCount === 0 && pendingCount === 0 && approvedCount === 0 && (
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Bắt đầu đóng góp</h2>
          <p className="text-sm text-gray-600 mb-4">
            Chào mừng bạn! Để bắt đầu, hãy tạo khóa học đầu tiên hoặc đọc hướng dẫn chi tiết.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contributor/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo khóa học
            </Link>
            <Link
              href="/contributor-guide"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 text-sm font-medium"
            >
              Đọc hướng dẫn
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

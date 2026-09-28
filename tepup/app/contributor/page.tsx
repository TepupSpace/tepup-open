import { requireContributor } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { getRoleDisplayName } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';
import Link from '@/components/ui/AppLink';
import { FileEdit, Send, CheckCircle, XCircle, PlusCircle, Star } from 'lucide-react';

export default async function ContributorDashboard() {
  const session = await requireContributor();
  const userId = session.user.id;
  const role = session.user.role as UserRole;

  const [draftCount, pendingCount, approvedCount, rejectedCount, user] = await Promise.all([
    prisma.contribution.count({ where: { contributorId: userId, status: 'DRAFT' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'PENDING_REVIEW' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'APPROVED' } }),
    prisma.contribution.count({ where: { contributorId: userId, status: 'REJECTED' } }),
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
  ]);

  const accountAgeDays = user
    ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const PROMOTE_THRESHOLD = 5;
  const PROMOTE_DAYS = 7;
  const showProgress = role === 'CONTRIBUTOR';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/contributor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Tạo khóa học mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/contributor/drafts" className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <FileEdit className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Bản nháp</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
        </Link>

        <Link href="/contributor/submissions" className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-600">Chờ duyệt</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
        </Link>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-600">Đã duyệt</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-600">Bị từ chối</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
        </div>
      </div>

      {/* Trust level progress */}
      {showProgress && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-teal-500" />
            Tiến trình thăng cấp
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Cấp hiện tại: <span className="font-semibold text-teal-600">{getRoleDisplayName(role)}</span>
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Đóng góp được duyệt</span>
                <span className="font-medium text-gray-900">{approvedCount}/{PROMOTE_THRESHOLD}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (approvedCount / PROMOTE_THRESHOLD) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tuổi tài khoản</span>
                <span className="font-medium text-gray-900">{accountAgeDays}/{PROMOTE_DAYS} ngày</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (accountAgeDays / PROMOTE_DAYS) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Đạt đủ điều kiện → tự động thăng cấp lên Trusted Contributor
          </p>
        </div>
      )}

      {/* Quick start guide for new contributors */}
      {draftCount === 0 && approvedCount === 0 && (
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Bắt đầu đóng góp</h2>
          <p className="text-sm text-gray-600 mb-4">
            Chào mừng bạn! Để bắt đầu, hãy tạo khóa học đầu tiên hoặc đọc hướng dẫn chi tiết.
          </p>
          <div className="flex gap-3">
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

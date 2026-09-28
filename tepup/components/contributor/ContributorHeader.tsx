'use client';

import { signOut, useSession } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import { getRoleDisplayName } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';

const ROLE_BADGE_COLORS: Record<string, string> = {
  CONTRIBUTOR: 'bg-gray-100 text-gray-700',
  TRUSTED_CONTRIBUTOR: 'bg-teal-100 text-teal-700',
  REVIEWER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-amber-100 text-amber-700',
};

export default function ContributorHeader() {
  const { data: session } = useSession();
  const role = (session?.user?.role || 'CONTRIBUTOR') as UserRole;
  const displayName = session?.user?.username || session?.user?.name || 'Contributor';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Khu vực Contributor
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* View site link */}
        <Link
          href="/"
          target="_blank"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Xem trang chủ
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-teal-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.CONTRIBUTOR}`}>
                {getRoleDisplayName(role)}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

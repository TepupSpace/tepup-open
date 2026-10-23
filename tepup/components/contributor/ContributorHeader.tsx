'use client';

import { signOut, useSession } from 'next-auth/react';
import { ExternalLink, LogOut, User } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import ReaderSettings from '@/components/reader/ReaderSettings';
import NotificationBell from '@/components/notifications/NotificationBell';
import { ROLE_LABEL, TERMS } from '@/lib/terms';
import type { UserRole } from '@prisma/client';

const ROLE_BADGE_COLORS: Record<string, string> = {
  AUTHOR: 'bg-gray-100 text-gray-700',
  TRUSTED_AUTHOR: 'bg-teal-100 text-teal-800',
  REVIEWER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-amber-100 text-amber-800',
};

/** Course roles (maintainer, trusted reviewer) get the teal badge. */
const COURSE_ROLE_BADGE_COLORS = 'bg-teal-100 text-teal-800';

export default function ContributorHeader({
  badge,
  badgeIsCourseRole = false,
}: {
  /** Text under the name, computed server-side with roleBadge() (course roles included). */
  badge?: string;
  badgeIsCourseRole?: boolean;
}) {
  const { data: session } = useSession();
  const role = (session?.user?.role || 'AUTHOR') as UserRole;
  const displayName = session?.user?.username || session?.user?.name || TERMS.Contributor;
  const badgeText = badge ?? ROLE_LABEL[role] ?? ROLE_LABEL.AUTHOR;
  const badgeColors = badgeIsCourseRole
    ? COURSE_ROLE_BADGE_COLORS
    : ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.AUTHOR;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-3 pl-16 pr-4 sm:pr-6 lg:px-6">
      <div className="min-w-0">
        {/* Not a heading: each page has its own single <h1>. */}
        <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{TERMS.area}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        {/* View site link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          Xem trang chủ
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">(mở trong thẻ mới)</span>
        </Link>

        {/* Reading settings: light/dark, font, text size */}
        <ReaderSettings />
        <NotificationBell />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-teal-700" aria-hidden="true" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              {/* Long course names truncate visually; the full text stays in the DOM for screen readers. */}
              <span
                title={badgeText}
                className={`inline-block max-w-[18rem] truncate align-bottom text-xs px-2 py-0.5 rounded-full font-medium ${badgeColors}`}
              >
                {badgeText}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

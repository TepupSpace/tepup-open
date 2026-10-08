'use client';

import { signOut, useSession } from 'next-auth/react';
import { ExternalLink, LogOut, User } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import ReaderSettings from '@/components/reader/ReaderSettings';

export default function AdminHeader() {
  const { data: session } = useSession();
  const name = session?.user?.name || 'Admin';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-4 pl-16 pr-6 lg:pl-6">
      {/* Not a heading: every admin page has its own <h1> (one h1 per screen). */}
      <p className="text-lg font-semibold text-gray-900 truncate">Quản trị Tepup</p>

      <div className="flex items-center gap-4">
        {/* View site link: opens a new tab, so say so (WCAG 3.2.5 advisory, G201). */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md text-sm text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Xem trang chủ
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">(mở trong thẻ mới)</span>
        </Link>

        {/* Tuỳ chọn đọc (sáng/tối, phông, cỡ chữ): admin và trình soạn bài đều theo. */}
        <ReaderSettings />

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {session?.user?.image ? (
                // The name is written next to it (or in the sign-out label), so the photo is decorative.
                // eslint-disable-next-line @next/next/no-img-element -- avatar from the auth provider, any host
                <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-blue-700" aria-hidden="true" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={`Đăng xuất (${name})`}
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

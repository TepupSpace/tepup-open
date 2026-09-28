'use client';

import Link from '@/components/ui/AppLink';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  FileEdit,
  Send,
  PlusCircle,
  CheckSquare,
  BookOpen,
  Settings,
  Bot,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { canReviewContent } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';

const allMenuItems = [
  {
    title: 'Dashboard',
    href: '/contributor',
    icon: LayoutDashboard,
    minRole: 'CONTRIBUTOR' as UserRole,
  },
  {
    title: 'Bản nháp',
    href: '/contributor/drafts',
    icon: FileEdit,
    minRole: 'CONTRIBUTOR' as UserRole,
  },
  {
    title: 'Đã gửi',
    href: '/contributor/submissions',
    icon: Send,
    minRole: 'CONTRIBUTOR' as UserRole,
  },
  {
    title: 'Tạo khóa học mới',
    href: '/contributor/courses/new',
    icon: PlusCircle,
    minRole: 'CONTRIBUTOR' as UserRole,
  },
  {
    title: 'Dùng AI của bạn',
    href: '/contributor/ai-guide',
    icon: Bot,
    minRole: 'CONTRIBUTOR' as UserRole,
  },
  {
    title: 'Duyệt nội dung',
    href: '/contributor/reviews',
    icon: CheckSquare,
    minRole: 'REVIEWER' as UserRole,
  },
];

export default function ContributorSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user?.role || 'CONTRIBUTOR') as UserRole;

  const menuItems = allMenuItems.filter((item) => {
    if (item.minRole === 'REVIEWER') return canReviewContent(userRole);
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setCollapsed(true)}
      />

      {/* Mobile menu button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href="/contributor" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-gray-900">Contributor</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 text-gray-500 transition-transform ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/contributor' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-1">
          <Link
            href="/contributor-guide"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-gray-600 hover:bg-gray-50`}
            title={collapsed ? 'Hướng dẫn' : undefined}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Hướng dẫn</span>}
          </Link>
          <Link
            href="/contributor/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              pathname === '/contributor/settings'
                ? 'bg-teal-50 text-teal-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={collapsed ? 'Cài đặt' : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Cài đặt</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}

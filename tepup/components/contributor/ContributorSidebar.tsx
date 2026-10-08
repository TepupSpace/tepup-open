'use client';

import Link from '@/components/ui/AppLink';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FocusTrap from 'focus-trap-react';
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
import { useRef, useState } from 'react';
import { canReviewContent } from '@/lib/role-utils';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import type { UserRole } from '@prisma/client';

const allMenuItems = [
  {
    title: 'Bảng điều khiển',
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

const linkBase =
  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700';
const linkActive = 'bg-teal-50 text-teal-800';
const linkIdle = 'text-gray-600 hover:bg-gray-50';

export default function ContributorSidebar() {
  const pathname = usePathname();
  // Desktop (lg+): the sidebar is always visible, `collapsed` narrows it to icons.
  // Mobile: it is a drawer, closed by default and closed again after every navigation.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  // Close the drawer when the route changes (a link was tapped). Adjusting state while
  // rendering, as React recommends, instead of an effect.
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    if (mobileOpen) setMobileOpen(false);
  }
  const closeMobile = () => setMobileOpen(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // The closed drawer sits off-screen: `inert` keeps its links out of the Tab order and away
  // from screen readers. On desktop the sidebar is always shown, so it is never inert there.
  const drawerOpen = mobileOpen && !isDesktop;
  const drawerHidden = !isDesktop && !mobileOpen;
  const navRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();
  const userRole = (session?.user?.role || 'CONTRIBUTOR') as UserRole;

  const menuItems = allMenuItems.filter((item) => {
    if (item.minRole === 'REVIEWER') return canReviewContent(userRole);
    return true;
  });

  // Collapsed on desktop: only the icons show, the labels stay for screen readers.
  const labelClass = `font-medium ${collapsed ? 'lg:sr-only' : ''}`;

  return (
    <>
      {/* Mobile overlay: a mouse/touch shortcut to close; Escape and the menu button cover everyone else. */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
        aria-hidden
      />

      {/* Open drawer: Tab stays inside (menu button + drawer), focus starts on the first link,
          Escape closes and focus goes back to the menu button. Off on desktop and while closed. */}
      <FocusTrap
        active={drawerOpen}
        focusTrapOptions={{
          allowOutsideClick: true,
          initialFocus: () => navRef.current?.querySelector<HTMLElement>('a') ?? false,
          onDeactivate: closeMobile,
        }}
      >
        <div>
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
            aria-controls="contributor-sidebar"
            className="fixed top-3 left-3 z-50 lg:hidden p-2 bg-white text-gray-700 rounded-lg shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Sidebar */}
          <aside
            id="contributor-sidebar"
            aria-label="Thanh bên cộng tác viên"
            inert={drawerHidden}
            className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-all duration-300 lg:translate-x-0 ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <Link
                href="/contributor"
                onClick={closeMobile}
                className="flex items-center gap-2 ml-10 lg:ml-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <span className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl" aria-hidden="true">T</span>
                  <span className="sr-only">Tepup</span>
                </span>
                <span className={`font-bold text-gray-900 ${collapsed ? 'lg:sr-only' : ''}`}>Cộng tác viên</span>
              </Link>
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
                aria-expanded={!collapsed}
                aria-controls="contributor-sidebar"
                className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className={`w-5 h-5 text-gray-600 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Navigation */}
            <nav ref={navRef} aria-label="Khu cộng tác viên" className="p-4 space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/contributor' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    <span className={labelClass}>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom links */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-1">
              <Link
                href="/contributor-guide"
                onClick={closeMobile}
                className={`${linkBase} ${linkIdle}`}
                title={collapsed ? 'Hướng dẫn' : undefined}
              >
                <BookOpen className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className={labelClass}>Hướng dẫn</span>
              </Link>
              <Link
                href="/contributor/settings"
                onClick={closeMobile}
                aria-current={pathname === '/contributor/settings' ? 'page' : undefined}
                className={`${linkBase} ${pathname === '/contributor/settings' ? linkActive : linkIdle}`}
                title={collapsed ? 'Cài đặt' : undefined}
              >
                <Settings className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className={labelClass}>Cài đặt</span>
              </Link>
            </div>
          </aside>
        </div>
      </FocusTrap>
    </>
  );
}

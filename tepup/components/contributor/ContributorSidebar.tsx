'use client';

import Link from '@/components/ui/AppLink';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FocusTrap from 'focus-trap-react';
import {
  LayoutDashboard,
  FileEdit,
  Search,
  CheckSquare,
  BookOpen,
  Settings,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { canReviewContent } from '@/lib/role-utils';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { TERMS } from '@/lib/terms';
import type { UserRole } from '@prisma/client';

/**
 * Few items, grouped by task (onboarding feedback 2026-10-20). Each item covers several
 * pages (`routes`), reached through the tabs at the top of those pages (SectionTabs).
 * `reviewers` = global reviewers or holders of a course role (computed in the layout);
 * the pages themselves check permissions again. Notifications live in the header bell,
 * "Tạo khóa học mới" is a button on the "Tìm bài để sửa" pages and the dashboard.
 */
type Audience = 'all' | 'reviewers';
type MenuItem = { title: string; href: string; icon: typeof LayoutDashboard; show: Audience; routes: string[] };
const allMenuItems: MenuItem[] = [
  { title: 'Tổng quan', href: '/contributor', icon: LayoutDashboard, show: 'all', routes: ['/contributor'] },
  {
    title: 'Đóng góp của tôi',
    href: '/contributor/drafts',
    icon: FileEdit,
    show: 'all',
    routes: ['/contributor/drafts', '/contributor/submissions', '/contributor/contributions'],
  },
  {
    title: 'Tìm bài để sửa',
    href: '/contributor/courses',
    icon: Search,
    show: 'all',
    routes: [
      '/contributor/courses',
      '/contributor/suggestions',
      '/contributor/lessons',
      '/contributor/chapters',
      '/contributor/library',
      '/contributor/ai-guide',
    ],
  },
  {
    title: 'Việc duyệt',
    href: '/contributor/reviews',
    icon: CheckSquare,
    show: 'reviewers',
    routes: [
      '/contributor/reviews',
      '/contributor/review-requests',
      '/contributor/recent-changes',
      '/contributor/flags',
      '/contributor/maintain',
    ],
  },
];

const bottomItems: MenuItem[] = [
  { title: 'Hướng dẫn', href: '/contributor-guide', icon: BookOpen, show: 'all', routes: ['/contributor-guide'] },
  { title: 'Cài đặt', href: '/contributor/settings', icon: Settings, show: 'all', routes: ['/contributor/settings'] },
];

/** Length of the longest route of `item` that contains `pathname` (0 = none). '/contributor' matches only itself. */
function matchLength(item: MenuItem, pathname: string): number {
  let best = 0;
  for (const r of item.routes) {
    const hit = r === '/contributor' ? pathname === r : pathname === r || pathname.startsWith(r + '/');
    if (hit && r.length > best) best = r.length;
  }
  return best;
}

const linkBase =
  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700';
const linkActive = 'bg-teal-50 text-teal-800';
const linkIdle = 'text-gray-600 hover:bg-gray-50';

// `isTrustedReviewer` is still passed by the layout; the "Yêu cầu duyệt" tab uses the same rule
// on the server (ReviewSectionTabs), so the sidebar no longer needs it.
export default function ContributorSidebar({
  hasCourseRole = false,
}: {
  /** Maintainer or trusted reviewer of at least one course. */
  hasCourseRole?: boolean;
  /** Trusted reviewer of at least one course (receives "Gửi người duyệt"). */
  isTrustedReviewer?: boolean;
}) {
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
  const userRole = (session?.user?.role || 'AUTHOR') as UserRole;

  const globalReviewer = canReviewContent(userRole);
  const menuItems = allMenuItems.filter((item) => item.show === 'all' || globalReviewer || hasCourseRole);

  // The item whose routes contain the current page most specifically is the active one.
  let activeHref: string | undefined;
  let bestLength = 0;
  for (const item of [...menuItems, ...bottomItems]) {
    const len = matchLength(item, pathname);
    if (len > bestLength) {
      bestLength = len;
      activeHref = item.href;
    }
  }

  // Collapsed on desktop: only the icons show, the labels stay for screen readers.
  const labelClass = `font-medium ${collapsed ? 'lg:sr-only' : ''}`;

  const renderItem = (item: MenuItem) => {
    const isActive = item.href === activeHref;
    const Icon = item.icon;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={closeMobile}
          aria-current={isActive ? 'page' : undefined}
          className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
          title={collapsed ? item.title : undefined}
        >
          <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span className={labelClass}>{item.title}</span>
        </Link>
      </li>
    );
  };

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
            aria-label={`Thanh bên ${TERMS.area}`}
            inert={drawerHidden}
            className={`fixed top-0 left-0 h-full w-64 flex flex-col bg-white border-r border-gray-200 z-50 transition-all duration-300 lg:translate-x-0 ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
          >
            {/* Logo */}
            <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200">
              <Link
                href="/contributor"
                onClick={closeMobile}
                className="flex items-center gap-2 ml-10 lg:ml-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <span className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl" aria-hidden="true">T</span>
                  <span className="sr-only">Tepup</span>
                </span>
                <span className={`font-bold text-gray-900 ${collapsed ? 'lg:sr-only' : ''}`}>{TERMS.area}</span>
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

            {/* Navigation: takes the free height and scrolls on its own, so it never runs under
                the bottom group (the bottom group is in normal flow, not absolute). */}
            <nav ref={navRef} aria-label={TERMS.area} className="flex-1 min-h-0 overflow-y-auto p-4">
              <ul className="space-y-1">{menuItems.map(renderItem)}</ul>
            </nav>

            {/* Bottom group */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <ul className="space-y-1">{bottomItems.map(renderItem)}</ul>
            </div>
          </aside>
        </div>
      </FocusTrap>
    </>
  );
}

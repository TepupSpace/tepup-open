'use client';

import Link from '@/components/ui/AppLink';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  FolderTree,
  BookOpen,
  Library,
  Users,
  BookMarked,
  Settings,
  ChevronLeft,
  Menu,
  X,
  CheckSquare,
  UserCog,
  Lightbulb,
  Puzzle,
  Bot,
} from 'lucide-react';
import { useId, useRef, useState, useSyncExternalStore } from 'react';
import FocusTrap from 'focus-trap-react';
import { canReviewContent } from '@/lib/role-utils';
import type { UserRole } from '@prisma/client';

// Nhóm menu theo chức năng. `label: null` = nhóm không có tiêu đề (nằm trên cùng).
// `hidden: true` = ẩn khỏi sidebar nhưng route vẫn truy cập được trực tiếp.
const menuGroups = [
  {
    label: null,
    items: [
      {
        title: 'Bảng điều khiển',
        href: '/admin',
        icon: LayoutDashboard,
        minRole: 'USER' as const,
      },
      {
        title: 'Duyệt nội dung',
        href: '/admin/reviews',
        icon: CheckSquare,
        minRole: 'REVIEWER' as const,
      },
    ],
  },
  {
    label: 'Nội dung truyện',
    items: [
      {
        title: 'Nhân vật',
        href: '/admin/characters',
        icon: Users,
        minRole: 'ADMIN' as const,
      },
      {
        title: 'Câu chuyện',
        href: '/admin/stories',
        icon: BookMarked,
        minRole: 'ADMIN' as const,
      },
    ],
  },
  {
    label: 'Nội dung học',
    items: [
      {
        title: 'Danh mục',
        href: '/admin/categories',
        icon: FolderTree,
        minRole: 'ADMIN' as const,
      },
      {
        title: 'Khóa học',
        href: '/admin/courses',
        icon: BookOpen,
        minRole: 'ADMIN' as const,
      },
      {
        title: 'Thư viện',
        href: '/admin/library',
        icon: Library,
        minRole: 'ADMIN' as const,
      },
      {
        title: 'Dùng AI của bạn',
        href: '/contributor/ai-guide',
        icon: Bot,
        minRole: 'ADMIN' as const,
      },
      {
        title: 'Trình tạo block',
        href: '/admin/custom-blocks',
        icon: Puzzle,
        minRole: 'ADMIN' as const,
        hidden: true,
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        title: 'Người dùng',
        href: '/admin/users',
        icon: UserCog,
        minRole: 'ADMIN' as const,
      },
      {
        title: 'Yêu cầu tính năng',
        href: '/admin/feature-requests',
        icon: Lightbulb,
        minRole: 'ADMIN' as const,
      },
    ],
  },
];

/** Same breakpoint as Tailwind's `lg:`: from here the sidebar is always shown. */
const DESKTOP_QUERY = '(min-width: 1024px)';

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Server render assumes desktop; phones correct it right after hydration. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';

/**
 * Admin sidebar.
 * - Desktop (lg+): always shown; the chevron collapses it to icons only (names stay as
 *   sr-only text and tooltips).
 * - Small screens: an off-canvas drawer. Closed, it is `inert`, so its links leave the
 *   Tab order. Open, focus moves in and is trapped; Escape, the close button or a click on
 *   the backdrop closes it and focus returns to the menu button.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user?.role || 'USER') as UserRole;
  const asideId = useId();
  const navId = useId();
  const groupId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Icons-only mode exists on desktop only; the phone drawer always shows names.
  const iconsOnly = isDesktop && collapsed;
  const drawerOpen = !isDesktop && mobileOpen;

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if ('hidden' in item && item.hidden) return false;
        if (item.minRole === 'ADMIN') return userRole === 'ADMIN';
        if (item.minRole === 'REVIEWER') return canReviewContent(userRole);
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${focusRing} ${
      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
    }`;

  // Following a link on a phone closes the drawer (the page changes underneath it).
  const closeDrawer = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile backdrop: purely visual. A click on it closes the drawer through the focus
          trap's clickOutsideDeactivates. */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile menu button */}
      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Mở menu quản trị"
        aria-expanded={drawerOpen}
        aria-controls={asideId}
        className={`fixed top-3 left-4 z-50 lg:hidden p-2 bg-white text-gray-700 rounded-lg shadow-md ${focusRing}`}
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <FocusTrap
        active={drawerOpen}
        focusTrapOptions={{
          escapeDeactivates: true,
          clickOutsideDeactivates: true,
          returnFocusOnDeactivate: true,
          setReturnFocus: () => menuButtonRef.current ?? false,
          onDeactivate: closeDrawer,
          fallbackFocus: () => menuButtonRef.current ?? document.body,
        }}
      >
        <aside
          id={asideId}
          aria-label="Menu quản trị"
          // Closed drawer on a small screen is off-screen: keep it out of the Tab order and
          // the accessibility tree (WCAG 2.4.3, 2.4.11).
          inert={!isDesktop && !mobileOpen}
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 ${collapsed ? 'lg:w-20' : ''}`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <Link
              href="/admin"
              onClick={closeDrawer}
              className={`flex items-center gap-2 rounded-xl ${focusRing}`}
            >
              <span
                aria-hidden="true"
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl"
              >
                T
              </span>
              <span className={iconsOnly ? 'sr-only' : 'font-bold text-gray-900'}>Tepup Admin</span>
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
              aria-expanded={!collapsed}
              aria-controls={navId}
              title={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
              className={`hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${focusRing}`}
            >
              <ChevronLeft
                aria-hidden="true"
                className={`w-5 h-5 text-gray-500 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Đóng menu"
              className={`lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors ${focusRing}`}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            id={navId}
            aria-label="Quản trị"
            className="p-4 space-y-4 h-[calc(100%-9rem)] overflow-y-auto"
          >
            {visibleGroups.map((group, groupIndex) => {
              const labelId = `${groupId}-${groupIndex}`;
              return (
                <div key={group.label ?? `group-${groupIndex}`} className="space-y-1">
                  {group.label && (
                    <>
                      {iconsOnly && <div aria-hidden="true" className="mx-3 border-t border-gray-200" />}
                      <p
                        id={labelId}
                        className={
                          iconsOnly
                            ? 'sr-only'
                            : 'px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500'
                        }
                      >
                        {group.label}
                      </p>
                    </>
                  )}

                  <ul className="space-y-1" aria-labelledby={group.label ? labelId : undefined}>
                    {group.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/admin' && pathname.startsWith(item.href));
                      const Icon = item.icon;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={closeDrawer}
                            aria-current={isActive ? 'page' : undefined}
                            className={linkClass(isActive)}
                            title={iconsOnly ? item.title : undefined}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                            <span className={iconsOnly ? 'sr-only' : 'font-medium'}>
                              {item.title}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>

          {/* Settings at bottom - all users */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <Link
              href="/admin/settings"
              onClick={closeDrawer}
              aria-current={pathname === '/admin/settings' ? 'page' : undefined}
              className={linkClass(pathname === '/admin/settings')}
              title={iconsOnly ? 'Cài đặt' : undefined}
            >
              <Settings className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className={iconsOnly ? 'sr-only' : 'font-medium'}>Cài đặt</span>
            </Link>
          </div>
        </aside>
      </FocusTrap>
    </>
  );
}

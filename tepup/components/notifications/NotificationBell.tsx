'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import { NOTIFICATIONS_CHANGED_EVENT } from './shared';

async function fetchUnreadCount(): Promise<number | null> {
  try {
    const res = await fetch('/api/notifications/count', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { unread?: number };
    return typeof data.unread === 'number' ? data.unread : null;
  } catch {
    return null; // offline: keep the last count
  }
}

/**
 * Bell with unread count for the contributor and admin headers (client). Never on public pages.
 * Loads the count on mount and on every navigation; no polling (proposal §6.16).
 */
export default function NotificationBell() {
  const pathname = usePathname() ?? '';
  const isAdmin = pathname.startsWith('/admin');
  const [unread, setUnread] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      void fetchUnreadCount().then((n) => {
        if (alive && n !== null) setUnread(n);
      });
    refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    return () => {
      alive = false;
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    };
  }, [pathname]);

  const count = unread ?? 0;
  const shown = count > 99 ? '99+' : String(count);
  const label = `Thông báo, ${shown} chưa đọc`;
  const ring = isAdmin ? 'focus-visible:ring-blue-600' : 'focus-visible:ring-teal-700';
  const badge = isAdmin ? 'bg-blue-600' : 'bg-teal-700';

  return (
    <Link
      href={isAdmin ? '/admin/notifications' : '/contributor/notifications'}
      aria-label={label}
      title="Thông báo"
      className={`relative inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 ${ring}`}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className={`absolute -right-0.5 -top-0.5 min-w-5 rounded-full px-1 text-center text-xs font-semibold leading-5 text-white ${badge}`}
        >
          {shown}
        </span>
      )}
    </Link>
  );
}

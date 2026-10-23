'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { absoluteTime, announceNotificationsChanged, relativeTime } from './shared';

interface Item {
  id: string;
  kind: string;
  text: string;
  href: string;
  createdAt: string;
  read: boolean;
}

interface PageData {
  items: Item[];
  nextCursor: string | null;
  unreadCount: number;
}

type LoadState = 'loading' | 'ready' | 'error' | 'unauthorized';

/**
 * Notification inbox, shared by /contributor/notifications and /admin/notifications.
 * Text and links come from the server (rendered at read time, hidden targets dropped).
 */
export default function NotificationsPage({ area = 'contributor' }: { area?: 'contributor' | 'admin' }) {
  const router = useRouter();
  const accent =
    area === 'admin'
      ? { text: 'text-blue-700', ring: 'focus-visible:ring-blue-600', pill: 'bg-blue-600', soft: 'bg-blue-50', border: 'border-blue-600' }
      : { text: 'text-teal-800', ring: 'focus-visible:ring-teal-700', pill: 'bg-teal-700', soft: 'bg-teal-50', border: 'border-teal-700' };

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [state, setState] = useState<LoadState>('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [status, setStatus] = useState('');
  const requestSeq = useRef(0);
  // "Xem thêm" stays mounted (as "Đã hết") once a further page was loaded, so focus isn't dropped.
  const [paged, setPaged] = useState(false);
  const [moreError, setMoreError] = useState('');

  const fetchPage = useCallback(
    async (cursor: string | null): Promise<PageData | 'unauthorized' | null> => {
      const qs = new URLSearchParams();
      if (unreadOnly) qs.set('unread', '1');
      if (cursor) qs.set('cursor', cursor);
      try {
        const res = await fetch(`/api/notifications?${qs}`, { cache: 'no-store' });
        if (res.status === 401) return 'unauthorized';
        if (!res.ok) return null;
        return (await res.json()) as PageData;
      } catch {
        return null;
      }
    },
    [unreadOnly]
  );

  useEffect(() => {
    const seq = ++requestSeq.current;
    void (async () => {
      const data = await fetchPage(null);
      if (seq !== requestSeq.current) return;
      if (data === 'unauthorized') return setState('unauthorized');
      if (!data) return setState('error');
      setItems(data.items);
      setPaged(false);
      setMoreError('');
      setNextCursor(data.nextCursor);
      setUnreadCount(data.unreadCount);
      setState('ready');
    })();
  }, [fetchPage]);

  const reload = () => {
    setState('loading');
    const seq = ++requestSeq.current;
    void (async () => {
      const data = await fetchPage(null);
      if (seq !== requestSeq.current) return;
      if (data === 'unauthorized') return setState('unauthorized');
      if (!data) return setState('error');
      setItems(data.items);
      setPaged(false);
      setMoreError('');
      setNextCursor(data.nextCursor);
      setUnreadCount(data.unreadCount);
      setState('ready');
    })();
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    const seq = requestSeq.current;
    setLoadingMore(true);
    setMoreError('');
    const data = await fetchPage(nextCursor);
    setLoadingMore(false);
    // The filter changed while this page loaded: it belongs to the old list.
    if (seq !== requestSeq.current) return;
    if (data === 'unauthorized') return setState('unauthorized');
    if (!data) return setMoreError('Chưa tải thêm được. Thử lại sau.');
    setPaged(true);
    setItems((prev) => [...prev, ...data.items.filter((i) => !prev.some((p) => p.id === i.id))]);
    setNextCursor(data.nextCursor);
    setUnreadCount(data.unreadCount);
    setStatus(`Đã tải thêm ${data.items.length} thông báo.`);
  };

  const markAll = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    setStatus('');
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (res.status === 401) return setState('unauthorized');
      if (!res.ok) throw new Error();
      setItems((prev) => (unreadOnly ? [] : prev.map((i) => ({ ...i, read: true }))));
      if (unreadOnly) setNextCursor(null);
      setUnreadCount(0);
      setStatus('Đã đánh dấu tất cả là đã đọc.');
      announceNotificationsChanged();
    } catch {
      setStatus('Chưa đánh dấu được. Thử lại sau.');
    } finally {
      setMarkingAll(false);
    }
  };

  const open = (item: Item) => {
    if (!item.read) {
      // keepalive: the request survives the navigation that follows.
      void fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [item.id] }),
        keepalive: true,
      })
        .then(() => announceNotificationsChanged())
        .catch(() => {});
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
      setUnreadCount((n) => Math.max(0, n - 1));
    }
    router.push(item.href);
  };

  const filterButton = (value: boolean, label: string) => (
    <button
      type="button"
      aria-pressed={unreadOnly === value}
      onClick={() => {
        if (unreadOnly === value) return;
        setState('loading');
        setUnreadOnly(value);
      }}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ${accent.ring} ${
        unreadOnly === value ? `${accent.border} ${accent.soft} ${accent.text}` : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-3xl space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="mt-1 text-sm text-gray-600">
            {state === 'ready'
              ? unreadCount > 0
                ? `${unreadCount > 99 ? '99+' : unreadCount} thông báo chưa đọc.`
                : 'Bạn đã đọc hết thông báo.'
              : 'Kết quả duyệt, bình luận và việc của các khóa bạn tham gia.'}
          </p>
        </div>
        <button
          type="button"
          onClick={markAll}
          aria-disabled={markingAll || unreadCount === 0 || state !== 'ready'}
          className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 ${accent.ring}`}
        >
          {markingAll && <Spinner size="sm" tone="muted" />}
          Đánh dấu tất cả đã đọc
        </button>
      </header>

      <div role="group" aria-label="Lọc thông báo" className="flex gap-2">
        {filterButton(false, 'Tất cả')}
        {filterButton(true, 'Chưa đọc')}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {state === 'loading' && (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-600">
          <Spinner size="sm" tone="muted" />
          Đang tải thông báo…
        </div>
      )}

      {state === 'unauthorized' && (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Phiên đăng nhập đã hết hạn.{' '}
          <a href={`/login?callbackUrl=${encodeURIComponent(area === 'admin' ? '/admin/notifications' : '/contributor/notifications')}`} className="font-medium underline">
            Đăng nhập lại
          </a>
        </div>
      )}

      {state === 'error' && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Chưa tải được thông báo.{' '}
          <button type="button" onClick={reload} className="font-medium underline">
            Thử lại
          </button>
        </div>
      )}

      {state === 'ready' && items.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
          <Bell className="mx-auto mb-2 h-6 w-6 text-gray-500" aria-hidden="true" />
          {unreadOnly ? 'Không có thông báo chưa đọc.' : 'Chưa có thông báo nào.'}
        </div>
      )}

      {state === 'ready' && items.length > 0 && (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className={item.read ? '' : accent.soft}>
              <a
                href={item.href}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  open(item);
                }}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${accent.ring}`}
              >
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${item.read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                    {!item.read && (
                      <span className={`mr-2 inline-block rounded-full px-2 py-0.5 align-middle text-xs font-semibold text-white ${accent.pill}`}>
                        Mới
                      </span>
                    )}
                    {item.text}
                  </span>
                  <time dateTime={item.createdAt} title={absoluteTime(item.createdAt)} className="mt-0.5 block text-xs text-gray-600">
                    {relativeTime(item.createdAt)}
                  </time>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Stays mounted after the last page arrives ("Đã hết"), so focus isn't dropped. */}
      {state === 'ready' && (nextCursor || paged) && (
        <button
          type="button"
          onClick={loadMore}
          aria-disabled={loadingMore || !nextCursor}
          className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 ${accent.ring}`}
        >
          {loadingMore && <Spinner size="sm" tone="muted" />}
          {nextCursor ? 'Xem thêm' : 'Đã hết'}
        </button>
      )}
      <div role="alert" className="text-sm text-red-700 empty:hidden">
        {moreError}
      </div>
    </div>
  );
}

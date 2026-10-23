import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { countVisibleUnread, renderNotifications } from '@/lib/services/notification-render';

const PAGE_SIZE = 30;
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * GET /api/notifications?unread=1&cursor=<id>
 * → { items: RenderedNotification[], nextCursor: string | null, unreadCount: number }
 *
 * Entries whose target the viewer can no longer see are dropped (notification-render), so a
 * page may hold fewer than 30 items while `nextCursor` is still set.
 */
export async function GET(req: NextRequest) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const viewer = { id: session.user.id, role: session.user.role as UserRole };

  // Lazy retention (proposal §6.16): read notifications older than 90 days.
  await prisma.notification.deleteMany({
    where: { userId: viewer.id, readAt: { not: null }, createdAt: { lt: new Date(Date.now() - RETENTION_MS) } },
  });

  const unreadOnly = req.nextUrl.searchParams.get('unread') === '1';
  const cursor = req.nextUrl.searchParams.get('cursor');

  const rows = await prisma.notification.findMany({
    where: { userId: viewer.id, ...(unreadOnly ? { readAt: null } : {}) },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, kind: true, targetType: true, targetId: true, actorId: true, createdAt: true, readAt: true },
  }).catch(() => null);
  // A cursor that no longer exists (deleted meanwhile): treat as the end of the list.
  if (!rows) return NextResponse.json({ items: [], nextCursor: null, unreadCount: await countVisibleUnread(viewer) });

  const page = rows.slice(0, PAGE_SIZE);
  const [items, unreadCount] = await Promise.all([renderNotifications(page, viewer), countVisibleUnread(viewer)]);

  return NextResponse.json({
    items,
    nextCursor: rows.length > PAGE_SIZE ? page[page.length - 1].id : null,
    unreadCount,
  });
}

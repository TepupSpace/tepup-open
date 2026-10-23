import { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { getContributorSession } from '@/lib/admin-auth';
import { countVisibleUnread } from '@/lib/services/notification-render';

/** GET /api/notifications/count → { unread: number } (only entries the viewer can still see). */
export async function GET() {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const unread = await countVisibleUnread({ id: session.user.id, role: session.user.role as UserRole });
  return NextResponse.json({ unread }, { headers: { 'Cache-Control': 'no-store' } });
}

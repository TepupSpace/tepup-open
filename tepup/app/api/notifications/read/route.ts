import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';

const MAX_IDS = 100;

/**
 * POST /api/notifications/read  { ids: string[] } | { all: true }
 * → { updated: number }. Only the caller's own notifications are touched.
 */
export async function POST(req: NextRequest) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { ids?: unknown; all?: unknown } | null;
  const now = new Date();

  if (body?.all === true) {
    const r = await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: now },
    });
    return NextResponse.json({ updated: r.count });
  }

  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === 'string' && x.length > 0) : [];
  if (!ids.length || ids.length > MAX_IDS) {
    return NextResponse.json({ error: 'Cần `ids` (1–100) hoặc `all: true`' }, { status: 400 });
  }
  const r = await prisma.notification.updateMany({
    where: { userId: session.user.id, id: { in: ids }, readAt: null },
    data: { readAt: now },
  });
  return NextResponse.json({ updated: r.count });
}

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/services/audit-service';
import { ANON_ID_RE, learnerJourney } from '@/lib/analytics/learners';

/**
 * Hành trình của một mã người học (docs/data-tracking-docs/du-lieu-va-bao-cao.md, quyết định 2026-11-22).
 * - Chỉ admin. POST, mã nằm trong body: không bao giờ trên URL (log Vercel/Cloudflare, lịch sử
 *   trình duyệt). ⚠️ Đừng log body.
 * - Mỗi lần xem ghi AuditLog, KHÔNG ghi mã (AuditLog không xoá được).
 */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let id: unknown;
  try {
    id = ((await request.json()) as { id?: unknown }).id;
  } catch {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  }
  if (typeof id !== 'string' || !ANON_ID_RE.test(id)) {
    return NextResponse.json({ error: 'Mã không hợp lệ.' }, { status: 400 });
  }

  await audit(prisma, {
    actorId: session.user.id,
    action: 'ANALYTICS_JOURNEY_VIEWED',
    targetType: 'ANALYTICS',
    targetId: 'learner-journey',
  });
  const journey = await learnerJourney(id);
  if (!journey) return NextResponse.json({ error: 'Không có số liệu cho mã này.' }, { status: 404 });
  return NextResponse.json(journey, { headers: { 'Cache-Control': 'no-store' } });
}

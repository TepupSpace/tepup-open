import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getAdminSession } from '@/lib/admin-auth';
import { clientIp, rateLimit, retryAfterMinutes } from '@/lib/security/rate-limit';

// Same caps as the form (`app/(auth)/feature-request/page.tsx`), enforced here too.
const FEATURE_REQUEST_LIMITS = { title: 200, description: 2000 } as const;
const ROLES = ['LEARNER', 'CONTRIBUTOR'] as const;
const STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE', 'REJECTED'] as const;

/**
 * Public "đề xuất tính năng" form. No login needed.
 *
 * Identity: if the sender happens to be signed in (a contributor/reviewer/admin), the request
 * is linked to their account (`userId`), and admins see the username in
 * /admin/feature-requests. Anonymous senders are stored with `userId = null`. Nothing else
 * identifying is stored: the IP is used only in memory, hashed, for rate limiting.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const hourly = rateLimit('feature-request-hour', ip, 5, 60 * 60_000);
  const daily = rateLimit('feature-request-day', ip, 20, 24 * 60 * 60_000);
  // Per-instance ceiling, so a botnet can't bury the admin list.
  const global = rateLimit('feature-request-global', 'all', 300, 24 * 60 * 60_000);
  if (!hourly.ok || !daily.ok || !global.ok) {
    const wait = Math.max(
      hourly.ok ? 0 : hourly.retryAfterSeconds,
      daily.ok ? 0 : daily.retryAfterSeconds,
      global.ok ? 0 : global.retryAfterSeconds
    );
    return NextResponse.json(
      { error: `Bạn đã gửi nhiều đề xuất. Vui lòng thử lại sau ${retryAfterMinutes(wait)} phút.` },
      { status: 429, headers: { 'Retry-After': String(wait) } }
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const { role } = body;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (typeof role !== 'string' || !(ROLES as readonly string[]).includes(role)) {
      return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Tiêu đề không được để trống' }, { status: 400 });
    }
    if (title.length > FEATURE_REQUEST_LIMITS.title) {
      return NextResponse.json(
        { error: `Tiêu đề tối đa ${FEATURE_REQUEST_LIMITS.title} ký tự` },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json({ error: 'Mô tả không được để trống' }, { status: 400 });
    }
    if (description.length > FEATURE_REQUEST_LIMITS.description) {
      return NextResponse.json(
        { error: `Mô tả tối đa ${FEATURE_REQUEST_LIMITS.description} ký tự` },
        { status: 400 }
      );
    }

    // Linked to the account only when signed in (see the comment above).
    let userId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
      // Not logged in, that's fine
    }

    const featureRequest = await prisma.featureRequest.create({
      data: {
        role: role as (typeof ROLES)[number],
        title,
        description,
        userId,
      },
      select: { id: true },
    });

    // Don't echo the stored row (it holds userId); the form only needs to know it worked.
    return NextResponse.json({ data: featureRequest }, { status: 201 });
  } catch (err) {
    console.error('Feature request POST error:', err);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const role = searchParams.get('role');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = 20;

  // Unknown filter values used to reach Prisma as invalid enum values (a 500); ignore them.
  const where: Record<string, unknown> = {};
  if (status && (STATUSES as readonly string[]).includes(status)) where.status = status;
  if (role && (ROLES as readonly string[]).includes(role)) where.role = role;

  const [requests, total] = await Promise.all([
    prisma.featureRequest.findMany({
      where,
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.featureRequest.count({ where }),
  ]);

  return NextResponse.json({ data: requests, total, page, totalPages: Math.ceil(total / limit) });
}

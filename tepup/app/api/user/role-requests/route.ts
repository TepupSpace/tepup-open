import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { rateLimit, retryAfterMinutes } from '@/lib/security/rate-limit';
import {
  createRoleRequest,
  myRoleRequests,
  RoleRequestError,
  ROLE_REQUEST_MESSAGE_MAX,
  REQUESTABLE_ROLES,
} from '@/lib/services/role-request-service';

/** The signed-in user's role-change requests (settings → "Quyền truy cập"). */
export async function GET() {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pending, history } = await myRoleRequests(session.user.id);
  return NextResponse.json({ role: session.user.role, pending, history });
}

/**
 * POST { requestedRole, message }: ask the admins for another access level.
 * 201 created · 400 invalid · 403 admins/banned · 409 one already pending · 429 rate limit.
 */
export async function POST(req: NextRequest) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const raw: unknown = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const { requestedRole, message } = raw as Record<string, unknown>;

  if (typeof requestedRole !== 'string' || !REQUESTABLE_ROLES.includes(requestedRole as UserRole)) {
    return NextResponse.json({ error: 'Không thể yêu cầu quyền này' }, { status: 400 });
  }
  const text = typeof message === 'string' ? message.trim() : '';
  if (!text) {
    return NextResponse.json({ error: 'Vui lòng cho quản trị viên biết lý do bạn cần quyền này' }, { status: 400 });
  }
  if (text.length > ROLE_REQUEST_MESSAGE_MAX) {
    return NextResponse.json({ error: `Lý do quá dài (tối đa ${ROLE_REQUEST_MESSAGE_MAX} ký tự)` }, { status: 400 });
  }

  // The JWT role can be up to 60 s stale: decide from the database row.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isBanned: true, deletedAt: true },
  });
  if (!user || user.deletedAt || user.isBanned) {
    return NextResponse.json({ error: 'Tài khoản của bạn không thể gửi yêu cầu' }, { status: 403 });
  }
  if (user.role === 'ADMIN') {
    return NextResponse.json(
      { error: 'Quản trị viên đổi quyền trực tiếp trong trang Người dùng' },
      { status: 403 }
    );
  }

  // A withdrawn-and-resent loop is fine; a flood is not.
  const limit = rateLimit('role-request', session.user.id, 5, 24 * 60 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Bạn đã gửi nhiều yêu cầu hôm nay. Vui lòng thử lại sau ${retryAfterMinutes(limit.retryAfterSeconds)} phút.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const request = await createRoleRequest(
      { id: session.user.id, role: user.role },
      requestedRole as UserRole,
      text
    );
    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    if (e instanceof RoleRequestError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('Role request error:', e);
    return NextResponse.json({ error: 'Đã xảy ra lỗi. Vui lòng thử lại.' }, { status: 500 });
  }
}

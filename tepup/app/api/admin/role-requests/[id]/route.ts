import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { revalidateContent } from '@/lib/cache';
import {
  decideRoleRequest,
  RoleRequestError,
  ROLE_REQUEST_NOTE_MAX,
} from '@/lib/services/role-request-service';

/**
 * PUT { action: 'APPROVE' | 'DECLINE', note? }: decide a pending role request.
 * Approving applies the role change (audited). 200 · 400 · 404 not pending · 409 stale.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const raw: unknown = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const { action, note } = raw as Record<string, unknown>;
  if (action !== 'APPROVE' && action !== 'DECLINE') {
    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  }
  const trimmedNote = typeof note === 'string' && note.trim() ? note.trim() : null;
  if (trimmedNote && trimmedNote.length > ROLE_REQUEST_NOTE_MAX) {
    return NextResponse.json({ error: `Ghi chú quá dài (tối đa ${ROLE_REQUEST_NOTE_MAX} ký tự)` }, { status: 400 });
  }

  try {
    await decideRoleRequest(session.user.id, id, action, trimmedNote);
  } catch (e) {
    if (e instanceof RoleRequestError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('Role request decide error:', e);
    return NextResponse.json({ error: 'Đã xảy ra lỗi. Vui lòng thử lại.' }, { status: 500 });
  }

  // Public course credits show roles: refresh cached pages after an approval.
  if (action === 'APPROVE') revalidateContent();
  return NextResponse.json({ ok: true });
}

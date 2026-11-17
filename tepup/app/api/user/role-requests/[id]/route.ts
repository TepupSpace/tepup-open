import { NextRequest, NextResponse } from 'next/server';
import { getContributorSession } from '@/lib/admin-auth';
import { cancelRoleRequest, RoleRequestError } from '@/lib/services/role-request-service';

/** DELETE: withdraw your own pending role request. 200 · 404 not yours or already decided. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await cancelRoleRequest(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof RoleRequestError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('Role request cancel error:', e);
    return NextResponse.json({ error: 'Đã xảy ra lỗi. Vui lòng thử lại.' }, { status: 500 });
  }
}

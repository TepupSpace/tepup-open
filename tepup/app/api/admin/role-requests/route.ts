import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { pendingRoleRequests } from '@/lib/services/role-request-service';

/** Pending role-change requests, oldest first (Quản trị › Người dùng). */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requests = await pendingRoleRequests();
  return NextResponse.json({ requests });
}

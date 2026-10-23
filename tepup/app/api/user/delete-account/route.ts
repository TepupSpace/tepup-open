import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/security/rate-limit';
import { ensurePublicHandle } from '@/lib/credit';
import { revalidateContent } from '@/lib/cache';
import { TombstoneError, tombstoneUser } from '@/lib/services/account-service';

/**
 * Self-service account deletion (proposal §6.13a). POST { password, confirmUsername }.
 * Needs the current password (a stolen session alone is not enough) and the username typed.
 * Admins can't delete themselves here; another admin deletes them.
 *
 * 200 { ok: true } · 400 wrong input/password · 401 · 403 admin · 409 already deleted · 429
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  // Limits password guessing from a stolen session.
  const limit = rateLimit('delete-account', userId, 5, 60 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Quá nhiều lần thử. Vui lòng thử lại sau.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const { password, confirmUsername } = body;
  if (typeof password !== 'string' || !password || password.length > 1024 || typeof confirmUsername !== 'string') {
    return NextResponse.json({ error: 'Vui lòng nhập mật khẩu và tên tài khoản' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, password: true, role: true, deletedAt: true },
  });
  if (!user || user.deletedAt) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  if (user.role === 'ADMIN') {
    return NextResponse.json(
      { error: 'Quản trị viên không thể tự xóa tài khoản. Hãy nhờ một quản trị viên khác.' },
      { status: 403 }
    );
  }
  if (!user.password || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Mật khẩu không đúng', field: 'password' }, { status: 400 });
  }
  if (!user.username || confirmUsername.trim().toLowerCase() !== user.username.toLowerCase()) {
    return NextResponse.json({ error: 'Tên tài khoản nhập lại không khớp', field: 'username' }, { status: 400 });
  }

  try {
    // Outside the transaction: a handle clash inside one would abort it.
    await ensurePublicHandle(prisma, userId);
    await prisma.$transaction((tx) => tombstoneUser(tx, userId, { actorId: userId, self: true }));
  } catch (e) {
    if (e instanceof TombstoneError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error('Self-delete failed:', e);
    return NextResponse.json({ error: 'Không xóa được tài khoản. Vui lòng thử lại.' }, { status: 500 });
  }
  revalidateContent();
  return NextResponse.json({ ok: true });
}

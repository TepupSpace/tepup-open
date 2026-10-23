import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { audit } from '@/lib/services/audit-service';
import { ensurePublicHandle } from '@/lib/credit';
import { revalidateContent } from '@/lib/cache';
import { otherActiveAdminCount, TombstoneError, tombstoneUser } from '@/lib/services/account-service';
import { notifyIfOrphaned } from '@/lib/services/course-roles-service';

const VALID_ROLES: UserRole[] = ['LEARNER', 'AUTHOR', 'TRUSTED_AUTHOR', 'REVIEWER', 'ADMIN'];
const BAN_REASON_MAX = 500;

class UserAdminError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

/** Serialises changes that could leave the site without an active admin. */
async function lockAdmins(tx: Prisma.TransactionClient) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE role = 'ADMIN' FOR UPDATE`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      bannedAt: true,
      bannedReason: true,
      deletedAt: true,
      createdAt: true,
      _count: { select: { contributions: true, reviews: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  return NextResponse.json(user);
}

/**
 * PUT { role?, isBanned?, bannedReason? }. Role changes, bans and unbans are audited in the
 * same transaction. Refuses: a deleted account; demoting or banning yourself; demoting or
 * banning the last active admin.
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
  const body = raw as Record<string, unknown>;
  const { role, isBanned, bannedReason } = body;

  if (role !== undefined && !VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
  }
  if (isBanned !== undefined && typeof isBanned !== 'boolean') {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const reason =
    typeof bannedReason === 'string' && bannedReason.trim()
      ? bannedReason.trim().slice(0, BAN_REASON_MAX)
      : null;

  try {
    const { updated: user, changed } = await prisma.$transaction(async (tx) => {
      await lockAdmins(tx);
      const before = await tx.user.findUnique({
        where: { id },
        select: { id: true, role: true, isBanned: true, deletedAt: true },
      });
      if (!before) throw new UserAdminError('Không tìm thấy', 404);
      if (before.deletedAt) throw new UserAdminError('Tài khoản đã bị xóa, không thể thay đổi', 409);

      const newRole = role as UserRole | undefined;
      const roleChanges = newRole !== undefined && newRole !== before.role;
      const banChanges = isBanned !== undefined && isBanned !== before.isBanned;
      const self = id === session.user.id;

      if (self && banChanges && isBanned) {
        throw new UserAdminError('Bạn không thể tự khoá tài khoản của mình', 403);
      }
      if (self && roleChanges && newRole !== 'ADMIN') {
        throw new UserAdminError('Bạn không thể tự hạ quyền của mình', 403);
      }
      const losesActiveAdmin =
        before.role === 'ADMIN' &&
        !before.isBanned &&
        ((roleChanges && newRole !== 'ADMIN') || (banChanges && isBanned === true));
      if (losesActiveAdmin && (await otherActiveAdminCount(tx, id)) === 0) {
        throw new UserAdminError('Không thể hạ quyền hoặc khoá quản trị viên cuối cùng', 403);
      }

      const data: Prisma.UserUpdateInput = {};
      if (roleChanges) data.role = newRole;
      if (banChanges) {
        data.isBanned = isBanned as boolean;
        data.bannedAt = isBanned ? new Date() : null;
        data.bannedReason = isBanned ? reason : null;
      }

      const updated = await tx.user.update({
        where: { id },
        data,
        select: { id: true, username: true, name: true, email: true, role: true, isBanned: true },
      });

      if (roleChanges) {
        await audit(tx, {
          actorId: session.user.id,
          action: 'USER_ROLE_CHANGED',
          targetType: 'USER',
          targetId: id,
          details: { before: before.role, after: newRole as string },
        });
      }
      if (banChanges) {
        await audit(tx, {
          actorId: session.user.id,
          action: isBanned ? 'USER_BANNED' : 'USER_UNBANNED',
          targetType: 'USER',
          targetId: id,
          details: isBanned ? { reason } : undefined,
        });
        // A banned maintainer no longer counts (notifyIfOrphaned): tell admins about courses
        // left without an active one. actorId null so the banning admin is told too.
        if (isBanned) {
          const maintained = await tx.courseMember.findMany({
            where: { userId: id, role: 'COURSE_LEAD' },
            select: { courseId: true },
          });
          for (const m of maintained) await notifyIfOrphaned(tx, m.courseId, null);
        }
      }
      return { updated, changed: roleChanges || banChanges };
    });
    // Public course credits leave out banned users and show roles: refresh cached pages.
    if (changed) revalidateContent();
    return NextResponse.json(user);
  } catch (e) {
    if (e instanceof UserAdminError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

/**
 * DELETE: tombstone the account (proposal §6.13). Irreversible. Refuses yourself and the
 * last active admin. The client makes the admin type the username first.
 * 200 { ok: true } · 403 · 404 · 409 already deleted
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: 'Bạn không thể tự xóa tài khoản của mình' }, { status: 403 });
  }

  const exists = await prisma.user.findUnique({ where: { id }, select: { deletedAt: true } });
  if (!exists) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  if (exists.deletedAt) return NextResponse.json({ error: 'Tài khoản này đã bị xóa' }, { status: 409 });

  try {
    // Outside the transaction: a handle clash inside one would abort it.
    await ensurePublicHandle(prisma, id);
    await prisma.$transaction(async (tx) => {
      await lockAdmins(tx);
      const target = await tx.user.findUnique({
        where: { id },
        select: { role: true, isBanned: true, deletedAt: true },
      });
      if (target?.role === 'ADMIN' && !target.deletedAt && !target.isBanned) {
        if ((await otherActiveAdminCount(tx, id)) === 0) {
          throw new UserAdminError('Không thể xóa quản trị viên cuối cùng', 403);
        }
      }
      await tombstoneUser(tx, id, { actorId: session.user.id, self: false });
    });
  } catch (e) {
    if (e instanceof UserAdminError || e instanceof TombstoneError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('Admin delete failed:', e);
    return NextResponse.json({ error: 'Không xóa được tài khoản. Vui lòng thử lại.' }, { status: 500 });
  }
  revalidateContent();
  return NextResponse.json({ ok: true });
}

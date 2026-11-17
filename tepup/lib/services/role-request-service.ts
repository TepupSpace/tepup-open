import type { Prisma, RoleRequestStatus, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/services/audit-service';
import { adminIds, notify } from '@/lib/services/notification-service';

/**
 * "Yêu cầu thay đổi quyền" (role-change requests): a signed-in contributor asks the admins
 * for another access level from Cài đặt; admins decide on Quản trị › Người dùng. Approving
 * applies the role change (audited like a manual change). One PENDING request per user —
 * checked here and enforced by a partial unique index (prisma/sql/2026-11-17).
 */

export const ROLE_REQUEST_MESSAGE_MAX = 1000;
export const ROLE_REQUEST_NOTE_MAX = 500;

/** Admins are appointed, never requested; everything else may be asked for. */
export const REQUESTABLE_ROLES: UserRole[] = ['LEARNER', 'AUTHOR', 'TRUSTED_AUTHOR', 'REVIEWER'];

export class RoleRequestError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function isUniqueClash(e: unknown): boolean {
  return (
    typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === 'P2002'
  );
}

export interface MyRoleRequest {
  id: string;
  roleAtRequest: UserRole;
  requestedRole: UserRole;
  message: string;
  status: RoleRequestStatus;
  decisionNote: string | null;
  createdAt: Date;
  decidedAt: Date | null;
}

const MY_SELECT = {
  id: true,
  roleAtRequest: true,
  requestedRole: true,
  message: true,
  status: true,
  decisionNote: true,
  createdAt: true,
  decidedAt: true,
} satisfies Prisma.RoleChangeRequestSelect;

/** The user's open request (if any) plus their most recent decided ones. */
export async function myRoleRequests(userId: string): Promise<{
  pending: MyRoleRequest | null;
  history: MyRoleRequest[];
}> {
  const [pending, history] = await Promise.all([
    prisma.roleChangeRequest.findFirst({
      where: { userId, status: 'PENDING' },
      select: MY_SELECT,
    }),
    prisma.roleChangeRequest.findMany({
      where: { userId, status: { not: 'PENDING' } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: MY_SELECT,
    }),
  ]);
  return { pending, history };
}

/**
 * Create a request and notify the admins in the same transaction.
 * Throws RoleRequestError: 400 invalid target, 409 already pending / role already held.
 */
export async function createRoleRequest(
  user: { id: string; role: UserRole },
  requestedRole: UserRole,
  message: string
): Promise<MyRoleRequest> {
  if (!REQUESTABLE_ROLES.includes(requestedRole)) {
    throw new RoleRequestError('Không thể yêu cầu quyền này', 400);
  }
  if (requestedRole === user.role) {
    throw new RoleRequestError('Bạn đang có quyền này rồi', 400);
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.roleChangeRequest.findFirst({
        where: { userId: user.id, status: 'PENDING' },
        select: { id: true },
      });
      if (existing) {
        throw new RoleRequestError('Bạn đã có một yêu cầu đang chờ. Hãy rút lại yêu cầu đó trước khi gửi yêu cầu mới.', 409);
      }
      const request = await tx.roleChangeRequest.create({
        data: {
          userId: user.id,
          roleAtRequest: user.role,
          requestedRole,
          message,
        },
        select: MY_SELECT,
      });
      await notify(tx, await adminIds(tx), {
        kind: 'ROLE_REQUEST_SUBMITTED',
        targetType: 'ROLE_REQUEST',
        targetId: request.id,
        actorId: user.id,
      });
      return request;
    });
  } catch (e) {
    // Two submits at once: the partial unique index catches the second.
    if (isUniqueClash(e)) {
      throw new RoleRequestError('Bạn đã có một yêu cầu đang chờ. Hãy rút lại yêu cầu đó trước khi gửi yêu cầu mới.', 409);
    }
    throw e;
  }
}

/** Withdraw your own pending request. Throws 404 when there is none (or it was decided). */
export async function cancelRoleRequest(userId: string, requestId: string): Promise<void> {
  const { count } = await prisma.roleChangeRequest.updateMany({
    where: { id: requestId, userId, status: 'PENDING' },
    data: { status: 'CANCELLED', decidedAt: new Date() },
  });
  if (count === 0) {
    throw new RoleRequestError('Yêu cầu này không còn chờ xử lý', 404);
  }
}

export interface AdminRoleRequest {
  id: string;
  roleAtRequest: UserRole;
  requestedRole: UserRole;
  message: string;
  status: RoleRequestStatus;
  decisionNote: string | null;
  createdAt: Date;
  decidedAt: Date | null;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    role: UserRole;
    isBanned: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    contributionCount: number;
    approvedCount: number;
  };
}

/** Pending requests (oldest first), with enough about the user to decide. */
export async function pendingRoleRequests(): Promise<AdminRoleRequest[]> {
  const rows = await prisma.roleChangeRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 100,
    select: {
      ...MY_SELECT,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          isBanned: true,
          deletedAt: true,
          createdAt: true,
          _count: { select: { contributions: true } },
        },
      },
    },
  });
  const approved = await prisma.contribution.groupBy({
    by: ['contributorId'],
    where: { contributorId: { in: rows.map((r) => r.user.id) }, status: 'APPROVED' },
    _count: true,
  });
  const approvedMap = new Map(approved.map((a) => [a.contributorId, a._count]));
  return rows.map((r) => ({
    ...r,
    user: {
      id: r.user.id,
      username: r.user.username,
      name: r.user.name,
      role: r.user.role,
      isBanned: r.user.isBanned,
      deletedAt: r.user.deletedAt,
      createdAt: r.user.createdAt,
      contributionCount: r.user._count.contributions,
      approvedCount: approvedMap.get(r.user.id) ?? 0,
    },
  }));
}

export async function pendingRoleRequestCount(): Promise<number> {
  return prisma.roleChangeRequest.count({ where: { status: 'PENDING' } });
}

/**
 * Approve or decline a pending request. Approving re-checks that the user's role is still
 * the one the request was made from (otherwise 409: decide from the Users page instead),
 * applies the change, and audits it like a manual role change. The requester is notified
 * either way, in the same transaction.
 * Throws RoleRequestError: 404 not pending, 409 stale/deleted/banned.
 */
export async function decideRoleRequest(
  adminId: string,
  requestId: string,
  action: 'APPROVE' | 'DECLINE',
  note: string | null
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const request = await tx.roleChangeRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        status: true,
        roleAtRequest: true,
        requestedRole: true,
        user: { select: { role: true, isBanned: true, deletedAt: true } },
      },
    });
    if (!request || request.status !== 'PENDING') {
      throw new RoleRequestError('Yêu cầu này không còn chờ xử lý', 404);
    }

    if (action === 'APPROVE') {
      if (request.user.deletedAt) {
        throw new RoleRequestError('Tài khoản này đã bị xóa; hãy từ chối yêu cầu.', 409);
      }
      if (request.user.isBanned) {
        throw new RoleRequestError('Tài khoản này đang bị khoá; mở khoá trước hoặc từ chối yêu cầu.', 409);
      }
      if (request.user.role !== request.roleAtRequest) {
        throw new RoleRequestError(
          'Vai trò của tài khoản đã thay đổi từ khi gửi yêu cầu. Hãy từ chối yêu cầu, hoặc đổi vai trò trực tiếp trong danh sách người dùng.',
          409
        );
      }
      await tx.user.update({
        where: { id: request.userId },
        data: { role: request.requestedRole },
      });
      await audit(tx, {
        actorId: adminId,
        action: 'USER_ROLE_CHANGED',
        targetType: 'USER',
        targetId: request.userId,
        details: { before: request.roleAtRequest, after: request.requestedRole, roleRequestId: request.id },
      });
    }

    // Guards the race against a second admin deciding at the same time.
    const { count } = await tx.roleChangeRequest.updateMany({
      where: { id: requestId, status: 'PENDING' },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'DECLINED',
        decidedById: adminId,
        decisionNote: note,
        decidedAt: new Date(),
      },
    });
    if (count === 0) {
      throw new RoleRequestError('Yêu cầu này không còn chờ xử lý', 404);
    }

    await notify(tx, [request.userId], {
      kind: 'ROLE_REQUEST_DECIDED',
      targetType: 'ROLE_REQUEST',
      targetId: request.id,
      actorId: adminId,
    });
  });
}

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { staffName } from '@/lib/credit';

/**
 * Audit log, read-only, admins only (proposal §6.19). There is no write route: rows are
 * written by `audit()` in the same transaction as each action.
 *
 * GET ?action=&actor=<username>&targetType=&targetId=&cursor=<id>&limit=<1..100>
 * → { entries: [{ id, action, targetType, targetId, details, createdAt,
 *                 actorId, actorUsername, actorName, targetName }], nextCursor }
 * Newest first. `nextCursor` is the id to pass as `cursor` for the next page (null = end).
 */

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_FILTER_LENGTH = 200;

function param(sp: URLSearchParams, key: string): string | null {
  const v = sp.get(key)?.trim();
  return v ? v.slice(0, MAX_FILTER_LENGTH) : null;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const action = param(sp, 'action');
  const actor = param(sp, 'actor');
  const targetType = param(sp, 'targetType');
  const targetId = param(sp, 'targetId');
  const cursor = param(sp, 'cursor');
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(sp.get('limit') || '', 10) || DEFAULT_LIMIT));

  const where: Prisma.AuditLogWhereInput = {};
  if (action) where.action = action;
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = targetId;
  if (actor) {
    const actors = await prisma.user.findMany({
      where: { username: { equals: actor, mode: 'insensitive' } },
      select: { id: true },
    });
    if (!actors.length) return NextResponse.json({ entries: [], nextCursor: null });
    where.actorId = { in: actors.map((a) => a.id) };
  }

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const page = rows.slice(0, limit);
  const nextCursor = rows.length > limit ? page[page.length - 1].id : null;

  // Names for actors, and for USER targets (AuditLog has no FK to User, so look them up).
  const userIds = new Set<string>();
  for (const r of page) {
    if (r.actorId) userIds.add(r.actorId);
    if (r.targetType === 'USER') userIds.add(r.targetId);
  }
  const users = userIds.size
    ? await prisma.user.findMany({
        where: { id: { in: [...userIds] } },
        select: { id: true, username: true, name: true, publicHandle: true, deletedAt: true },
      })
    : [];
  const byId = new Map(users.map((u) => [u.id, u]));

  const entries = page.map((r) => {
    const a = r.actorId ? byId.get(r.actorId) : undefined;
    const t = r.targetType === 'USER' ? byId.get(r.targetId) : undefined;
    return {
      id: r.id,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      details: r.details,
      createdAt: r.createdAt,
      actorId: r.actorId,
      actorUsername: a?.deletedAt ? null : (a?.username ?? null),
      actorName: a ? staffName(a) : null,
      targetName: t ? staffName(t) : null,
    };
  });

  return NextResponse.json({ entries, nextCursor });
}

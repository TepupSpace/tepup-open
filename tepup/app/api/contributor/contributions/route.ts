import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { createEditProposal, isEditProposalType } from '@/lib/services/proposal-service';
import { prepareContributionData } from '@/lib/ai-import/normalize';
import {
  contentErrorBody,
  isSupportedContributionType,
  validateContributionData,
} from '@/lib/schemas/content-validation';

/**
 * The escalation note and who escalated are for admins (proposal §6.13: "Chuyển quản trị
 * viên"); the author only learns that it was escalated.
 */
function forAuthor<T extends { escalationNote: string | null; escalatedById: string | null; escalatedAt: Date | null }>(
  c: T
): Omit<T, 'escalationNote' | 'escalatedById' | 'escalatedAt'> & { escalated: boolean } {
  const { escalationNote: _note, escalatedById: _by, escalatedAt, ...rest } = c;
  void _note;
  void _by;
  return { ...rest, escalated: escalatedAt !== null };
}

export async function GET(req: NextRequest) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: Record<string, unknown> = { contributorId: session.user.id };
  if (status) where.status = status;

  const contributions = await prisma.contribution.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return NextResponse.json(contributions.map(forAuthor));
}

export async function POST(req: NextRequest) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { type, message } = body ?? {};
  const data: unknown = body?.data;

  if (!type || !isSupportedContributionType(type)) {
    return NextResponse.json(
      { error: 'Loại đóng góp không được hỗ trợ / Unsupported contribution type' },
      { status: 400 }
    );
  }

  if (message !== undefined && message !== null && (typeof message !== 'string' || message.length > 2000)) {
    return NextResponse.json(
      { error: 'Lời nhắn không hợp lệ (tối đa 2000 ký tự) / Invalid message (max 2000 chars)' },
      { status: 400 }
    );
  }

  // Edit proposals (lessons, chapters, library entries, course outlines): the target and the
  // version the proposal starts from come from the server only; visibility, blocks, one open
  // proposal per target, caps and the hourly limit are checked in proposal-service.
  // `data` may be omitted: the proposal then starts from the live version.
  if (isEditProposalType(type)) {
    const result = await createEditProposal(
      { id: session.user.id, role: session.user.role as UserRole },
      { type, targetId: body?.targetId, data, message: message ?? null }
    );
    if (!result.ok) {
      const { ok: _ok, status, ...rest } = result;
      void _ok;
      return NextResponse.json(rest, { status });
    }
    return NextResponse.json(forAuthor(result.contribution), { status: 201 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
  }

  // 1. Normalise AI-pasted JSON (lib/ai-import) and check block structure.
  const prepared = prepareContributionData(data);
  if (prepared.errors.length) {
    return NextResponse.json({ error: 'Có block sai cấu trúc', details: prepared.errors }, { status: 400 });
  }

  // 2. Contributors are untrusted: strict schema, no custom blocks, media allowlist,
  //    formula syntax, HTML sanitised. What gets stored is the cleaned value.
  const checked = validateContributionData(type, prepared.data, {
    allowCustom: session.user.role === 'ADMIN',
  });
  if (!checked.ok) {
    return NextResponse.json(contentErrorBody(checked.issues, prepared.data), { status: 400 });
  }

  const contribution = await prisma.contribution.create({
    data: {
      contributorId: session.user.id,
      type,
      data: checked.value as Prisma.InputJsonValue,
      message: message ?? undefined,
      status: 'DRAFT',
    },
  });

  return NextResponse.json(forAuthor(contribution), { status: 201 });
}

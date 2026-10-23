import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, UserRole } from '@prisma/client';
import { getLiveTarget, isEditProposalType, isProposalStale } from '@/lib/services/proposal-service';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const contribution = await prisma.contribution.findFirst({
    where: { id, contributorId: session.user.id },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { reviewer: { select: { username: true, name: true } } },
      },
    },
  });

  if (!contribution) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  // Edit proposals: what they edit (name for the banner, links) and whether the live version
  // moved on since the base ("Bài đã thay đổi"). Null when the target is gone or no longer
  // visible to the author (hidden-content rule): the editor then says so.
  let target: {
    type: string;
    id: string;
    name: string;
    href: string;
    hubHref: string;
    entryType?: string;
    liveUpdatedAt: string | null;
    stale: boolean;
  } | null = null;
  if (isEditProposalType(contribution.type)) {
    const live = await getLiveTarget(
      { id: session.user.id, role: session.user.role as UserRole },
      contribution.type,
      contribution.targetId
    );
    if (live) {
      target = {
        type: live.type,
        id: live.id,
        name: live.name,
        href: live.href,
        hubHref: live.hubHref,
        entryType: live.entryType,
        liveUpdatedAt: live.updatedAt?.toISOString() ?? null,
        stale: isProposalStale(contribution, live),
      };
    }
  }

  // Proposal made from a claimed reader suggestion: show its text next to the editor.
  // Suggestions are identity-free; only the text fields are sent.
  const suggestion = contribution.suggestionId
    ? await prisma.suggestion.findUnique({
        where: { id: contribution.suggestionId },
        select: { quote: true, proposal: true, reason: true, createdAt: true },
      })
    : null;

  return NextResponse.json({ ...forAuthor(contribution), target, suggestion });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const contribution = await prisma.contribution.findFirst({
    where: { id, contributorId: session.user.id },
  });

  if (!contribution) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(contribution.status)) {
    return NextResponse.json(
      { error: 'Chỉ có thể chỉnh sửa bản nháp hoặc đóng góp cần chỉnh sửa' },
      { status: 400 }
    );
  }

  // Only `data` and `message` are read: targetId, baseSnapshot and baseUpdatedAt are set by
  // the server (create, rebase) and never taken from a save (proposal §6.2).
  const body = await req.json().catch(() => null);
  const { data, message } = body ?? {};

  if (message !== undefined && message !== null && (typeof message !== 'string' || message.length > 2000)) {
    return NextResponse.json(
      { error: 'Lời nhắn không hợp lệ (tối đa 2000 ký tự) / Invalid message (max 2000 chars)' },
      { status: 400 }
    );
  }

  let cleanData: Prisma.InputJsonValue | undefined;
  if (data) {
    if (!isSupportedContributionType(contribution.type)) {
      return NextResponse.json(
        { error: 'Loại đóng góp không được hỗ trợ / Unsupported contribution type' },
        { status: 400 }
      );
    }
    // 1. Normalise AI-pasted JSON (lib/ai-import) and check block structure.
    const prepared = prepareContributionData(data);
    if (prepared.errors.length) {
      return NextResponse.json({ error: 'Có block sai cấu trúc', details: prepared.errors }, { status: 400 });
    }
    // 2. Strict validation + sanitising; the cleaned value is what gets stored.
    const checked = validateContributionData(contribution.type, prepared.data, {
      allowCustom: session.user.role === 'ADMIN',
    });
    if (!checked.ok) {
      return NextResponse.json(contentErrorBody(checked.issues, prepared.data), { status: 400 });
    }
    cleanData = checked.value as Prisma.InputJsonValue;
  }

  // Status is left alone: a CHANGES_REQUESTED contribution stays CHANGES_REQUESTED
  // while the author fixes it, so the reviewer's feedback stays visible (editor, drafts
  // list, dashboard) until it is resubmitted. Only submit moves it on.
  const updated = await prisma.contribution.update({
    where: { id },
    data: {
      ...(cleanData !== undefined && { data: cleanData }),
      ...(message !== undefined && { message }),
    },
  });

  return NextResponse.json(forAuthor(updated));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const contribution = await prisma.contribution.findFirst({
    where: { id, contributorId: session.user.id },
  });

  if (!contribution) {
    return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  }

  if (contribution.status !== 'DRAFT') {
    return NextResponse.json(
      { error: 'Chỉ có thể xóa bản nháp' },
      { status: 400 }
    );
  }

  await prisma.contribution.delete({ where: { id } });

  return NextResponse.json({ message: 'Đã xóa' });
}

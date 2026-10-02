import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { prepareContributionData } from '@/lib/ai-import/normalize';
import {
  contentErrorBody,
  isSupportedContributionType,
  validateContributionData,
} from '@/lib/schemas/content-validation';

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

  return NextResponse.json(contribution);
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

  return NextResponse.json(updated);
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

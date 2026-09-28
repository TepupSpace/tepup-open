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

  return NextResponse.json(contributions);
}

export async function POST(req: NextRequest) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { type, data, message } = body ?? {};

  if (!type || !data) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
  }

  if (!isSupportedContributionType(type)) {
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
    return NextResponse.json(contentErrorBody(checked.issues), { status: 400 });
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

  return NextResponse.json(contribution, { status: 201 });
}

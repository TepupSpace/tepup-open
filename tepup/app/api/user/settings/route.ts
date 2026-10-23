import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensurePublicHandle } from '@/lib/credit';
import { LICENCE_VERSION } from '@/lib/licence';
import { revalidateContent } from '@/lib/cache';

/**
 * The signed-in user's credit and licence settings (proposal §6.11, §6.12).
 * GET  → { username, role, creditMode, publicHandle, licenceVersion, licenceAcceptedAt }
 * PUT  { creditMode?: 'NAME' | 'PSEUDONYM', acceptLicence?: true } → same shape.
 */

const SELECT = {
  username: true,
  role: true,
  creditMode: true,
  publicHandle: true,
  licenceVersion: true,
  licenceAcceptedAt: true,
  deletedAt: true,
} as const;

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function load(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: SELECT });
  if (!user || user.deletedAt) return null;
  const publicHandle = user.publicHandle ?? (await ensurePublicHandle(prisma, userId));
  return {
    username: user.username,
    role: user.role,
    creditMode: user.creditMode,
    publicHandle,
    licenceVersion: user.licenceVersion,
    licenceAcceptedAt: user.licenceAcceptedAt,
    currentLicenceVersion: LICENCE_VERSION,
  };
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  const settings = await load(userId);
  if (!settings) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const { creditMode, acceptLicence } = body;

  if (creditMode !== undefined && creditMode !== 'NAME' && creditMode !== 'PSEUDONYM') {
    return NextResponse.json({ error: 'Cách ghi công không hợp lệ' }, { status: 400 });
  }
  if (acceptLicence !== undefined && acceptLicence !== true) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const before = await prisma.user.findUnique({ where: { id: userId }, select: SELECT });
  if (!before || before.deletedAt) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  const data: { creditMode?: 'NAME' | 'PSEUDONYM'; licenceVersion?: string; licenceAcceptedAt?: Date } = {};
  if (creditMode && creditMode !== before.creditMode) data.creditMode = creditMode;
  if (acceptLicence && before.licenceVersion !== LICENCE_VERSION) {
    data.licenceVersion = LICENCE_VERSION;
    data.licenceAcceptedAt = new Date();
  }

  if (Object.keys(data).length) {
    await prisma.user.update({ where: { id: userId }, data });
    // Course credit lists are cached pages; a new credit form must reach them (§6.12).
    if (data.creditMode) revalidateContent();
  }

  const settings = await load(userId);
  if (!settings) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  return NextResponse.json(settings);
}

import { NextRequest, NextResponse } from 'next/server';
import type { ReviewerDisclosure } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { revalidateContent } from '@/lib/cache';
import { audit } from '@/lib/services/audit-service';

/**
 * The signed-in trusted reviewer's public details (proposal §6.14a).
 * GET → { eligible, profile } (eligible = holds ≥1 TRUSTED_REVIEWER grant). The admin's
 *       verification note is never returned here.
 * PUT { publicName, credential, affiliation, disclosure } → { ok, profile, verificationCleared }
 *       403 not a trusted reviewer · 400 invalid. Changing the credential, public name or
 *       affiliation after verification clears the verification (an admin must check again).
 */
const DISCLOSURES: ReviewerDisclosure[] = ['NONE', 'ANONYMOUS', 'CREDENTIAL', 'FULL'];
const LIMITS = { publicName: 100, credential: 150, affiliation: 150 } as const;

/** One line of plain text: no control characters, collapsed whitespace. '' = empty; undefined = too long/invalid. */
function cleanLine(v: unknown, max: number): string | undefined {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'string') return undefined;
  const s = v
    .replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > max ? undefined : s;
}

async function isEligible(userId: string): Promise<boolean> {
  return (await prisma.courseMember.count({ where: { userId, role: 'TRUSTED_REVIEWER' } })) > 0;
}

const PROFILE_SELECT = {
  publicName: true,
  credential: true,
  affiliation: true,
  disclosure: true,
  verifiedAt: true,
} as const;

export async function GET() {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [eligible, profile] = await Promise.all([
    isEligible(session.user.id),
    prisma.reviewerProfile.findUnique({ where: { userId: session.user.id }, select: PROFILE_SELECT }),
  ]);
  return NextResponse.json({ eligible, profile });
}

export async function PUT(req: NextRequest) {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  if (!(await isEligible(userId))) {
    return NextResponse.json({ error: 'Chỉ người duyệt tin cậy của một khóa học mới có hồ sơ này' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const publicName = cleanLine(body.publicName, LIMITS.publicName);
  const credential = cleanLine(body.credential, LIMITS.credential);
  const affiliation = cleanLine(body.affiliation, LIMITS.affiliation);
  if (publicName === undefined) return NextResponse.json({ error: `Tên công khai tối đa ${LIMITS.publicName} ký tự` }, { status: 400 });
  if (credential === undefined) return NextResponse.json({ error: `Chuyên môn tối đa ${LIMITS.credential} ký tự` }, { status: 400 });
  if (affiliation === undefined) return NextResponse.json({ error: `Nơi công tác tối đa ${LIMITS.affiliation} ký tự` }, { status: 400 });
  if (!DISCLOSURES.includes(body.disclosure)) {
    return NextResponse.json({ error: 'Mức hiển thị không hợp lệ' }, { status: 400 });
  }
  const disclosure = body.disclosure as ReviewerDisclosure;
  if ((disclosure === 'CREDENTIAL' || disclosure === 'FULL') && !credential) {
    return NextResponse.json({ error: 'Hãy ghi chuyên môn để chọn mức này' }, { status: 400 });
  }
  if (disclosure === 'FULL' && !publicName) {
    return NextResponse.json({ error: 'Hãy ghi tên công khai để chọn mức “Tên và chuyên môn”' }, { status: 400 });
  }

  const data = {
    publicName: publicName || null,
    credential: credential || null,
    affiliation: affiliation || null,
    disclosure,
  };

  const { profile, verificationCleared } = await prisma.$transaction(async (tx) => {
    const before = await tx.reviewerProfile.findUnique({ where: { userId } });
    const identityChanged =
      !!before &&
      (before.publicName !== data.publicName ||
        before.credential !== data.credential ||
        before.affiliation !== data.affiliation);
    const clear = !!before?.verifiedAt && identityChanged;
    const saved = await tx.reviewerProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data, ...(clear ? { verifiedAt: null, verifiedById: null, verificationNote: null } : {}) },
      select: PROFILE_SELECT,
    });
    if (clear) {
      await audit(tx, {
        actorId: userId,
        action: 'REVIEWER_UNVERIFIED',
        targetType: 'USER',
        targetId: userId,
        details: { reason: 'profile edited' },
      });
    }
    return { profile: saved, verificationCleared: clear };
  });

  revalidateContent();
  return NextResponse.json({ ok: true, profile, verificationCleared });
}

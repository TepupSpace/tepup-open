import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContributorSession } from '@/lib/admin-auth';
import { getLiveTarget, isEditProposalType } from '@/lib/services/proposal-service';
import {
  levelKey,
  validateCourseOutlineProposal,
  type CourseOutlineProposal,
} from '@/lib/schemas/contribution-types/course-outline';
import type { CourseOutline } from '@/lib/types/outline';

/**
 * POST /api/contributor/contributions/[id]/rebase — "Cập nhật theo bản mới" (proposal §6.3).
 *
 * Author only; DRAFT or CHANGES_REQUESTED edit proposals. Moves `baseSnapshot`/`baseUpdatedAt`
 * to the current live version and keeps the contributor's `data` (they merge by hand; no
 * three-way merge in v1). Returns the old and the new base so the editor can show what
 * changed live.
 *
 * Course outlines: the proposal must list every live level and lesson (no deletions), so
 * levels/lessons added live since the base are appended to the proposal and ones removed
 * live are dropped from it; `outlineAdjusted` says so.
 *
 * 200 { oldBase, newBase, baseUpdatedAt, outlineAdjusted }
 * 400 wrong status or type · 401 · 404 not the author's, or target gone / hidden from them.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContributorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const contribution = await prisma.contribution.findFirst({
    where: { id, contributorId: session.user.id },
    select: { id: true, type: true, status: true, targetId: true, data: true, baseSnapshot: true, updatedAt: true },
  });
  if (!contribution) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  if (!isEditProposalType(contribution.type)) {
    return NextResponse.json({ error: 'Chỉ đề xuất sửa mới cập nhật theo bản mới được' }, { status: 400 });
  }
  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(contribution.status)) {
    return NextResponse.json(
      { error: 'Chỉ cập nhật được bản nháp hoặc đề xuất cần chỉnh sửa' },
      { status: 400 }
    );
  }

  const live = await getLiveTarget(
    { id: session.user.id, role: session.user.role as UserRole },
    contribution.type,
    contribution.targetId
  );
  // Neutral wording: for outlines, null also means "has hidden lessons" (don't reveal that).
  if (!live) return NextResponse.json({ error: 'Không tìm thấy nội dung cần sửa' }, { status: 404 });

  const newBase = JSON.parse(JSON.stringify(live.snapshot)) as Prisma.InputJsonValue;
  let newData: Prisma.InputJsonValue | undefined;
  let outlineAdjusted = false;
  if (contribution.type === 'EDIT_COURSE') {
    const checked = validateCourseOutlineProposal(contribution.data);
    const outline = (live.snapshot as { outline: CourseOutline }).outline;
    if (checked.ok) {
      const merged = mergeOutlineProposal(checked.value, outline);
      outlineAdjusted = JSON.stringify(merged) !== JSON.stringify(checked.value);
      if (outlineAdjusted) newData = merged as unknown as Prisma.InputJsonValue;
    }
  }

  // Conditional on the row not having changed since it was read (a save in between keeps
  // its data; the client simply retries).
  const updated = await prisma.contribution.updateMany({
    where: { id, contributorId: session.user.id, updatedAt: contribution.updatedAt, status: { in: ['DRAFT', 'CHANGES_REQUESTED'] } },
    data: { baseSnapshot: newBase, baseUpdatedAt: live.updatedAt, ...(newData !== undefined && { data: newData }) },
  });
  if (updated.count !== 1) {
    return NextResponse.json({ error: 'Đề xuất vừa được lưu ở nơi khác. Hãy thử lại.' }, { status: 409 });
  }
  const after = await prisma.contribution.findUnique({ where: { id }, select: { updatedAt: true, data: true } });

  return NextResponse.json({
    oldBase: contribution.baseSnapshot,
    newBase,
    baseUpdatedAt: live.updatedAt?.toISOString() ?? null,
    outlineAdjusted,
    data: outlineAdjusted ? after?.data : undefined,
    updatedAt: after?.updatedAt.toISOString() ?? null,
  });
}

/** Keeps the author's outline edits, made consistent with a newer live outline (no deletions). */
function mergeOutlineProposal(p: CourseOutlineProposal, live: CourseOutline): CourseOutlineProposal {
  const liveLevelIds = new Set(live.levels.map((l) => l.id));
  const liveLessonIds = new Set(live.lessons.map((l) => l.id));

  const levels = p.levels.filter((l) => !l.id || liveLevelIds.has(l.id));
  const present = new Set(levels.map((l) => l.id).filter(Boolean));
  for (const l of live.levels) {
    if (!present.has(l.id)) levels.push({ id: l.id, tempKey: l.id, name: l.name });
  }
  const refs = new Set(levels.map(levelKey));
  const fallbackRef = levels[0] ? levelKey(levels[0]) : null;

  const lessons = p.lessons
    .filter((l) => !l.id || liveLessonIds.has(l.id))
    .map((l) => (refs.has(l.levelRef) || !fallbackRef ? l : { ...l, levelRef: fallbackRef }));
  const presentLessons = new Set(lessons.map((l) => l.id).filter(Boolean));
  for (const l of live.lessons) {
    if (!presentLessons.has(l.id)) lessons.push({ id: l.id, tempKey: l.id, name: l.name, levelRef: l.levelId });
  }
  return { ...p, levels, lessons };
}

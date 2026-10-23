import type { Prisma, RevisionTarget } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { rebuildUsage } from '@/lib/library/usage-service';
import { contentErrorBody, sanitizeAdminBlocks, validateContributorBlocks } from '@/lib/schemas/content-validation';
import {
  blocksSnapshot,
  lockChapterContent,
  lockCourse,
  lockLessonContent,
  lockLibraryEntry,
  recordRevision,
} from '@/lib/services/revision-service';
import { buildOutline, recordOutlineRevision } from '@/lib/services/outline-service';
import { blocksForRequestCompare, closeReviewRequestsOnPublish } from '@/lib/services/review-request-service';
import { audit } from '@/lib/services/audit-service';
import { entryInput, type EntryInput } from '@/lib/library/schemas';
import { EntryValidationError, prepareEntryWrite, updateEntryInTx } from '@/lib/library/entry-service';
import { entrySnapshotJson, readEntrySnapshot } from '@/lib/library/entry-snapshot';
import { normalizeEntrySnapshot, normalizeOutline } from '@/lib/diff';
import type { Viewer } from '@/lib/permissions/course-roles';
import { canOnCourse } from '@/lib/permissions/course-roles';

/**
 * "Khôi phục bản này" (proposal §6.10). Writes a revision's version back as live content
 * through the same rules as the normal write paths: row lock, trim, sanitize (admins) or
 * STRICT validation (maintainers: no `custom` blocks), rebuildUsage, a ROLLBACK revision
 * (auto-patrolled for admins) and a CONTENT_ROLLED_BACK audit row, in one transaction.
 *
 * The caller has already checked that the viewer may restore this target type
 * (historyAccess().canRestore); maintainers only reach LESSON and COURSE_OUTLINE.
 */

export type RestoreResult =
  | { ok: true; revisionId: string | null; targetType: RevisionTarget }
  | { ok: false; status: number; body: Record<string, unknown> };

class RestoreError extends Error {
  constructor(readonly status: number, readonly body: Record<string, unknown>) {
    super(String(body.error ?? 'restore failed'));
  }
}

const GONE = {
  LESSON: 'Bài học này đã bị xóa nên không khôi phục được. Hãy dùng "Sao chép nội dung" để tạo lại.',
  CHAPTER: 'Chương này đã bị xóa nên không khôi phục được.',
  LIBRARY_ENTRY: 'Mục thư viện này đã bị xóa nên không khôi phục được.',
  COURSE_OUTLINE: 'Khóa học này đã bị xóa nên không khôi phục được.',
} satisfies Record<RevisionTarget, string>;

export async function restoreRevision(
  viewer: Viewer,
  revisionId: string,
  opts: { baseRevisionId?: string | null }
): Promise<RestoreResult> {
  const isAdmin = viewer.role === 'ADMIN';
  const rev = await prisma.contentRevision.findUnique({
    where: { id: revisionId },
    select: { id: true, targetType: true, targetId: true, courseId: true, snapshot: true, source: true, authorId: true, label: true },
  });
  if (!rev) return { ok: false, status: 404, body: { error: 'Không tìm thấy phiên bản' } };

  try {
    const newId = await prisma.$transaction(
      async (tx) => {
        // Lock the target first, then check: a publish or another restore that commits
        // while we wait is then seen by the check below (READ COMMITTED), never overwritten.
        // The restore helpers lock again (re-entrant within the transaction).
        switch (rev.targetType) {
          case 'LESSON':
            await lockLessonContent(tx, rev.targetId);
            break;
          case 'CHAPTER':
            await lockChapterContent(tx, rev.targetId);
            break;
          case 'LIBRARY_ENTRY':
            await lockLibraryEntry(tx, rev.targetId);
            break;
          case 'COURSE_OUTLINE':
            await lockCourse(tx, rev.targetId);
            break;
        }
        // Conflict: someone changed the target after the page loaded its history.
        const latest = await tx.contentRevision.findFirst({
          where: { targetType: rev.targetType, targetId: rev.targetId },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: { id: true },
        });
        if (opts.baseRevisionId && latest && latest.id !== opts.baseRevisionId) {
          throw new RestoreError(409, {
            error: 'Nội dung đã thay đổi sau khi bạn mở lịch sử. Hãy tải lại trang rồi thử lại.',
            code: 'stale',
            latestRevisionId: latest.id,
          });
        }
        if (latest?.id === rev.id && rev.source !== 'DELETED') {
          throw new RestoreError(400, { error: 'Đây đã là phiên bản hiện tại.', code: 'current' });
        }

        let id: string | null;
        switch (rev.targetType) {
          case 'LESSON':
            id = await restoreLesson(tx, viewer, isAdmin, rev);
            break;
          case 'CHAPTER':
            id = await restoreChapter(tx, viewer, rev);
            break;
          case 'LIBRARY_ENTRY':
            id = await restoreEntry(tx, viewer, rev);
            break;
          case 'COURSE_OUTLINE':
            id = await restoreOutline(tx, viewer, isAdmin, rev);
            break;
        }
        await audit(tx, {
          actorId: viewer.id,
          action: 'CONTENT_ROLLED_BACK',
          targetType: rev.targetType,
          targetId: rev.targetId,
          details: { restoredRevisionId: rev.id, newRevisionId: id, courseId: rev.courseId },
        });
        return id;
      },
      { timeout: 30_000 }
    );
    return { ok: true, revisionId: newId, targetType: rev.targetType };
  } catch (e) {
    if (e instanceof RestoreError) return { ok: false, status: e.status, body: e.body };
    if (e instanceof EntryValidationError) {
      return { ok: false, status: 422, body: { error: 'Phiên bản này không còn hợp lệ', issues: e.issues } };
    }
    throw e;
  }
}

type Rev = { id: string; targetId: string; courseId: string | null; snapshot: Prisma.JsonValue; authorId: string | null; label: string };
type Tx = Prisma.TransactionClient;

function blocksOf(snapshot: Prisma.JsonValue): { title: string; blocks: unknown } {
  const s = snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) ? (snapshot as Record<string, unknown>) : {};
  return { title: typeof s.title === 'string' ? s.title : '', blocks: s.blocks ?? [] };
}

async function restoreLesson(tx: Tx, viewer: Viewer, isAdmin: boolean, rev: Rev): Promise<string> {
  const lesson = await tx.lesson.findUnique({ where: { id: rev.targetId }, select: { name: true, courseId: true } });
  if (!lesson) throw new RestoreError(410, { error: GONE.LESSON, code: 'gone' });
  // The lesson may have moved course since; permission is re-checked on its current course.
  if (!isAdmin && !(await canOnCourse(viewer, lesson.courseId, 'ROLLBACK'))) {
    throw new RestoreError(404, { error: 'Không tìm thấy' });
  }
  const live = await lockLessonContent(tx, rev.targetId);
  const { title: rawTitle, blocks: rawBlocks } = blocksOf(rev.snapshot);
  const trimmed = trimEmptyBlocks(Array.isArray(rawBlocks) ? rawBlocks : []).blocks;
  // Admins: same defence as the admin publish route. Maintainers: the contributor rules
  // (strict schema, no `custom` blocks), so only an admin can restore such a version.
  const checked = isAdmin ? sanitizeAdminBlocks(trimmed) : validateContributorBlocks(trimmed);
  if (!checked.ok) {
    throw new RestoreError(422, {
      ...contentErrorBody(checked.issues),
      code: 'invalid',
      hint: isAdmin ? undefined : 'Phiên bản này có nội dung chỉ quản trị viên khôi phục được (ví dụ block tùy chỉnh).',
    });
  }
  const blocks = checked.value as Prisma.InputJsonValue;
  const title = rawTitle.trim() || live?.title || lesson.name;
  await tx.lessonContent.upsert({
    where: { lessonId: rev.targetId },
    create: { lessonId: rev.targetId, title, blocks },
    update: { title, blocks },
  });
  const id = await recordRevision(tx, {
    targetType: 'LESSON',
    targetId: rev.targetId,
    courseId: lesson.courseId,
    label: lesson.name,
    snapshot: blocksSnapshot(title, blocks),
    source: 'ROLLBACK',
    actorId: viewer.id,
    authorId: rev.authorId,
    previous: live && blocksSnapshot(live.title, live.blocks),
    autoPatrol: isAdmin,
  });
  // A restore publishes a new live version: open "Gửi người duyệt" requests close.
  await closeReviewRequestsOnPublish(tx, rev.targetId, { title, blocks: blocksForRequestCompare(blocks) }, id);
  await rebuildUsage(tx, 'LESSON', rev.targetId, blocks);
  return id;
}

async function restoreChapter(tx: Tx, viewer: Viewer, rev: Rev): Promise<string> {
  const chapter = await tx.chapter.findUnique({ where: { id: rev.targetId }, select: { title: true } });
  if (!chapter) throw new RestoreError(410, { error: GONE.CHAPTER, code: 'gone' });
  const live = await lockChapterContent(tx, rev.targetId);
  const { title, blocks: rawBlocks } = blocksOf(rev.snapshot);
  const checked = sanitizeAdminBlocks(trimEmptyBlocks(Array.isArray(rawBlocks) ? rawBlocks : []).blocks);
  if (!checked.ok) throw new RestoreError(422, { ...contentErrorBody(checked.issues), code: 'invalid' });
  const blocks = checked.value as Prisma.InputJsonValue;
  await tx.chapterContent.upsert({
    where: { chapterId: rev.targetId },
    create: { chapterId: rev.targetId, title, blocks },
    update: { title, blocks },
  });
  const id = await recordRevision(tx, {
    targetType: 'CHAPTER',
    targetId: rev.targetId,
    label: chapter.title,
    snapshot: blocksSnapshot(title, blocks),
    source: 'ROLLBACK',
    actorId: viewer.id,
    authorId: rev.authorId,
    previous: live && blocksSnapshot(live.title, live.blocks),
    autoPatrol: true,
  });
  await rebuildUsage(tx, 'CHAPTER', rev.targetId, blocks);
  return id;
}

async function restoreEntry(tx: Tx, viewer: Viewer, rev: Rev): Promise<string | null> {
  if (!(await lockLibraryEntry(tx, rev.targetId))) throw new RestoreError(410, { error: GONE.LIBRARY_ENTRY, code: 'gone' });
  const live = await tx.libraryEntry.findUniqueOrThrow({
    where: { id: rev.targetId },
    select: { slug: true, type: true, isActive: true },
  });
  const snap = normalizeEntrySnapshot(rev.snapshot);
  // slug, type and visibility are not versioned: keep the live values.
  const parsed = entryInput.safeParse({
    slug: live.slug,
    type: live.type,
    isActive: live.isActive,
    title: snap.title,
    summary: snap.summary,
    body: snap.body ?? null,
    meta: snap.meta,
    links: snap.links,
  });
  if (!parsed.success) {
    throw new RestoreError(422, {
      error: 'Phiên bản này không còn hợp lệ',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
  }
  const input: EntryInput = parsed.data;
  // Links to entries deleted since then are dropped rather than refusing the restore.
  const targets = new Set(
    (await tx.libraryEntry.findMany({ where: { id: { in: input.links.map((l) => l.toId) } }, select: { id: true } })).map((r) => r.id)
  );
  input.links = input.links.filter((l) => targets.has(l.toId));
  const before = await readEntrySnapshot(tx, rev.targetId);
  const prepared = await prepareEntryWrite(input, rev.targetId);
  await updateEntryInTx(tx, rev.targetId, input, prepared);
  const now = await readEntrySnapshot(tx, rev.targetId);
  if (!now) return null;
  return recordRevision(tx, {
    targetType: 'LIBRARY_ENTRY',
    targetId: rev.targetId,
    label: now.label,
    snapshot: entrySnapshotJson(now.snapshot),
    source: 'ROLLBACK',
    actorId: viewer.id,
    authorId: rev.authorId,
    previous: before && entrySnapshotJson(before.snapshot),
    autoPatrol: true,
  });
}

/**
 * Puts back names, order, level membership and visibility for levels and lessons that
 * still exist in the course. Never re-creates deleted ones, never deletes ones added since.
 * Non-admins (maintainers) change lesson visibility only in an active course, as with
 * show/hide (proposal §2, decision 4).
 */
async function restoreOutline(tx: Tx, viewer: Viewer, isAdmin: boolean, rev: Rev): Promise<string | null> {
  const courseId = rev.targetId;
  if (!(await lockCourse(tx, courseId))) throw new RestoreError(410, { error: GONE.COURSE_OUTLINE, code: 'gone' });
  const course = await tx.course.findUniqueOrThrow({ where: { id: courseId }, select: { isActive: true } });
  const target = normalizeOutline(rev.snapshot);
  const before = await buildOutline(tx, courseId);
  if (!before) throw new RestoreError(410, { error: GONE.COURSE_OUTLINE, code: 'gone' });

  const levelNow = new Map(before.levels.map((l) => [l.id, l]));
  const lessonNow = new Map(before.lessons.map((l) => [l.id, l]));
  const mayToggle = isAdmin || course.isActive;
  let changed = false;

  const name = target.course.name.trim();
  if ((name && name !== before.course.name) || target.course.description !== before.course.description) {
    await tx.course.update({
      where: { id: courseId },
      data: { name: name || before.course.name, description: target.course.description },
    });
    changed = true;
  }
  for (const l of target.levels) {
    const now = levelNow.get(l.id);
    if (!now) continue; // deleted since: not re-created
    if (now.name !== l.name || now.sortOrder !== l.sortOrder) {
      await tx.level.update({ where: { id: l.id }, data: { name: l.name || now.name, sortOrder: l.sortOrder } });
      changed = true;
    }
  }
  for (const l of target.lessons) {
    const now = lessonNow.get(l.id);
    if (!now) continue;
    const levelId = levelNow.has(l.levelId) ? l.levelId : now.levelId;
    const isActive = mayToggle ? l.isActive : now.isActive;
    if (now.name !== l.name || now.sortOrder !== l.sortOrder || now.levelId !== levelId || now.isActive !== isActive) {
      await tx.lesson.update({
        where: { id: l.id },
        data: { name: l.name || now.name, sortOrder: l.sortOrder, levelId, isActive },
      });
      changed = true;
    }
  }
  if (!changed) throw new RestoreError(400, { error: 'Mục lục hiện tại đã giống phiên bản này.', code: 'current' });
  return recordOutlineRevision(tx, courseId, {
    source: 'ROLLBACK',
    actorId: viewer.id,
    authorId: rev.authorId,
    previous: before,
    autoPatrol: isAdmin,
  });
}

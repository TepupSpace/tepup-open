import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { revalidateContent, revalidateLibrary } from '@/lib/cache';
import { rebuildUsage } from '@/lib/library/usage-service';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { blocksSnapshot, lockCourse, lockLessonContent, recordRevision } from '@/lib/services/revision-service';
import { buildOutline, recordOutlineRevision } from '@/lib/services/outline-service';
import { closeReviewRequestsOnPublish } from '@/lib/services/review-request-service';
import { lessonSlugInCourse } from '@/lib/api-helpers';
import { prepareBlocksForSave } from '@/lib/ai-import/normalize';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { contentErrorBody, sanitizeAdminBlocks } from '@/lib/schemas/content-validation';
import {
  deleteDraft,
  getDraft,
  isPublishConflict,
  parseIsoDate,
  publishConflictBody,
} from '@/lib/services/draft-service';
import type { LessonDraftMeta } from '@/lib/types/drafts';

// GET /api/admin/lessons/[id]/content - Get lesson content
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: lessonId } = await params;

    const [lesson, draft] = await Promise.all([
      prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          content: true,
          level: {
            include: {
              course: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      // The editor offers to resume this; its baseUpdatedAt goes back on publish.
      getDraft<LessonDraftMeta>('LESSON', lessonId),
    ]);

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        lesson: {
          id: lesson.id,
          name: lesson.name,
          slug: lesson.slug ?? '',
          isActive: lesson.isActive,
          sortOrder: lesson.sortOrder,
          course: lesson.level.course,
          level: { id: lesson.level.id, name: lesson.level.name },
        },
        // content.updatedAt is the publish conflict base (null: nothing published yet).
        content: lesson.content || {
          title: lesson.name,
          blocks: [],
          updatedAt: null,
        },
        draft,
      },
    });
  } catch (error) {
    console.error('Error fetching lesson content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson content' },
      { status: 500 }
    );
  }
}

/** Thrown inside the publish transaction when live content is newer than the editor's base. */
class PublishConflict extends Error {
  constructor(readonly liveUpdatedAt: Date) {
    super('publish conflict');
  }
}

/** The lesson was deleted while this publish waited for its locks. */
class LessonGone extends Error {}

// PUT /api/admin/lessons/[id]/content - Update lesson content ("Xuất bản")
// Optional body fields: baseUpdatedAt (live content.updatedAt the editor loaded) and
// force. A newer live version returns 409 unless force; a successful publish deletes
// the lesson's draft.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const body = await request.json().catch(() => null);
    // A JSON `null`, array or malformed body is a client error, not a 500.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const { title, blocks, meta } = body;
    const baseUpdatedAt = parseIsoDate(body.baseUpdatedAt);
    // The editor sends `baseUpdatedAt: null` when it loaded a lesson with no content yet:
    // content published since then is a conflict too. (Old clients omit the field.)
    const baseWasEmpty = body.baseUpdatedAt === null && Object.prototype.hasOwnProperty.call(body, 'baseUpdatedAt');
    const force = body.force === true;

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Tiêu đề là bắt buộc' },
        { status: 400 }
      );
    }

    // 1. Normalise AI-pasted JSON (lib/ai-import) and check block structure.
    // Empty lines would be blank steps in the player; the editor trims them too, so the
    // "Block #N" in any error below matches the editor's numbering.
    const prepared = prepareBlocksForSave(trimEmptyBlocks(blocks).blocks);
    if (prepared.errors.length) {
      return NextResponse.json(
        { error: 'Có block sai cấu trúc', details: prepared.errors },
        { status: 400 }
      );
    }
    // 2. Admins are trusted with structure (and `custom` blocks), but a hijacked admin
    //    session still must not be able to store script or third-party media.
    const cleaned = sanitizeAdminBlocks(prepared.blocks);
    if (!cleaned.ok) {
      return NextResponse.json(contentErrorBody(cleaned.issues), { status: 400 });
    }
    const safeBlocks = cleaned.value as Prisma.InputJsonValue;

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // An empty slug field means "leave it alone", not "clear it" — a lesson without
    // a slug has no URL. A supplied slug is normalised and de-duplicated within the
    // course, which is the scope its URL has to be unique in.
    const slug = meta
      ? meta.slug && meta.slug.trim()
        ? await lessonSlugInCourse(lesson.courseId, lesson.name, meta.slug, lessonId)
        : lesson.slug
      : null;

    const content = await prisma.$transaction(async (tx) => {
      // Visibility/order are part of the course outline, which has its own history and
      // serialises on the Course row. Lock order: Course first, then the lesson content.
      const mayChangeOutline =
        !!meta && (typeof meta.isActive === 'boolean' || Number.isFinite(meta.sortOrder));
      if (mayChangeOutline) await lockCourse(tx, lesson.courseId);

      // Someone else (or an approved contribution) published after this editor loaded.
      // Checked under the row lock, so two publishers can't both pass it.
      // Old clients send no baseUpdatedAt and skip the check.
      const live = await lockLessonContent(tx, lessonId);
      if (!force && live && (isPublishConflict(live.updatedAt, baseUpdatedAt) || (baseWasEmpty && !baseUpdatedAt))) {
        throw new PublishConflict(live.updatedAt);
      }
      // Re-read under the locks: the outline may have changed since the read above.
      const current = await tx.lesson.findUnique({
        where: { id: lessonId },
        select: { isActive: true, sortOrder: true },
      });
      if (!current) throw new LessonGone();
      const outlineChanges =
        !!meta &&
        ((typeof meta.isActive === 'boolean' && meta.isActive !== current.isActive) ||
          (Number.isFinite(meta.sortOrder) && meta.sortOrder !== current.sortOrder));
      const outlineBefore = outlineChanges ? await buildOutline(tx, lesson.courseId) : null;

      // Update lesson metadata (slug / visibility / order) when provided.
      if (meta) {
        await tx.lesson.update({
          where: { id: lessonId },
          data: {
            slug: slug ?? lesson.slug,
            isActive: typeof meta.isActive === 'boolean' ? meta.isActive : current.isActive,
            sortOrder: Number.isFinite(meta.sortOrder) ? meta.sortOrder : current.sortOrder,
          },
        });
      }

      // Upsert content
      const saved = await tx.lessonContent.upsert({
        where: { lessonId },
        create: {
          lessonId,
          title: title.trim(),
          blocks: safeBlocks,
        },
        update: {
          title: title.trim(),
          blocks: safeBlocks,
        },
      });

      // History: record the version just published (revision-service.ts). Admin changes
      // are auto-patrolled (proposal §6.18).
      const savedTitle = title.trim();
      const revisionId = await recordRevision(tx, {
        targetType: 'LESSON',
        targetId: lessonId,
        courseId: lesson.courseId,
        label: lesson.name,
        snapshot: blocksSnapshot(savedTitle, safeBlocks),
        source: 'ADMIN_PUBLISH',
        actorId: session.user.id,
        authorId: session.user.id,
        previous: live && blocksSnapshot(live.title, live.blocks),
        autoPatrol: true,
      });
      if (outlineChanges) {
        await recordOutlineRevision(tx, lesson.courseId, {
          source: 'ADMIN_PUBLISH',
          actorId: session.user.id,
          previous: outlineBefore,
          autoPatrol: true,
        });
      }
      // "Gửi người duyệt" requests for this lesson close on publish.
      await closeReviewRequestsOnPublish(tx, lessonId, { title: savedTitle, blocks: safeBlocks }, revisionId);

      // Published: the draft has served its purpose.
      await deleteDraft('LESSON', lessonId, tx);
      // "Xuất hiện trong" of every library entry this lesson links to (lib/library/usage-service.ts).
      await rebuildUsage(tx, 'LESSON', lessonId, safeBlocks);
      return saved;
    });

    revalidateContent();
    revalidateLibrary();
    return NextResponse.json({ data: content });
  } catch (error) {
    if (error instanceof PublishConflict) {
      return NextResponse.json(publishConflictBody(error.liveUpdatedAt), { status: 409 });
    }
    if (error instanceof LessonGone) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    console.error('Error updating lesson content:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson content' },
      { status: 500 }
    );
  }
}

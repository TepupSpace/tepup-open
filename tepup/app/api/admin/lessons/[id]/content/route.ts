import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { lessonSlugInCourse } from '@/lib/api-helpers';
import { prepareBlocksForSave } from '@/lib/ai-import/normalize';
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
    const body = await request.json();
    const { title, blocks, meta } = body;
    const baseUpdatedAt = parseIsoDate(body.baseUpdatedAt);
    const force = body.force === true;

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Tiêu đề là bắt buộc' },
        { status: 400 }
      );
    }

    // 1. Normalise AI-pasted JSON (lib/ai-import) and check block structure.
    const prepared = prepareBlocksForSave(blocks);
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
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { content: { select: { updatedAt: true } } },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Someone else (or an approved contribution) published after this editor loaded.
    // Old clients send no baseUpdatedAt and skip the check.
    if (!force && isPublishConflict(lesson.content?.updatedAt, baseUpdatedAt)) {
      return NextResponse.json(publishConflictBody(lesson.content!.updatedAt), { status: 409 });
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
      // Update lesson metadata (slug / visibility / order) when provided.
      if (meta) {
        await tx.lesson.update({
          where: { id: lessonId },
          data: {
            slug: slug ?? lesson.slug,
            isActive: typeof meta.isActive === 'boolean' ? meta.isActive : lesson.isActive,
            sortOrder: Number.isFinite(meta.sortOrder) ? meta.sortOrder : lesson.sortOrder,
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

      // Published: the draft has served its purpose.
      await deleteDraft('LESSON', lessonId, tx);
      return saved;
    });

    revalidateContent();
    return NextResponse.json({ data: content });
  } catch (error) {
    console.error('Error updating lesson content:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson content' },
      { status: 500 }
    );
  }
}

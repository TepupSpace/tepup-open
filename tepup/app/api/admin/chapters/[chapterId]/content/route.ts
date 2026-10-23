import { NextResponse } from 'next/server';
import { revalidateContent, revalidateLibrary } from '@/lib/cache';
import { rebuildUsage } from '@/lib/library/usage-service';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { contentErrorBody, sanitizeAdminBlocks } from '@/lib/schemas/content-validation';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
import { blocksSnapshot, lockChapterContent, recordRevision } from '@/lib/services/revision-service';
import {
  deleteDraft,
  getDraft,
  isPublishConflict,
  parseIsoDate,
  publishConflictBody,
} from '@/lib/services/draft-service';

// GET chapter content
export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chapterId } = await params;

  try {
    const [content, draft] = await Promise.all([
      prisma.chapterContent.findUnique({
        where: { chapterId },
      }),
      // The editor offers to resume this; its baseUpdatedAt goes back on publish.
      getDraft('CHAPTER', chapterId),
    ]);

    return NextResponse.json({
      data: {
        title: content?.title || '',
        blocks: content?.blocks || [],
        // Publish conflict base (null: nothing published yet).
        updatedAt: content ? content.updatedAt.toISOString() : null,
        draft,
      },
    });
  } catch (error) {
    console.error('Error fetching chapter content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
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

// PUT update chapter content ("Xuất bản")
// Optional body fields: baseUpdatedAt (the updatedAt the editor loaded) and force.
// A newer live version returns 409 unless force; a successful publish deletes the draft.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chapterId } = await params;

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const { title, blocks } = body;
    const baseUpdatedAt = parseIsoDate(body.baseUpdatedAt);
    // The editor sends `baseUpdatedAt: null` when it loaded a chapter with no content yet:
    // content published since then is a conflict too (same rule as the lesson route).
    const baseWasEmpty = body.baseUpdatedAt === null && Object.prototype.hasOwnProperty.call(body, 'baseUpdatedAt');
    const force = body.force === true;

    // Same defence in depth as lesson content: sanitise HTML, refuse off-list media.
    // Empty lines would be blank steps in the player (see lib/editor/trim-empty-blocks.ts).
    const cleaned = sanitizeAdminBlocks(trimEmptyBlocks(blocks).blocks);
    if (!cleaned.ok) {
      return NextResponse.json(contentErrorBody(cleaned.issues), { status: 400 });
    }
    const safeBlocks = cleaned.value as object[];

    const content = await prisma.$transaction(async (tx) => {
      // Someone else (or an approved contribution) published after this editor loaded.
      // Checked under the row lock, so two publishers can't both pass it.
      // Old clients send no baseUpdatedAt and skip the check.
      const live = await lockChapterContent(tx, chapterId);
      if (!force && live && (isPublishConflict(live.updatedAt, baseUpdatedAt) || (baseWasEmpty && !baseUpdatedAt))) {
        throw new PublishConflict(live!.updatedAt);
      }
      const chapter = await tx.chapter.findUnique({ where: { id: chapterId }, select: { title: true } });

      // Upsert content
      const saved = await tx.chapterContent.upsert({
        where: { chapterId },
        create: {
          chapterId,
          title: title || '',
          blocks: safeBlocks,
        },
        update: {
          title: title || '',
          blocks: safeBlocks,
        },
      });

      // History: record the version just published (revision-service.ts). Admin changes
      // are auto-patrolled (proposal §6.18).
      await recordRevision(tx, {
        targetType: 'CHAPTER',
        targetId: chapterId,
        label: chapter?.title || saved.title,
        snapshot: blocksSnapshot(saved.title, safeBlocks),
        source: 'ADMIN_PUBLISH',
        actorId: session.user.id,
        authorId: session.user.id,
        previous: live && blocksSnapshot(live.title, live.blocks),
        autoPatrol: true,
      });

      // Published: the draft has served its purpose.
      await deleteDraft('CHAPTER', chapterId, tx);
      // "Xuất hiện trong" of every library entry this chapter links to (lib/library/usage-service.ts).
      await rebuildUsage(tx, 'CHAPTER', chapterId, safeBlocks);
      return saved;
    });

    revalidateContent();
    revalidateLibrary();
    return NextResponse.json({ data: content });
  } catch (error) {
    if (error instanceof PublishConflict) {
      return NextResponse.json(publishConflictBody(error.liveUpdatedAt), { status: 409 });
    }
    console.error('Error updating chapter content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

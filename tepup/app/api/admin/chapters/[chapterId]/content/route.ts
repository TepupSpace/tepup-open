import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { contentErrorBody, sanitizeAdminBlocks } from '@/lib/schemas/content-validation';
import { trimEmptyBlocks } from '@/lib/editor/trim-empty-blocks';
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
    const body = await request.json();
    const { title, blocks } = body;
    const baseUpdatedAt = parseIsoDate(body.baseUpdatedAt);
    const force = body.force === true;

    // Same defence in depth as lesson content: sanitise HTML, refuse off-list media.
    // Empty lines would be blank steps in the player (see lib/editor/trim-empty-blocks.ts).
    const cleaned = sanitizeAdminBlocks(trimEmptyBlocks(blocks).blocks);
    if (!cleaned.ok) {
      return NextResponse.json(contentErrorBody(cleaned.issues), { status: 400 });
    }
    const safeBlocks = cleaned.value as object[];

    // Someone else (or an approved contribution) published after this editor loaded.
    // Old clients send no baseUpdatedAt and skip the check.
    if (!force && baseUpdatedAt) {
      const live = await prisma.chapterContent.findUnique({
        where: { chapterId },
        select: { updatedAt: true },
      });
      if (live && isPublishConflict(live.updatedAt, baseUpdatedAt)) {
        return NextResponse.json(publishConflictBody(live.updatedAt), { status: 409 });
      }
    }

    const content = await prisma.$transaction(async (tx) => {
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

      // Published: the draft has served its purpose.
      await deleteDraft('CHAPTER', chapterId, tx);
      return saved;
    });

    revalidateContent();
    return NextResponse.json({ data: content });
  } catch (error) {
    console.error('Error updating chapter content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

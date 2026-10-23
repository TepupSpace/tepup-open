import { NextResponse } from 'next/server';
import { revalidateContent, revalidateLibrary } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { chapterSlugInStory } from '@/lib/api-helpers';
import { rebuildUsage } from '@/lib/library/usage-service';
import { blocksSnapshot, lockChapterContent, recordRevision } from '@/lib/services/revision-service';

// GET chapter by id
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
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        content: true,
        part: {
          include: {
            story: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: chapter });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}

// PUT update chapter
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
    const { title, slug } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Tiêu đề chương là bắt buộc' },
        { status: 400 }
      );
    }

    const existing = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { storyId: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // An empty slug means "leave it alone", not "clear it" — a chapter without a
    // slug has no URL. A supplied slug is de-duplicated within its story.
    const nextSlug = slug && slug.trim()
      ? await chapterSlugInStory(existing.storyId, title, slug, chapterId)
      : existing.slug;

    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { title, slug: nextSlug },
    });

    revalidateContent();
    return NextResponse.json({ data: chapter });
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { error: 'Failed to update chapter' },
      { status: 500 }
    );
  }
}

// DELETE chapter
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chapterId } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      // History outlives the chapter: keep its last content as a DELETED revision
      // (revisions have no FK to Chapter, so the delete leaves them in place).
      const live = await lockChapterContent(tx, chapterId);
      if (live) {
        const chapter = await tx.chapter.findUnique({ where: { id: chapterId }, select: { title: true } });
        await recordRevision(tx, {
          targetType: 'CHAPTER',
          targetId: chapterId,
          label: chapter?.title || live.title,
          snapshot: blocksSnapshot(live.title, live.blocks),
          source: 'DELETED',
          actorId: session.user.id,
          autoPatrol: true,
        });
      }
      // Drop this chapter from library entries' "Xuất hiện trong".
      await rebuildUsage(tx, 'CHAPTER', chapterId, []);
      // Delete content first (cascade should handle this but being explicit).
      // deleteMany: no error when there is no content (an error would abort the transaction).
      await tx.chapterContent.deleteMany({ where: { chapterId } });
      await tx.chapter.delete({ where: { id: chapterId } });
    });

    revalidateContent();
    // Library entries' "Xuất hiện trong" changed (rebuildUsage above).
    revalidateLibrary();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { error: 'Failed to delete chapter' },
      { status: 500 }
    );
  }
}

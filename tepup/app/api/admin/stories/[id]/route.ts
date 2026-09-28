import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// GET /api/admin/stories/[id] - Get single story
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        character: {
          select: { id: true, name: true },
        },
        parts: {
          orderBy: { sortOrder: 'asc' },
          include: {
            chapters: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        recommendations: {
          orderBy: { sortOrder: 'asc' },
          include: {
            course: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ data: story });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/stories/[id] - Update story
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { slug, characterId, title, teaser, icon, estimatedTime, isActive } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Tiêu đề là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if slug exists (excluding current story)
    if (slug) {
      const existingStory = await prisma.story.findFirst({
        where: {
          slug: slug.trim(),
          NOT: { id },
        },
      });

      if (existingStory) {
        return NextResponse.json(
          { error: 'Slug đã tồn tại. Vui lòng chọn slug khác.' },
          { status: 400 }
        );
      }
    }

    const story = await prisma.story.update({
      where: { id },
      data: {
        slug: slug?.trim().toLowerCase(),
        characterId: characterId || undefined,
        title: title.trim(),
        teaser: teaser?.trim() || null,
        icon: icon || 'book',
        estimatedTime: estimatedTime || '~20 phút',
        isActive: isActive ?? true,
      },
      include: {
        character: {
          select: { id: true, name: true },
        },
      },
    });

    revalidateContent();
    return NextResponse.json({ data: story });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/stories/[id] - Delete story
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Cascade delete will handle parts and chapters
    await prisma.story.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}

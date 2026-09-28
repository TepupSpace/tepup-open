import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { uniqueSlugForModel } from '@/lib/api-helpers';

// GET /api/admin/stories - List all stories
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stories = await prisma.story.findMany({
      orderBy: [{ characterId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        character: {
          select: { id: true, name: true },
        },
        _count: {
          select: { parts: true },
        },
      },
    });

    // Count chapters for each story
    const storiesWithChapterCount = await Promise.all(
      stories.map(async (story) => {
        const chapterCount = await prisma.chapter.count({
          where: {
            part: { storyId: story.id },
          },
        });
        return { ...story, chapterCount };
      })
    );

    return NextResponse.json({ data: storiesWithChapterCount });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/stories - Create new story
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, characterId, title, teaser, icon, estimatedTime } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Tiêu đề là bắt buộc' },
        { status: 400 }
      );
    }

    if (!characterId) {
      return NextResponse.json(
        { error: 'Nhân vật là bắt buộc' },
        { status: 400 }
      );
    }

    // Slug is optional: derived from the title unless the admin typed one.
    if (slug && slug.trim()) {
      const existingStory = await prisma.story.findUnique({
        where: { slug: slug.trim() },
      });

      if (existingStory) {
        return NextResponse.json(
          { error: 'Slug đã tồn tại. Vui lòng chọn slug khác.' },
          { status: 400 }
        );
      }
    }

    const finalSlug = await uniqueSlugForModel('story', title, slug);

    // Get max sortOrder
    const maxSortOrder = await prisma.story.aggregate({
      where: { characterId },
      _max: { sortOrder: true },
    });

    const story = await prisma.story.create({
      data: {
        slug: finalSlug,
        characterId,
        title: title.trim(),
        teaser: teaser?.trim() || null,
        icon: icon || 'book',
        estimatedTime: estimatedTime || '~20 phút',
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
      include: {
        character: {
          select: { id: true, name: true },
        },
      },
    });

    revalidateContent();
    return NextResponse.json({ data: story }, { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}

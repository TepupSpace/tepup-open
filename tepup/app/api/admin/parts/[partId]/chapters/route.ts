import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { chapterSlugInStory } from '@/lib/api-helpers';

// GET all chapters for a part
export async function GET(
  request: Request,
  { params }: { params: Promise<{ partId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partId } = await params;

  try {
    const chapters = await prisma.chapter.findMany({
      where: { partId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ data: chapters });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

// POST create new chapter
export async function POST(
  request: Request,
  { params }: { params: Promise<{ partId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partId } = await params;

  try {
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Tiêu đề chương là bắt buộc' },
        { status: 400 }
      );
    }

    const part = await prisma.storyPart.findUnique({
      where: { id: partId },
      select: { storyId: true },
    });

    if (!part) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    // Get max sortOrder
    const maxSortOrder = await prisma.chapter.aggregate({
      where: { partId },
      _max: { sortOrder: true },
    });

    const slug = await chapterSlugInStory(part.storyId, title.trim());

    const chapter = await prisma.chapter.create({
      data: {
        title,
        slug,
        partId,
        storyId: part.storyId,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
    });

    revalidateContent();
    return NextResponse.json({ data: chapter }, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    );
  }
}

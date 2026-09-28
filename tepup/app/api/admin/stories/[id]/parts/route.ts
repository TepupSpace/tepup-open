import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// GET all parts for a story
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: storyId } = await params;

  try {
    const parts = await prisma.storyPart.findMany({
      where: { storyId },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ data: parts });
  } catch (error) {
    console.error('Error fetching parts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parts' },
      { status: 500 }
    );
  }
}

// POST create new part
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: storyId } = await params;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tên phần là bắt buộc' },
        { status: 400 }
      );
    }

    // Get max sortOrder
    const maxSortOrder = await prisma.storyPart.aggregate({
      where: { storyId },
      _max: { sortOrder: true },
    });

    const part = await prisma.storyPart.create({
      data: {
        name,
        storyId,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
      include: {
        chapters: true,
      },
    });

    revalidateContent();
    return NextResponse.json({ data: part }, { status: 201 });
  } catch (error) {
    console.error('Error creating part:', error);
    return NextResponse.json(
      { error: 'Failed to create part' },
      { status: 500 }
    );
  }
}

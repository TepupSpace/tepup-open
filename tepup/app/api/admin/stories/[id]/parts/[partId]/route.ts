import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// PUT update part
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; partId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partId } = await params;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tên phần là bắt buộc' },
        { status: 400 }
      );
    }

    const part = await prisma.storyPart.update({
      where: { id: partId },
      data: { name },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    revalidateContent();
    return NextResponse.json({ data: part });
  } catch (error) {
    console.error('Error updating part:', error);
    return NextResponse.json(
      { error: 'Failed to update part' },
      { status: 500 }
    );
  }
}

// DELETE part
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; partId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partId } = await params;

  try {
    // Delete all chapters first (cascade should handle this but being explicit)
    await prisma.chapter.deleteMany({
      where: { partId },
    });

    await prisma.storyPart.delete({
      where: { id: partId },
    });

    revalidateContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting part:', error);
    return NextResponse.json(
      { error: 'Failed to delete part' },
      { status: 500 }
    );
  }
}

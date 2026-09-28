import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

/** URL ảnh từ form: chuỗi rỗng → null; không gửi field → giữ nguyên (undefined). */
function imageField(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

// GET /api/admin/characters/[id] - Get single character
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

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        stories: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: character });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/characters/[id] - Update character
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
    const { name, role, description, icon, color, bgColor, isActive, avatarUrl, imageUrl } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên nhân vật là bắt buộc' },
        { status: 400 }
      );
    }

    const character = await prisma.character.update({
      where: { id },
      data: {
        name: name.trim(),
        role: role?.trim() || '',
        description: description?.trim() || null,
        icon: icon || 'user',
        color: color || 'text-blue-600',
        bgColor: bgColor || 'bg-blue-50',
        avatarUrl: imageField(avatarUrl),
        imageUrl: imageField(imageUrl),
        isActive: isActive ?? true,
      },
    });

    revalidateContent();
    return NextResponse.json({ data: character });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/characters/[id] - Delete character
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

    // Check if character has stories
    const storiesCount = await prisma.story.count({
      where: { characterId: id },
    });

    if (storiesCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa nhân vật có ${storiesCount} câu chuyện. Vui lòng xóa các câu chuyện trước.` },
        { status: 400 }
      );
    }

    await prisma.character.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Character deleted' });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    );
  }
}

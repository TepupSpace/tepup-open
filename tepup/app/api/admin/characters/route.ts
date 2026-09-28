import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// GET /api/admin/characters - List all characters
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const characters = await prisma.character.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { stories: true },
        },
      },
    });

    return NextResponse.json({ data: characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

// POST /api/admin/characters - Create new character
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, description, icon, color, bgColor, slug, avatarUrl, imageUrl } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên nhân vật là bắt buộc' },
        { status: 400 }
      );
    }

    if (!role || role.trim() === '') {
      return NextResponse.json(
        { error: 'Vai trò là bắt buộc' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const characterSlug = slug?.trim() || name.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

    // Get max sortOrder
    const maxSortOrder = await prisma.character.aggregate({
      _max: { sortOrder: true },
    });

    const character = await prisma.character.create({
      data: {
        slug: characterSlug,
        name: name.trim(),
        role: role.trim(),
        description: description?.trim() || null,
        icon: icon || 'user',
        color: color || 'text-blue-600',
        bgColor: bgColor || 'bg-blue-50',
        avatarUrl: avatarUrl?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
    });

    revalidateContent();
    return NextResponse.json({ data: character }, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}

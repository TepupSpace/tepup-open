import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import type { CustomBlockTypeConfig } from '@/lib/types/custom-block';

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/custom-block-types/[id] — full object with config
export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const blockType = await prisma.customBlockType.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    if (!blockType || !blockType.isActive) {
      return NextResponse.json({ error: 'Không tìm thấy block type' }, { status: 404 });
    }

    return NextResponse.json({ data: blockType });
  } catch (error) {
    console.error('GET /api/admin/custom-block-types/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/custom-block-types/[id] — update (only if usageCount === 0)
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const blockType = await prisma.customBlockType.findUnique({ where: { id } });

    if (!blockType || !blockType.isActive) {
      return NextResponse.json({ error: 'Không tìm thấy block type' }, { status: 404 });
    }

    if (blockType.usageCount > 0) {
      return NextResponse.json(
        { error: 'Không thể chỉnh sửa block đang được dùng trong bài học. Hãy nhân bản để tạo bản mới.' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { name, slug, config } = body as {
      name?: string;
      slug?: string;
      config?: CustomBlockTypeConfig;
    };

    const updated = await prisma.customBlockType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(config && {
          config: config as object,
          description: config.description ?? null,
          icon: config.icon ?? blockType.icon,
          accentColor: config.accentColor ?? blockType.accentColor,
        }),
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    revalidateContent();
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('PUT /api/admin/custom-block-types/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/custom-block-types/[id] — soft delete
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const blockType = await prisma.customBlockType.findUnique({ where: { id } });

    if (!blockType || !blockType.isActive) {
      return NextResponse.json({ error: 'Không tìm thấy block type' }, { status: 404 });
    }

    if (blockType.usageCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xoá block đang được dùng trong bài học.' },
        { status: 409 }
      );
    }

    await prisma.customBlockType.update({ where: { id }, data: { isActive: false } });
    revalidateContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/custom-block-types/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/custom-block-types/[id]?action=clone — duplicate
export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    if (searchParams.get('action') !== 'clone') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const source = await prisma.customBlockType.findUnique({ where: { id } });
    if (!source || !source.isActive) {
      return NextResponse.json({ error: 'Không tìm thấy block type' }, { status: 404 });
    }

    // Generate a unique slug: append -v2, -v3, etc.
    let newSlug = `${source.slug}-v2`;
    let counter = 2;
    while (await prisma.customBlockType.findUnique({ where: { slug: newSlug } })) {
      counter++;
      newSlug = `${source.slug}-v${counter}`;
    }

    const cloned = await prisma.customBlockType.create({
      data: {
        slug: newSlug,
        name: `${source.name} (bản sao)`,
        description: source.description,
        icon: source.icon,
        accentColor: source.accentColor,
        config: source.config as object,
        createdById: session.user.id,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    revalidateContent();
    return NextResponse.json({ data: cloned }, { status: 201 });
  } catch (error) {
    console.error('POST clone /api/admin/custom-block-types/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

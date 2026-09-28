import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import type { CustomBlockTypeConfig } from '@/lib/types/custom-block';

function validateConfig(config: unknown): string[] {
  const errors: string[] = [];
  if (!config || typeof config !== 'object') {
    return ['config phải là object'];
  }
  const c = config as Record<string, unknown>;
  if (c.version !== 2) errors.push('version phải là 2');
  if (!c.files || typeof c.files !== 'object') {
    errors.push('files là bắt buộc');
  } else {
    const files = c.files as Record<string, unknown>;
    if (!files['/App.jsx'] || typeof files['/App.jsx'] !== 'string') {
      errors.push('files phải có /App.jsx');
    }
  }
  if (!Array.isArray(c.editorSchema)) {
    errors.push('editorSchema phải là array');
  }
  return errors;
}

// GET /api/admin/custom-block-types — list all active block types
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blockTypes = await prisma.customBlockType.findMany({
      where: { isActive: true },
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const data = blockTypes.map((bt) => ({
      id: bt.id,
      slug: bt.slug,
      name: bt.name,
      description: bt.description,
      icon: bt.icon,
      accentColor: bt.accentColor,
      usageCount: bt.usageCount,
      isActive: bt.isActive,
      createdAt: bt.createdAt.toISOString(),
      createdBy: bt.createdBy,
      // Include config so BlockEditor can build configSnapshot
      config: bt.config,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/admin/custom-block-types error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/custom-block-types — create new block type
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, slug, config } = body as {
      name?: string;
      slug?: string;
      config?: CustomBlockTypeConfig;
    };

    if (!name || !slug || !config) {
      return NextResponse.json({ error: 'name, slug, config là bắt buộc' }, { status: 400 });
    }

    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { error: 'slug chỉ được chứa chữ thường, số và dấu gạch ngang' },
        { status: 400 }
      );
    }

    const validationErrors = validateConfig(config);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: 'Config không hợp lệ', validationErrors }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.customBlockType.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `Slug "${slug}" đã tồn tại` }, { status: 409 });
    }

    const blockType = await prisma.customBlockType.create({
      data: {
        slug,
        name,
        description: config.description ?? null,
        icon: config.icon ?? 'puzzle',
        accentColor: config.accentColor ?? 'cyan',
        config: config as object,
        createdById: session.user.id,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    revalidateContent();
    return NextResponse.json({ data: blockType }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/custom-block-types error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

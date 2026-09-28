import { NextResponse } from 'next/server';
import { revalidateLibrary } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// GET /api/admin/library/[id] - Get single library document
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

    const document = await prisma.libraryDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('Error fetching library document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library document' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/library/[id] - Update library document
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
    const { title, description, slug, category, icon, content, isActive, sortOrder } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Tiêu đề là bắt buộc' },
        { status: 400 }
      );
    }

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'Mô tả là bắt buộc' },
        { status: 400 }
      );
    }

    if (!content || !content.sections || content.sections.length === 0) {
      return NextResponse.json(
        { error: 'Nội dung tài liệu là bắt buộc' },
        { status: 400 }
      );
    }

    const updateData: any = {
      title: title.trim(),
      description: description.trim(),
      content: content,
      isActive: isActive ?? true,
    };

    if (slug !== undefined) updateData.slug = slug.trim();
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (icon !== undefined) updateData.icon = icon?.trim() || null;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const document = await prisma.libraryDocument.update({
      where: { id },
      data: updateData,
    });

    revalidateLibrary();
    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('Error updating library document:', error);
    return NextResponse.json(
      { error: 'Failed to update library document' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/library/[id] - Delete library document
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

    await prisma.libraryDocument.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Library document deleted' });
  } catch (error) {
    console.error('Error deleting library document:', error);
    return NextResponse.json(
      { error: 'Failed to delete library document' },
      { status: 500 }
    );
  }
}

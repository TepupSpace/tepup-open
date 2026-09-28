import { NextResponse } from 'next/server';
import { revalidateLibrary } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// GET /api/admin/library - List all library documents
export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const documents = await prisma.libraryDocument.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error('Error fetching library documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library documents' },
      { status: 500 }
    );
  }
}

// POST /api/admin/library - Create new library document
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📥 Received body:', JSON.stringify(body, null, 2));

    const { title, description, slug, category, icon, content } = body;

    if (!title || title.trim() === '') {
      console.log('❌ Validation failed: Missing title');
      return NextResponse.json(
        { error: 'Tiêu đề là bắt buộc' },
        { status: 400 }
      );
    }

    if (!description || description.trim() === '') {
      console.log('❌ Validation failed: Missing description');
      return NextResponse.json(
        { error: 'Mô tả là bắt buộc' },
        { status: 400 }
      );
    }

    if (!content || !content.sections || content.sections.length === 0) {
      console.log('❌ Validation failed: Missing or empty content sections');
      return NextResponse.json(
        { error: 'Nội dung tài liệu là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if sections have at least one non-empty paragraph
    const hasValidContent = content.sections.some((section: any) =>
      section.paragraphs && section.paragraphs.some((p: string) => p.trim() !== '')
    );

    if (!hasValidContent) {
      console.log('❌ Validation failed: All paragraphs are empty');
      return NextResponse.json(
        { error: 'Vui lòng thêm ít nhất một đoạn văn có nội dung' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const documentSlug = slug?.trim() || title.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

    console.log('📝 Generated slug:', documentSlug);

    // Get max sortOrder
    const maxSortOrder = await prisma.libraryDocument.aggregate({
      _max: { sortOrder: true },
    });

    console.log('📊 Creating document with sortOrder:', (maxSortOrder._max.sortOrder || 0) + 1);

    const document = await prisma.libraryDocument.create({
      data: {
        slug: documentSlug,
        title: title.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        icon: icon?.trim() || null,
        content: content,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
    });

    console.log('✅ Document created successfully:', document.id);

    revalidateLibrary();
    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating library document:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug đã tồn tại. Vui lòng sử dụng slug khác hoặc để trống để tự động tạo.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Không thể tạo tài liệu. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

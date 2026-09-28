import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { contentErrorBody, sanitizeAdminBlocks } from '@/lib/schemas/content-validation';

// GET chapter content
export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chapterId } = await params;

  try {
    const content = await prisma.chapterContent.findUnique({
      where: { chapterId },
    });

    return NextResponse.json({
      data: {
        title: content?.title || '',
        blocks: content?.blocks || [],
      },
    });
  } catch (error) {
    console.error('Error fetching chapter content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// PUT update chapter content
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chapterId } = await params;

  try {
    const body = await request.json();
    const { title, blocks } = body;

    // Same defence in depth as lesson content: sanitise HTML, refuse off-list media.
    const cleaned = sanitizeAdminBlocks(blocks);
    if (!cleaned.ok) {
      return NextResponse.json(contentErrorBody(cleaned.issues), { status: 400 });
    }
    const safeBlocks = cleaned.value as object[];

    // Upsert content
    const content = await prisma.chapterContent.upsert({
      where: { chapterId },
      create: {
        chapterId,
        title: title || '',
        blocks: safeBlocks,
      },
      update: {
        title: title || '',
        blocks: safeBlocks,
      },
    });

    revalidateContent();
    return NextResponse.json({ data: content });
  } catch (error) {
    console.error('Error updating chapter content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

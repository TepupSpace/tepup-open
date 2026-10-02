import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { deleteDraft, parseDraftBody, saveDraft } from '@/lib/services/draft-service';

// PUT /api/admin/chapters/[chapterId]/draft - Save the chapter draft ("Lưu nháp" / autosave).
// Learners never see drafts, so this does not revalidate the content cache. The full
// block validation runs on publish (PUT .../content), not here.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chapterId } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Dữ liệu nháp không hợp lệ' }, { status: 400 });
    }

    const parsed = parseDraftBody(body, 'CHAPTER');
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true },
    });
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const draft = await saveDraft(
      'CHAPTER',
      chapterId,
      parsed.value,
      session.user.id ?? null
    );
    return NextResponse.json({ data: draft });
  } catch (error) {
    console.error('Error saving chapter draft:', error);
    return NextResponse.json({ error: 'Failed to save chapter draft' }, { status: 500 });
  }
}

// DELETE /api/admin/chapters/[chapterId]/draft - Discard the chapter draft (no-op if none).
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chapterId } = await params;
    await deleteDraft('CHAPTER', chapterId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error discarding chapter draft:', error);
    return NextResponse.json({ error: 'Failed to discard chapter draft' }, { status: 500 });
  }
}

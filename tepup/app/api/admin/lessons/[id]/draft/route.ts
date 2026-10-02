import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { deleteDraft, parseDraftBody, saveDraft } from '@/lib/services/draft-service';
import type { LessonDraftMeta } from '@/lib/types/drafts';

// PUT /api/admin/lessons/[id]/draft - Save the lesson draft ("Lưu nháp" / autosave).
// Learners never see drafts, so this does not revalidate the content cache. The full
// block validation runs on publish (PUT .../content), not here.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: lessonId } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Dữ liệu nháp không hợp lệ' }, { status: 400 });
    }

    const parsed = parseDraftBody(body, 'LESSON');
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const draft = await saveDraft<LessonDraftMeta>(
      'LESSON',
      lessonId,
      parsed.value,
      session.user.id ?? null
    );
    return NextResponse.json({ data: draft });
  } catch (error) {
    console.error('Error saving lesson draft:', error);
    return NextResponse.json({ error: 'Failed to save lesson draft' }, { status: 500 });
  }
}

// DELETE /api/admin/lessons/[id]/draft - Discard the lesson draft (no-op if none).
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: lessonId } = await params;
    await deleteDraft('LESSON', lessonId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error discarding lesson draft:', error);
    return NextResponse.json({ error: 'Failed to discard lesson draft' }, { status: 500 });
  }
}

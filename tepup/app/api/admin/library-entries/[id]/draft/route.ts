import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { deleteDraft, getDraft, parseDraftBody, saveDraft } from '@/lib/services/draft-service';

// Bản nháp của một mục thư viện ("Lưu nháp" / tự lưu), cùng bảng ContentDraft với bài học.
// Người học không bao giờ thấy nháp, nên không xoá cache thư viện. Kiểm tra đầy đủ chạy khi
// xuất bản (PUT /api/admin/library-entries/[id]), không phải ở đây.

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/library-entries/[id]/draft — bản nháp đang có (data: null nếu không có)
export async function GET(_req: Request, { params }: Ctx) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  return NextResponse.json({ data: await getDraft<Record<string, unknown>>('LIBRARY_ENTRY', id) });
}

// PUT /api/admin/library-entries/[id]/draft — lưu nháp
export async function PUT(request: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu nháp không hợp lệ' }, { status: 400 });
  }
  const parsed = parseDraftBody(body, 'LIBRARY_ENTRY');
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const entry = await prisma.libraryEntry.findUnique({ where: { id }, select: { id: true } });
  if (!entry) return NextResponse.json({ error: 'Không tìm thấy mục' }, { status: 404 });
  try {
    const draft = await saveDraft<Record<string, unknown>>('LIBRARY_ENTRY', id, parsed.value, session.user.id ?? null);
    return NextResponse.json({ data: draft });
  } catch (error) {
    console.error('Error saving library entry draft:', error);
    return NextResponse.json({ error: 'Không lưu được bản nháp' }, { status: 500 });
  }
}

// DELETE /api/admin/library-entries/[id]/draft — bỏ nháp (không có thì thôi)
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await deleteDraft('LIBRARY_ENTRY', id);
  return NextResponse.json({ ok: true });
}

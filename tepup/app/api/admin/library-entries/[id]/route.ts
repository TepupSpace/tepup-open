import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { revalidateLibrary } from '@/lib/cache';
import { entryInput } from '@/lib/library/schemas';
import { deleteEntry, getEntryAdmin, updateEntry } from '@/lib/library/entry-service';
import { prisma } from '@/lib/prisma';
import { deleteDraft, isPublishConflict, parseIsoDate, publishConflictBody } from '@/lib/services/draft-service';
import { entryErrorResponse } from '../errors';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/library-entries/[id]
export async function GET(_req: Request, { params }: Ctx) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const entry = await getEntryAdmin(id);
  if (!entry) return NextResponse.json({ error: 'Không tìm thấy mục' }, { status: 404 });
  return NextResponse.json({ data: entry });
}

// PUT /api/admin/library-entries/[id] — "Xuất bản": thay toàn bộ mục và các liên kết đi ra,
// rồi bỏ bản nháp. `baseUpdatedAt` (mốc lúc mở trình soạn) chặn ghi đè thay đổi của người
// khác: 409, trừ khi gửi `force: true`.
export async function PUT(request: Request, { params }: Ctx) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const parsed = entryInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dữ liệu chưa hợp lệ', issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }, { status: 400 });
  }
  const { baseUpdatedAt, force } = (body ?? {}) as { baseUpdatedAt?: unknown; force?: unknown };
  if (force !== true) {
    const live = await prisma.libraryEntry.findUnique({ where: { id }, select: { updatedAt: true } });
    if (live && isPublishConflict(live.updatedAt, parseIsoDate(baseUpdatedAt))) {
      return NextResponse.json(publishConflictBody(live.updatedAt), { status: 409 });
    }
  }
  try {
    const entry = await updateEntry(id, parsed.data);
    await deleteDraft('LIBRARY_ENTRY', id);
    revalidateLibrary();
    return NextResponse.json({ data: entry });
  } catch (err) {
    return entryErrorResponse(err);
  }
}

// DELETE /api/admin/library-entries/[id]
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await deleteEntry(id);
    await deleteDraft('LIBRARY_ENTRY', id);
    revalidateLibrary();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return entryErrorResponse(err);
  }
}

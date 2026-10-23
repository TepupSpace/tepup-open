import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { revalidateLibrary } from '@/lib/cache';
import { entryInput } from '@/lib/library/schemas';
import { getEntryAdmin, prepareEntryWrite, updateEntryInTx } from '@/lib/library/entry-service';
import { entrySnapshotJson, readEntrySnapshot } from '@/lib/library/entry-snapshot';
import { prisma } from '@/lib/prisma';
import { deleteDraft, isPublishConflict, parseIsoDate, publishConflictBody } from '@/lib/services/draft-service';
import { lockLibraryEntry, recordRevision } from '@/lib/services/revision-service';
import { entryErrorResponse } from '../errors';

type Ctx = { params: Promise<{ id: string }> };

/** Thrown inside the publish transaction: live entry is newer than the editor's base. */
class PublishConflict extends Error {
  constructor(readonly liveUpdatedAt: Date) {
    super('publish conflict');
  }
}
class EntryNotFound extends Error {}

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
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  try {
    const entry = await prisma.$transaction(async (tx) => {
      // Conflict check under the row lock, so two publishers can't both pass it.
      const live = await lockLibraryEntry(tx, id);
      if (!live) throw new EntryNotFound();
      if (force !== true && isPublishConflict(live.updatedAt, parseIsoDate(baseUpdatedAt))) {
        throw new PublishConflict(live.updatedAt);
      }
      const prepared = await prepareEntryWrite(parsed.data, id);
      const before = await readEntrySnapshot(tx, id);
      const saved = await updateEntryInTx(tx, id, parsed.data, prepared);
      // History: the version just published (lib/library/entry-snapshot.ts). Auto-patrolled.
      const now = await readEntrySnapshot(tx, id);
      if (now) {
        await recordRevision(tx, {
          targetType: 'LIBRARY_ENTRY',
          targetId: id,
          label: now.label,
          snapshot: entrySnapshotJson(now.snapshot),
          source: 'ADMIN_PUBLISH',
          actorId: session.user.id,
          authorId: session.user.id,
          previous: before && entrySnapshotJson(before.snapshot),
          autoPatrol: true,
        });
      }
      await deleteDraft('LIBRARY_ENTRY', id, tx);
      return saved;
    }, { timeout: 20_000 });
    revalidateLibrary();
    return NextResponse.json({ data: entry });
  } catch (err) {
    if (err instanceof PublishConflict) {
      return NextResponse.json(publishConflictBody(err.liveUpdatedAt), { status: 409 });
    }
    if (err instanceof EntryNotFound) return NextResponse.json({ error: 'Không tìm thấy mục' }, { status: 404 });
    return entryErrorResponse(err);
  }
}

// DELETE /api/admin/library-entries/[id]
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.$transaction(async (tx) => {
      if (!(await lockLibraryEntry(tx, id))) throw new EntryNotFound();
      // History outlives the entry: keep its last version as a DELETED revision.
      const last = await readEntrySnapshot(tx, id);
      if (last) {
        await recordRevision(tx, {
          targetType: 'LIBRARY_ENTRY',
          targetId: id,
          label: last.label,
          snapshot: entrySnapshotJson(last.snapshot),
          source: 'DELETED',
          actorId: session.user.id,
          autoPatrol: true,
        });
      }
      await tx.libraryEntry.delete({ where: { id } });
      await deleteDraft('LIBRARY_ENTRY', id, tx);
    });
    revalidateLibrary();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof EntryNotFound) return NextResponse.json({ error: 'Không tìm thấy mục' }, { status: 404 });
    return entryErrorResponse(err);
  }
}

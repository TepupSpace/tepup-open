import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { revalidateLibrary } from '@/lib/cache';
import { entryInput, ENTRY_TYPES, type EntryType } from '@/lib/library/schemas';
import { createEntryInTx, prepareEntryWrite, searchEntriesAdmin } from '@/lib/library/entry-service';
import { entrySnapshotJson, readEntrySnapshot } from '@/lib/library/entry-snapshot';
import { prisma } from '@/lib/prisma';
import { recordRevision } from '@/lib/services/revision-service';
import { entryErrorResponse } from './errors';

// GET /api/admin/library-entries?q=&type= — danh sách và bộ chọn mục thư viện
export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || undefined;
  const typeParam = searchParams.get('type') || undefined;
  const type = typeParam && (ENTRY_TYPES as readonly string[]).includes(typeParam) ? (typeParam as EntryType) : undefined;
  const take = Number(searchParams.get('take')) || undefined;
  const data = await searchEntriesAdmin({ q, type, take });
  return NextResponse.json({ data });
}

// POST /api/admin/library-entries — tạo mục mới
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  try {
    const prepared = await prepareEntryWrite(parsed.data);
    const entry = await prisma.$transaction(async (tx) => {
      const created = await createEntryInTx(tx, parsed.data, prepared);
      // History: the first version (no previous, so no BASELINE). Admin changes are auto-patrolled.
      const now = await readEntrySnapshot(tx, created.id);
      if (now) {
        await recordRevision(tx, {
          targetType: 'LIBRARY_ENTRY',
          targetId: created.id,
          label: now.label,
          snapshot: entrySnapshotJson(now.snapshot),
          source: 'ADMIN_PUBLISH',
          actorId: session.user.id,
          authorId: session.user.id,
          autoPatrol: true,
        });
      }
      return created;
    });
    revalidateLibrary();
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (err) {
    return entryErrorResponse(err);
  }
}


import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { revalidateLibrary } from '@/lib/cache';
import { entryInput, ENTRY_TYPES, type EntryType } from '@/lib/library/schemas';
import { createEntry, searchEntriesAdmin } from '@/lib/library/entry-service';
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
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const entry = await createEntry(parsed.data);
    revalidateLibrary();
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (err) {
    return entryErrorResponse(err);
  }
}


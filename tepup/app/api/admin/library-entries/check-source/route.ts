import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { findSourceByKey } from '@/lib/library/entry-service';
import { sourceKeyOf } from '@/lib/library/source-key';

// GET /api/admin/library-entries/check-source?url=&identifier=&exclude=<id>
// Cảnh báo trùng ngay khi dán link/số hiệu vào form Nguồn (lưu vẫn bị chặn ở server).
export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = new URL(request.url).searchParams;
  const url = p.get('url')?.trim() || undefined;
  const identifier = p.get('identifier')?.trim() || undefined;
  const key = sourceKeyOf({ url, identifier });
  // Có link thì cũng so riêng số hiệu: một sách có thể được nhập lần đầu bằng ISBN, lần sau bằng link.
  const idKey = url && identifier ? sourceKeyOf({ identifier }) : null;
  const exclude = p.get('exclude') || undefined;
  const match = (key ? await findSourceByKey(key, exclude) : null) ?? (idKey ? await findSourceByKey(idKey, exclude) : null);
  return NextResponse.json({ key, match });
}

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { EntryValidationError } from '@/lib/library/entry-service';

/** Đổi lỗi khi ghi mục thư viện thành phản hồi HTTP có thông báo tiếng Việt. */
export function entryErrorResponse(err: unknown) {
  if (err instanceof EntryValidationError) {
    return NextResponse.json({ error: 'Dữ liệu chưa hợp lệ', issues: err.issues }, { status: 400 });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Hai giá trị UNIQUE: slug, và khoá chống trùng của Nguồn (khi hai người lưu cùng lúc).
      const target = String((err.meta as { target?: unknown } | undefined)?.target ?? '');
      return NextResponse.json(
        { error: target.includes('sourceKey') ? 'Nguồn này đã có trong thư viện' : 'Slug này đã có mục khác dùng' },
        { status: 409 },
      );
    }
    if (err.code === 'P2025') return NextResponse.json({ error: 'Không tìm thấy mục' }, { status: 404 });
  }
  console.error('Library entry write failed:', err);
  return NextResponse.json({ error: 'Không lưu được mục thư viện' }, { status: 500 });
}

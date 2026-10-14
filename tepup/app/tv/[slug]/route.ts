import { NextResponse } from 'next/server';
import { isValidEntrySlug } from '@/lib/library/refs';

// GET /tv/<slug> — dạng link tham chiếu dùng trong nội dung bài học. Trong trình
// đọc, ReferenceProvider chặn cú bấm và mở bảng bên; còn khi mở trực tiếp (link
// chia sẻ, JS tắt, cờ trình đọc tắt) thì chuyển sang trang của mục.
//
// Location tương đối (RFC 7231 cho phép): request.url sau proxy/trong container có thể
// mang host nội bộ (0.0.0.0:3000), nên không dựng URL tuyệt đối từ nó.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidEntrySlug(slug)) return new NextResponse('Không tìm thấy', { status: 404 });
  return new NextResponse(null, { status: 308, headers: { Location: `/thu-vien/muc/${slug}` } });
}

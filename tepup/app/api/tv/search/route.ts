import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, clientIp } from '@/lib/security/rate-limit';
import { sourceKeyOf } from '@/lib/library/source-key';

// GET /api/tv/search?q= — bộ chọn "Chèn tham chiếu" trong trình soạn thảo (admin và
// cộng tác viên đều dùng; cộng tác viên không gọi được /api/admin/**). Chỉ trả về
// mục đang hiển thị công khai, đúng những gì ai cũng xem được ở /thu-vien.
export async function GET(request: Request) {
  // Tìm kiếm chạm DB mỗi lần gõ; giới hạn theo IP như các API công khai khác.
  if (!rateLimit('tv-search', clientIp(request.headers), 120, 60_000).ok) {
    return NextResponse.json({ error: 'Thử lại sau ít phút' }, { status: 429 });
  }
  const q = (new URL(request.url).searchParams.get('q') ?? '').trim().slice(0, 100);
  if (q.length < 1) return NextResponse.json({ data: [] });
  // Dán link (hoặc DOI/ISBN) vào ô tìm: tìm đúng mục Nguồn của tài liệu đó trước, kể cả khi
  // link khác chữ (www, utm_…, bản lưu trữ). Đánh dấu `exact` để giao diện báo "đã có".
  const key = /^(https?:\/\/|www\.)/i.test(q)
    ? sourceKeyOf({ url: q })
    : /^(doi|isbn|10\.\d{4,9}\/)/i.test(q)
      ? sourceKeyOf({ identifier: q })
      : null;
  const exact = key
    ? await prisma.libraryEntry.findFirst({
        where: { sourceKey: key, isActive: true },
        select: { slug: true, type: true, title: true, summary: true },
      })
    : null;
  const data = await prisma.libraryEntry.findMany({
    where: {
      isActive: true,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q.toLowerCase() } },
        { summary: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: { title: 'asc' },
    take: 20,
    select: { slug: true, type: true, title: true, summary: true },
  });
  return NextResponse.json({
    data: exact ? [{ ...exact, exact: true }, ...data.filter((d) => d.slug !== exact.slug)] : data,
  });
}

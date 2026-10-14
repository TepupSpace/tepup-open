import { NextResponse } from 'next/server';
import { getEntryFull } from '@/lib/library/entry-service';

// GET /api/tv/entry/[slug] — toàn bộ một mục cho bảng bên. Công khai, cache được.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await getEntryFull(slug);
    if (!data) return NextResponse.json({ error: 'Không tìm thấy mục' }, { status: 404 });
    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (error) {
    console.error('Error fetching library entry:', error);
    return NextResponse.json({ error: 'Không tải được mục thư viện' }, { status: 500 });
  }
}

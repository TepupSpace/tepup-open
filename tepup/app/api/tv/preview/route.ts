import { NextResponse } from 'next/server';
import { getEntryPreviews, PREVIEW_BATCH_MAX } from '@/lib/library/entry-service';
import { isValidEntrySlug } from '@/lib/library/refs';

// GET /api/tv/preview?slugs=a,b,c — xem nhanh cho mọi tham chiếu trong một bài học,
// tải một lần khi mở bài (docs/design-reference-library.md §6.6). Công khai, cache được.
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('slugs') ?? '';
  const slugs = raw.split(',').map((s) => s.trim()).filter(isValidEntrySlug).slice(0, PREVIEW_BATCH_MAX);
  try {
    const data = await getEntryPreviews(slugs);
    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (error) {
    console.error('Error fetching entry previews:', error);
    return NextResponse.json({ error: 'Không tải được phần xem nhanh' }, { status: 500 });
  }
}

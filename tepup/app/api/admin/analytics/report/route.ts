import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { resolvePeriod, vnToday } from '@/lib/analytics/period';
import { buildFunderReport, funderReportCsv } from '@/lib/analytics/funder';

/**
 * CSV của báo cáo nhà tài trợ (/admin/analytics/report). Chỉ admin. Không chứa mã người học,
 * chỉ số tổng hợp. Kỳ đọc từ `from`/`to` như trang báo cáo.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const pair = resolvePeriod(url.searchParams.get('from') ?? undefined, url.searchParams.get('to') ?? undefined, vnToday());
  const report = await buildFunderReport(pair);
  const name = `tepup-bao-cao-${pair.current.from}_${pair.current.to}.csv`;
  return new Response(funderReportCsv(report), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
}

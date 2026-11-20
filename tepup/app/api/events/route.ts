import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { clientIp, rateLimit } from '@/lib/security/rate-limit';
import { analyticsBatch, MAX_BATCH_BYTES } from '@/lib/analytics/schema';
import {
  SESSION_COOKIE,
  browserFromUa,
  countryFromHeaders,
  deviceFromUa,
  eventRows,
  isBot,
  tallyRows,
} from '@/lib/analytics/server';

/**
 * Số liệu ẩn danh của người học (CLAUDE.md › Analytics, trang công khai /du-lieu).
 *
 * Privacy: không lưu IP, user agent, cookie hay user id. IP chỉ dùng trong bộ nhớ (băm)
 * để giới hạn tần suất; UA chỉ để rút ra loại thiết bị + họ trình duyệt rồi bỏ.
 * ⚠️ Đừng `console.log` request hay body ở đây: log của Vercel sẽ giữ IP.
 *
 * Người đang đăng nhập (nhân viên): bỏ hết, chỉ giữ event `error` không mã.
 */
const noContent = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  const ua = request.headers.get('user-agent');
  if (isBot(ua)) return noContent();

  const ip = clientIp(request.headers);
  const perIp = rateLimit('events-ip', ip, 300, 10 * 60_000);
  const global = rateLimit('events-global', 'all', 20_000, 60 * 60_000);
  if (!perIp.ok || !global.ok) return new Response(null, { status: 429 });

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BATCH_BYTES) return new Response(null, { status: 413 });
  let parsed;
  try {
    const text = await request.text();
    if (text.length > MAX_BATCH_BYTES) return new Response(null, { status: 413 });
    parsed = analyticsBatch.safeParse(JSON.parse(text));
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!parsed.success) return new Response(null, { status: 400 });
  const batch = parsed.data;

  const cookieHeader = request.headers.get('cookie') ?? '';
  const signedIn = cookieHeader
    .split(';')
    .some((c) => SESSION_COOKIE.test(c.split('=')[0]?.trim() ?? ''));

  const now = Date.now();
  const rows = eventRows(
    batch,
    { country: countryFromHeaders(request.headers), device: deviceFromUa(ua!), browser: browserFromUa(ua!) },
    now,
    signedIn,
  );
  // Nhân viên xem thử bài không được tính vào số hoàn thành của người học.
  const tallies = signedIn ? [] : tallyRows(batch.tallies, now);

  if (!rows.length && !tallies.length) return noContent();

  try {
    await prisma.$transaction([
      ...(rows.length ? [prisma.analyticsEvent.createMany({ data: rows })] : []),
      ...tallies.map((t) =>
        prisma.$executeRaw(Prisma.sql`
          INSERT INTO "AnalyticsTally" ("metric", "targetId", "key", "day", "count")
          VALUES (${t.metric}, ${t.targetId}, ${t.key}, ${t.day}::date, ${t.count})
          ON CONFLICT ("metric", "targetId", "key", "day")
          DO UPDATE SET "count" = "AnalyticsTally"."count" + EXCLUDED."count"`),
      ),
    ]);
  } catch {
    // Không ghi chi tiết request vào log. 503, không 502/504 (Cloudflare nuốt mất).
    console.error('analytics: insert failed');
    return new Response(null, { status: 503 });
  }
  return noContent();
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

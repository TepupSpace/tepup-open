import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Xoá event analytics cũ hơn 365 ngày (CLAUDE.md › Analytics). Vercel Cron gọi mỗi ngày
 * (vercel.json) kèm `Authorization: Bearer $CRON_SECRET`. Bộ đếm tổng không có mã nên được giữ.
 */
const RETENTION_DAYS = 365;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(request.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.analyticsEvent.deleteMany({ where: { sessionHour: { lt: cutoff } } });
  return NextResponse.json({ deleted: count });
}

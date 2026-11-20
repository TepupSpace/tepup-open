import { NextResponse } from 'next/server';

/**
 * GET /api/version — bản build đang chạy trên server.
 *
 * App đã cài về máy (PWA) gọi mỗi lần được mở lại để biết đã có bản deploy mới
 * chưa (components/pwa/FreshContent.tsx). Không bao giờ được cache: /api nằm
 * ngoài `publicPages`, và header dưới đây chặn cả trình duyệt lẫn Cloudflare.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { build: process.env.NEXT_PUBLIC_BUILD_ID ?? 'unknown' },
    { headers: { 'Cache-Control': 'no-store, max-age=0', 'Cloudflare-CDN-Cache-Control': 'no-store' } },
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { SEED_PARAM } from '@/lib/pwa/progress-seed';

/**
 * Manifest được sinh động thay vì để tĩnh trong public/, vì `start_url` phải mang
 * theo tiến độ học của người dùng tại thời điểm cài đặt — xem lib/pwa/progress-seed.ts.
 *
 * Client ghi seed vào href của thẻ <link rel="manifest">, nên khi trình duyệt tải
 * manifest lúc cài, nó nhận về đúng start_url có tiến độ kèm theo.
 */
export const dynamic = 'force-dynamic';

/** Mở app vào thẳng danh sách khoá học, không phải trang giới thiệu. */
const LAUNCH_PATH = '/courses';

export function GET(request: NextRequest) {
  const seed = request.nextUrl.searchParams.get(SEED_PARAM);
  const startUrl = seed
    ? `${LAUNCH_PATH}?${SEED_PARAM}=${encodeURIComponent(seed)}`
    : LAUNCH_PATH;

  return NextResponse.json(
    {
      // `id` cố định để trình duyệt luôn coi đây là cùng một app, kể cả khi
      // start_url đổi theo tiến độ. Thiếu trường này, mỗi seed khác nhau có thể
      // bị hiểu thành một app khác.
      id: '/',
      name: 'Tepup — Kiến thức công dân thực dụng',
      short_name: 'Tepup',
      description:
        'Học những điều cơ bản về thuế, tư duy, và quyền số — miễn phí, ẩn danh, bằng tiếng Việt.',
      lang: 'vi',
      dir: 'ltr',
      start_url: startUrl,
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#ed282a',
      categories: ['education'],
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        {
          src: '/icons/icon-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json',
        // Seed thay đổi theo từng người nên không được để proxy dùng chung bản nhớ đệm.
        'Cache-Control': 'no-store',
      },
    }
  );
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Bài học đang ẩn vẫn mở được ở đúng URL của nó cho người có quyền.
 *
 * Trang `/courses/[slug]/[lessonSlug]` là ISR và không đọc cookie, nên người học
 * (không có tài khoản) vẫn ăn cache CDN như cũ. Request có cookie phiên được rewrite
 * sang `/staff-view/...` (dynamic): URL trên trình duyệt không đổi, và route đó mới
 * là nơi kiểm tra quyền thật. Ở đây chỉ nhìn xem cookie có tồn tại hay không.
 *
 * ⚠️ Cloudflare cache trang công khai 5 phút, và cache của nó không phân biệt cookie.
 * Bản staff-view (có bài đang ẩn) không bị cache chỉ vì request có cookie phiên được bỏ qua
 * ở cả `anonymousPageLoad` (next.config.ts) lẫn Cache Rule trên Cloudflare. Đổi tên cookie
 * hay thêm view riêng cho người đăng nhập thì sửa cả hai chỗ (xem CLAUDE.md, "Edge caching").
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies
    .getAll()
    .some(({ name }) => /^(__Secure-)?authjs\.session-token(\.\d+)?$/.test(name));
  if (!hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/staff-view${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/courses/:slug/:lessonSlug',
};

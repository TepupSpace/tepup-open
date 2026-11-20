import type { RouteType } from './schema';

const DAY = 24 * 60 * 60 * 1000;

/** Nhóm thô cho "đã biết Tepup bao lâu" — chỉ nhóm này rời trình duyệt, không phải ngày. */
export function firstSeenBucket(firstSeenMs: number, now = Date.now()): '0' | '1-7' | '8-30' | '30+' {
  const days = Math.floor((now - firstSeenMs) / DAY);
  if (days < 1) return '0';
  if (days <= 7) return '1-7';
  if (days <= 30) return '8-30';
  return '30+';
}

export function lessonsDoneBucket(count: number): '0' | '1-2' | '3-5' | '6+' {
  if (count <= 0) return '0';
  if (count <= 2) return '1-2';
  if (count <= 5) return '3-5';
  return '6+';
}

/** Loại trang + slug công khai (không bao giờ là query string). */
export function classifyPath(pathname: string): { routeType: RouteType; slug?: string } {
  const p = pathname.replace(/\/+$/, '') || '/';
  const seg = p.split('/').filter(Boolean);
  const okSlug = (s?: string) => (s && /^[a-z0-9-]{1,120}$/.test(s) ? s : undefined);
  if (p === '/') return { routeType: 'landing' };
  if (seg[0] === 'courses') {
    if (seg.length === 1) return { routeType: 'courses' };
    if (seg.length === 2) return { routeType: 'course', slug: okSlug(seg[1]) };
    return { routeType: 'lesson', slug: okSlug(seg[2]) };
  }
  if (seg[0] === 'story') {
    return seg.length >= 4 ? { routeType: 'chapter', slug: okSlug(seg[3]) } : { routeType: 'story', slug: okSlug(seg[seg.length - 1]) };
  }
  if (seg[0] === 'thu-vien' || seg[0] === 'library' || seg[0] === 'tv') {
    if (seg[1] === 'muc' && seg[2]) return { routeType: 'entry', slug: okSlug(seg[2]) };
    if (seg[0] === 'tv' && seg[1]) return { routeType: 'entry', slug: okSlug(seg[1]) };
    return { routeType: 'library' };
  }
  return { routeType: 'other' };
}

/** Khu vực nhân viên: không bao giờ track (giống TepCursor). */
export const STAFF_AREAS = /^\/(admin|contributor|dev|staff-view)(\/|$)/;

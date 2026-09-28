/**
 * Chính sách URL cho nội dung do tác giả nhập.
 *
 * Media (ảnh/video/audio/tệp) được trình duyệt tải TỰ ĐỘNG khi người học mở bài —
 * một URL trỏ ra máy chủ lạ là một "tracking pixel": chủ máy chủ đó thấy IP, giờ
 * học và User-Agent của từng người học. Với một site giáo dục công dân, đó là rò rỉ
 * danh tính thật sự. Vì vậy media chỉ được nằm trên các host dưới đây.
 *
 * Link (`<a href>`) chỉ gửi request khi người học tự bấm, nên được rộng hơn: mọi
 * http(s) và mailto — nhưng không bao giờ `javascript:`/`data:`/…
 */

/**
 * Host media hợp lệ, kèm tiền tố đường dẫn bắt buộc.
 *
 * - Supabase Storage của đúng các project của TepUp — nơi `app/api/admin/upload-image`
 *   lưu mọi ảnh. (Bản công khai đọc danh sách host từ `NEXT_PUBLIC_MEDIA_STORAGE_HOSTS`,
 *   phân tách bằng dấu phẩy.) Chỉ ghim đúng các project này: một wildcard `*.supabase.co` sẽ cho phép bất kỳ ai tự tạo
 *   project Supabase miễn phí rồi đọc log truy cập của chính họ.
 * - Wikimedia Commons (`upload.wikimedia.org/wikipedia/…`) — 68 ảnh trong nội dung
 *   hiện có trỏ thẳng tới đây.
 */
const MEDIA_HOSTS: { host: string; pathPrefix: string }[] = [
  ...(process.env.NEXT_PUBLIC_MEDIA_STORAGE_HOSTS ?? '').split(',').map((h) => h.trim()).filter(Boolean).map((host) => ({ host, pathPrefix: '/storage/v1/object/public/' })),
  { host: 'upload.wikimedia.org', pathPrefix: '/wikipedia/' },
];

const MAX_URL_LENGTH = 2048;

/**
 * Media URL hợp lệ: đường dẫn cùng origin bắt đầu bằng "/" (không phải "//", không
 * phải "/api/"), hoặc
 * https tới một host trong `MEDIA_HOSTS` với đúng tiền tố đường dẫn. Không cổng lạ,
 * không user:pass, không ký tự điều khiển.
 */
export function isAllowedMediaUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const u = url.trim();
  if (!u || u.length > MAX_URL_LENGTH) return false;
  // Control chars / whitespace / backslashes let browsers reinterpret the URL
  // (e.g. "/\evil.com" is protocol-relative in some parsers).
  if (/[\u0000- \u007f\\]/.test(u)) return false;

  // Same-origin static path. Never `/api/…`: an <img src> fires a credentialed GET
  // from every learner, which must not be able to reach an API route.
  // Normalise first (browsers collapse "/x/../api" and routers decode "%61pi").
  if (u.startsWith('/')) {
    if (u.startsWith('//')) return false;
    try {
      const rel = new URL(u, 'https://same-origin.invalid');
      if (rel.host !== 'same-origin.invalid') return false;
      return !/^\/api(?:\/|$)/i.test(decodeURIComponent(rel.pathname));
    } catch {
      return false;
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  if (parsed.username || parsed.password || parsed.port) return false;
  const host = parsed.hostname.toLowerCase();
  return MEDIA_HOSTS.some((h) => h.host === host && parsed.pathname.startsWith(h.pathPrefix));
}

/** Danh sách host media hợp lệ, để hiển thị trong thông báo lỗi. */
export const ALLOWED_MEDIA_HOSTS_LABEL = MEDIA_HOSTS.map((h) => h.host + h.pathPrefix).join(', ');

/** Link href hợp lệ trong rich text: chỉ http(s):// và mailto:. */
export function isSafeLinkHref(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  const h = href.trim();
  if (!h || h.length > MAX_URL_LENGTH) return false;
  if (/[\u0000-\u001f\u007f]/.test(h)) return false;
  return /^(?:https?:\/\/|mailto:)/i.test(h);
}

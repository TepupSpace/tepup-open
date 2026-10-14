/**
 * Khoá chống trùng cho mục Nguồn (docs/design-reference-library.md §4.4).
 *
 * Hai link khác chữ nhưng cùng một tài liệu phải cho ra cùng một khoá:
 * http/https, www./m., dấu / cuối, #đoạn, tham số theo dõi (utm_*, fbclid…), thứ tự
 * tham số, bản lưu trên web.archive.org, các dạng DOI (doi.org/…, dx.doi.org/…, "doi:…"),
 * ISBN có/không gạch nối, ISBN-10 so với ISBN-13, youtu.be so với youtube.com.
 *
 * Khoá được tính ở server khi lưu (cột LibraryEntry.sourceKey, UNIQUE) — không tin
 * giá trị client gửi lên.
 */

const TRACKING = /^(utm_[a-z]+|fbclid|gclid|dclid|msclkid|igshid|mc_cid|mc_eid|ref|ref_src|ref_url|share|si|s_cid|cmpid|ocid|_ga)$/i;

/** DOI chuẩn hoá: chữ thường, không tiền tố. null nếu không phải DOI. */
export function normalizeDoi(value: string): string | null {
  const m = /(10\.\d{4,9}\/\S+)/i.exec(decodeSafe(value.trim()));
  return m ? m[1].replace(/[.,;)]+$/, '').toLowerCase() : null;
}

/** ISBN-13 chỉ gồm chữ số (ISBN-10 được đổi sang 13). null nếu không phải ISBN hợp lệ. */
export function normalizeIsbn(value: string): string | null {
  const raw = value.replace(/^isbn(?:-1[03])?:?\s*/i, '').replace(/[\s-]/g, '').toUpperCase();
  if (/^\d{13}$/.test(raw)) return raw;
  if (/^\d{9}[\dX]$/.test(raw)) {
    const core = `978${raw.slice(0, 9)}`;
    const sum = [...core].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
    return `${core}${(10 - (sum % 10)) % 10}`;
  }
  return null;
}

function decodeSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Khoá của một URL, hoặc null nếu không phải URL http(s) hợp lệ. */
export function normalizeSourceUrl(input: string): string | null {
  let s = input.trim();
  // Bản lưu trữ: web.archive.org/web/<mốc thời gian>[id_]/<url gốc>
  const archived = /^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\/(.+)$/i.exec(s);
  if (archived) s = archived[1];
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname
    .toLowerCase()
    .replace(/^(www|m|mobile|amp)\./, '')
    // Bản di động kiểu en.m.wikipedia.org
    .replace(/\.m\.(wikipedia|wiktionary|wikimedia|wikisource)\.org$/, '.$1.org');

  if (host === 'doi.org' || host === 'dx.doi.org') {
    const doi = normalizeDoi(u.pathname.slice(1));
    if (doi) return `doi:${doi}`;
  }
  if (host === 'youtu.be') return `youtube.com/watch?v=${u.pathname.slice(1)}`;
  if (host === 'youtube.com' && u.searchParams.get('v')) return `youtube.com/watch?v=${u.searchParams.get('v')}`;

  const params = [...u.searchParams.entries()]
    .filter(([k]) => !TRACKING.test(k))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const query = params.length ? `?${params.map(([k, v]) => `${k}=${v}`).join('&')}` : '';
  let path = decodeSafe(u.pathname).replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (path === '/') path = '';
  return `${host}${path}${query}`;
}

/** Khoá từ số hiệu: DOI, ISBN, hoặc số hiệu văn bản (bỏ khoảng trắng, chữ thường). */
export function normalizeIdentifier(identifier: string): string | null {
  const v = identifier.trim();
  if (!v) return null;
  const doi = normalizeDoi(v);
  if (doi) return `doi:${doi}`;
  const isbn = normalizeIsbn(v);
  if (isbn) return `isbn:${isbn}`;
  return `so:${v.toLowerCase().replace(/^(số|so|no\.?)\s*/i, '').replace(/\s+/g, '')}`;
}

/**
 * Khoá chống trùng của một mục Nguồn: theo link nếu có (đó là thứ người soạn dán vào),
 * không thì theo số hiệu. null nếu không có gì để so.
 */
export function sourceKeyOf(meta: { url?: string; identifier?: string }): string | null {
  if (meta.url) {
    const k = normalizeSourceUrl(meta.url);
    if (k) return k;
  }
  return meta.identifier ? normalizeIdentifier(meta.identifier) : null;
}

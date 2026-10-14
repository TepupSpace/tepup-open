/**
 * Định dạng trích dẫn cho mục Nguồn — dễ đọc nhất có thể (docs/design-reference-library.md §8).
 *
 * Không theo một chuẩn học thuật nào: nhãn tiếng Việt, ngày dd/mm/yyyy, điều quan
 * trọng nhất đứng trước. Trả về các mảnh có cấu trúc (để giao diện in nghiêng tên
 * sách/tạp chí) và một bản chuỗi thuần (cho aria-label, kiểm thử, xuất văn bản).
 */
import type { SourceMeta, SourceType } from './schemas';

export interface CitationPart {
  text: string;
  /** Tên sách, tạp chí, chương trình: in nghiêng. */
  italic?: boolean;
}

export interface Citation {
  sourceType: SourceType;
  typeLabel: string;
  /** Mỗi phần tử là một cụm; giao diện nối các cụm bằng " · " (bản đầy đủ). */
  segments: CitationPart[][];
  url?: string;
  archivedUrl?: string;
  /** Mã ngôn ngữ in hoa khi nguồn không phải tiếng Việt, ví dụ "EN". */
  languageBadge?: string;
}

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  sach: 'Sách',
  'bai-bao-khoa-hoc': 'Bài báo khoa học',
  'bao-chi': 'Báo chí',
  'van-ban-phap-luat': 'Văn bản pháp luật',
  podcast: 'Podcast',
  video: 'Video',
  'trang-web': 'Trang web',
  'du-lieu': 'Dữ liệu',
};

/** yyyy-mm-dd → dd/mm/yyyy. Chuỗi khác dạng thì trả nguyên. */
export function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** 1 tác giả: tên; 2: "A và B"; 3+: "A và cộng sự". */
export function authorsShort(authors: string[]): string | undefined {
  if (authors.length === 0) return undefined;
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} và ${authors[1]}`;
  return `${authors[0]} và cộng sự`;
}

function authorsFull(authors: string[]): string | undefined {
  return authors.length ? authors.join(', ') : undefined;
}

const t = (text?: string | number, italic = false): CitationPart[] | null =>
  text === undefined || text === '' ? null : [{ text: String(text), italic }];

const quoted = (s?: string) => (s ? `“${s}”` : undefined);

function yearOrDate(m: SourceMeta): string | undefined {
  return formatDate(m.date) ?? (m.year !== undefined ? String(m.year) : undefined);
}

function compact(segs: (CitationPart[] | null)[]): CitationPart[][] {
  return segs.filter((s): s is CitationPart[] => s !== null);
}

function base(m: SourceMeta, segments: CitationPart[][]): Citation {
  return {
    sourceType: m.sourceType,
    typeLabel: SOURCE_TYPE_LABELS[m.sourceType],
    segments,
    url: m.url,
    archivedUrl: m.archivedUrl,
    languageBadge: m.language && m.language !== 'vi' ? m.language.toUpperCase() : undefined,
  };
}

/**
 * Bản ngắn: một câu, dùng ở xem nhanh và trong danh sách nguồn của chủ đề.
 * Trả về một cụm duy nhất (segments có đúng một phần tử).
 */
export function shortCitation(title: string, m: SourceMeta): Citation {
  const who = authorsShort(m.authors ?? []);
  const when = yearOrDate(m);
  let parts: CitationPart[];
  switch (m.sourceType) {
    case 'sach':
      parts = [{ text: `${who ? `${who} ` : ''}${when ? `(${when}). ` : ''}` }, { text: title, italic: true }, { text: '.' }];
      break;
    case 'bai-bao-khoa-hoc':
      parts = m.containerTitle
        ? [{ text: `${who ? `${who} ` : ''}${when ? `(${when}), ` : ''}` }, { text: m.containerTitle, italic: true }, { text: '.' }]
        : [{ text: `${who ? `${who} ` : ''}${when ? `(${when}). ` : ''}` }, { text: title, italic: true }, { text: '.' }];
      break;
    case 'bao-chi':
      parts = [{ text: m.containerTitle ?? title, italic: true }, { text: when ? `, ${when}.` : '.' }];
      break;
    case 'van-ban-phap-luat':
      parts = [{ text: `${title}${m.identifier ? `, số ${m.identifier}` : ''}.` }];
      break;
    case 'podcast':
    case 'video':
      parts = [
        { text: m.containerTitle ?? title, italic: true },
        { text: `${m.publisher ? ` (${m.publisher})` : ''}${when ? `, ${when}` : ''}.` },
      ];
      break;
    default:
      parts = [{ text: `${title}${m.publisher || m.containerTitle ? ` (${m.publisher ?? m.containerTitle})` : ''}${when ? `, ${when}` : ''}.` }];
  }
  return base(m, [parts]);
}

/** Bản đầy đủ: các cụm nối bằng " · ", dùng trong bảng bên của mục Nguồn. */
export function fullCitation(title: string, m: SourceMeta): Citation {
  const label = SOURCE_TYPE_LABELS[m.sourceType];
  const authors = authorsFull(m.authors ?? []);
  const when = yearOrDate(m);
  const duration = m.durationMin ? `${m.durationMin} phút` : undefined;
  let segs: (CitationPart[] | null)[];
  switch (m.sourceType) {
    case 'sach':
      segs = [t(label), t(authors), t(when), t(title, true), t(m.publisher), t(m.identifier)];
      break;
    case 'bai-bao-khoa-hoc':
      segs = [t(label), t(authors), t(when), t(quoted(title)), t(m.containerTitle, true), t(m.identifier)];
      break;
    case 'bao-chi':
      segs = [t(label), t(authors), t(m.containerTitle, true), t(when), t(quoted(title))];
      break;
    case 'van-ban-phap-luat':
      segs = [t(label), t(title), t(m.identifier ? `số ${m.identifier}` : undefined), t(formatDate(m.date) ? `ban hành ${formatDate(m.date)}` : m.year)];
      break;
    case 'podcast':
    case 'video':
      segs = [
        t(label),
        m.containerTitle ? [{ text: m.containerTitle, italic: true }, ...(m.publisher ? [{ text: ` (${m.publisher})` }] : [])] : t(m.publisher),
        t(quoted(title)),
        t(when),
        t(duration),
      ];
      break;
    default:
      segs = [t(label), t(authors), t(title), t(m.containerTitle ?? m.publisher), t(when)];
  }
  return base(m, compact(segs));
}

/** Chuỗi thuần của một trích dẫn (bỏ định dạng). */
export function citationText(c: Citation): string {
  return c.segments.map((seg) => seg.map((p) => p.text).join('')).join(' · ');
}

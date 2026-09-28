/**
 * Đọc JSON người dùng dán từ AI và ghép vào block đang sửa.
 */
import JSON5 from 'json5';
import { checkBlock } from '@/lib/schemas/blocks';
import { normalizeBlock } from './normalize';

/** Ký tự vô hình hay lẫn vào khi copy từ giao diện chat. */
const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF]/g;
/** Khoảng trắng Unicode (NBSP…) mà JSON.parse không coi là khoảng trắng. */
const ODD_SPACES = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;

function normalizeText(raw: string): string {
  return raw.replace(INVISIBLE, '').replace(ODD_SPACES, ' ').replace(/\uFF02/g, '"').replace(/\r\n?/g, '\n');
}

/** Nội dung mọi khối ```…``` theo thứ tự xuất hiện. */
function fencedBlocks(text: string): string[] {
  return [...text.matchAll(/```[^\n`]*\n?([\s\S]*?)```/g)].map((m) => m[1]);
}

/**
 * Cắt các đoạn `{…}` cân ngoặc, bắt đầu từ từng dấu `{` trong văn bản. Bỏ qua
 * ngoặc nằm trong chuỗi. Nhờ vậy lời dẫn có chứa `{` (vd "bắt đầu bằng `{`")
 * không còn làm hỏng việc tìm JSON thật phía sau.
 */
function balancedObjects(text: string, limit = 40): string[] {
  const out: string[] = [];
  for (let start = text.indexOf('{'); start >= 0 && out.length < limit; start = text.indexOf('{', start + 1)) {
    let depth = 0;
    let quote: string | null = null;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (quote) {
        if (ch === '\\') i++;
        else if (ch === quote || ch === '\n') quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') {
        depth--;
        if (depth === 0) {
          out.push(text.slice(start, i + 1));
          break;
        }
      }
    }
  }
  return out;
}

function straightenStructuralQuotes(text: string): string {
  return text
    .replace(/([{[,:]\s*)[“”„]/g, '$1"')
    .replace(/[“”„](\s*[:,}\]])/g, '"$1');
}

type Attempt = { ok: true; value: unknown } | { ok: false; error: string };

function parseLoose(candidate: string): Attempt {
  const text = candidate.trim();
  const tries = [
    () => JSON.parse(text),
    // JSON5: key không có ngoặc kép, nháy đơn, dấu phẩy thừa, chú thích.
    () => JSON5.parse(text),
    // Ngoặc kép cong do trình soạn thảo tự đổi: chỉ đổi ở vị trí cú pháp (quanh
    // key, sau dấu `:`/`[`/`,`, trước `,`/`}`/`]`) để giữ ngoặc cong hợp lệ bên
    // trong chuỗi tiếng Việt.
    () => JSON5.parse(straightenStructuralQuotes(text)),
  ];
  let first = '';
  for (const t of tries) {
    try {
      return { ok: true, value: t() };
    } catch (e) {
      if (!first) first = describeParseError(text, e);
    }
  }
  return { ok: false, error: first };
}

/** Thông báo lỗi kèm đoạn văn bản quanh chỗ hỏng; ký tự vô hình hiện thành mã. */
function describeParseError(text: string, e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/Unexpected end of JSON/.test(msg)) {
    return 'JSON bị cắt dở (thiếu phần cuối) — bảo AI trả lại đầy đủ trong một khối code';
  }
  const pos = Number(msg.match(/position (\d+)/)?.[1] ?? NaN);
  if (!Number.isFinite(pos)) return msg;
  const show = (s: string) =>
    [...s]
      .map((c) => (/[\x20-\x7E]|[\u00C0-\u1EF9]/.test(c) ? c : c === '\n' ? '↵' : `⟨U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}⟩`))
      .join('');
  return `${msg} — gần: «${show(text.slice(Math.max(0, pos - 20), pos))}▶${show(text.slice(pos, pos + 20))}»`;
}

function isBlockLike(v: unknown): boolean {
  if (Array.isArray(v)) return v.length === 1 && isBlockLike(v[0]);
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.type === 'string' || (!!o.block && typeof o.block === 'object') || (!!o.fields && typeof o.fields === 'object');
}

/**
 * Lấy block JSON từ câu trả lời của AI. Thử lần lượt: từng khối code, cả văn bản,
 * rồi từng đoạn `{…}` cân ngoặc; ưu tiên kết quả trông giống một block.
 */
export function extractJson(raw: string): unknown {
  const text = normalizeText(raw).trim();
  if (!text) throw new Error('Chưa dán nội dung');

  const candidates = [...fencedBlocks(text), text, ...balancedObjects(text)];
  let firstError = '';
  const seen = new Set<string>();
  for (const c of candidates) {
    const key = c.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const r = parseLoose(key);
    if (r.ok) {
      // Chỉ nhận thứ trông như một block — đoạn `{…}` con (một cặp, một option)
      // cũng parse được nhưng ghép vào sẽ ra lỗi khó hiểu.
      if (isBlockLike(r.value)) return r.value;
    } else if (!firstError && /^[[{]/.test(key)) {
      firstError = r.error;
    }
  }
  if (!text.includes('{')) throw new Error('Không tìm thấy JSON trong nội dung đã dán');
  throw new Error(`JSON không hợp lệ: ${firstError || 'không đọc được đoạn { … } nào'}`);
}

/** AI đôi khi bọc block trong `{ "block": … }` hoặc một mảng một phần tử. */
function unwrap(value: unknown): unknown {
  if (Array.isArray(value) && value.length === 1) return unwrap(value[0]);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const v = value as Record<string, unknown>;
    if (!('type' in v) && v.block && typeof v.block === 'object') return v.block;
  }
  return value;
}

export type ApplyResult<T> = { ok: true; block: T } | { ok: false; errors: string[] };

/**
 * Ghép JSON đã dán vào `current`:
 *  - `type` phải trùng loại block đang sửa (không đổi loại qua đường dán);
 *  - `id` của block giữ nguyên;
 *  - custom block chỉ nhận `fields`, giữ `customBlockTypeId`/`configSnapshot`.
 */
export function applyImportedJson<T extends { type: string; id?: string }>(current: T, raw: string): ApplyResult<T> {
  let parsed: unknown;
  try {
    parsed = unwrap(extractJson(raw));
  } catch (e) {
    return { ok: false, errors: [e instanceof Error ? e.message : String(e)] };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, errors: ['Nội dung phải là một object JSON của đúng một block'] };
  }
  const incoming = parsed as Record<string, unknown>;
  if (incoming.type !== undefined && incoming.type !== current.type) {
    return {
      ok: false,
      errors: [`type: đang sửa block "${current.type}" nhưng JSON là "${String(incoming.type)}"`],
    };
  }

  const merged =
    current.type === 'custom'
      ? { ...current, fields: { ...((current as { fields?: object }).fields ?? {}), ...((incoming.fields as object) ?? {}) } }
      : { ...incoming, type: current.type, ...(current.id !== undefined && { id: current.id }) };

  const normalized = normalizeBlock(merged);
  const result = checkBlock(normalized);
  if (!result.ok) return result;
  // Bản parse bỏ trường thừa AI tự thêm; custom block dùng looseObject nên vẫn giữ
  // `customBlockTypeId`/`configSnapshot`.
  return { ok: true, block: result.block as T };
}

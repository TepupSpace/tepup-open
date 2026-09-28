/**
 * Chuẩn hoá block trước khi kiểm schema — sửa những thứ máy tự suy ra được thay vì
 * bắt người (hoặc AI) tự làm:
 *  - option/cặp/thẻ thiếu `id` → sinh id;
 *  - `startIndex` của bias-detector → tính lại từ vị trí thật của `text` trong bài.
 *
 * Dùng chung cho drawer (khi dán JSON từ AI) và các route lưu bài.
 */
import { checkBlock, isKnownBlockType } from '@/lib/schemas/blocks';

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Điền id còn thiếu. `QuestionBlock` dùng `String(index)` khi option thiếu id, nên
 *  giữ đúng quy ước đó để lựa chọn cũ của người học không bị lệch. */
function fillIds(list: unknown, prefix = ''): unknown {
  if (!Array.isArray(list)) return list;
  const used = new Set(list.filter(isObj).map((x) => x.id).filter((id): id is string => typeof id === 'string'));
  return list.map((item, i) => {
    if (!isObj(item) || (typeof item.id === 'string' && item.id)) return item;
    let id = `${prefix}${prefix ? i + 1 : i}`;
    while (used.has(id)) id = `${id}_`;
    used.add(id);
    return { ...item, id };
  });
}

function fixBiasIndexes(block: Obj): Obj {
  const text = isObj(block.article) && typeof block.article.text === 'string' ? block.article.text : null;
  if (text === null || !Array.isArray(block.segments)) return block;
  let cursor = 0;
  const segments = block.segments.map((seg) => {
    if (!isObj(seg) || typeof seg.text !== 'string' || !seg.text) return seg;
    let at = text.indexOf(seg.text, cursor);
    if (at < 0) at = text.indexOf(seg.text);
    if (at < 0) return seg;
    cursor = at + seg.text.length;
    return { ...seg, startIndex: at };
  });
  return { ...block, segments };
}

export function normalizeBlock(block: unknown): unknown {
  if (!isObj(block)) return block;
  switch (block.type) {
    case 'question':
      return { ...block, options: fillIds(block.options) };
    case 'perspective-switch':
      return {
        ...block,
        perspectives: fillIds(block.perspectives, 'p'),
        question: isObj(block.question) ? { ...block.question, options: fillIds(block.question.options) } : block.question,
      };
    case 'pair-match':
      return { ...block, pairs: fillIds(block.pairs, 'p') };
    case 'flip-card':
      return { ...block, cards: fillIds(block.cards, 'c') };
    case 'sort-bucket':
      return { ...block, buckets: fillIds(block.buckets, 'b'), items: fillIds(block.items, 'i') };
    case 'bias-detector':
      return fixBiasIndexes({ ...block, segments: fillIds(block.segments, 's') });
    default:
      return block;
  }
}

/**
 * Chuẩn hoá + kiểm cả mảng block trước khi ghi DB.
 *
 * Block có `type` không nằm trong schema (các loại cũ chưa có renderer) được giữ
 * nguyên và KHÔNG chặn — bài cũ vẫn phải lưu được. Mọi loại đã biết thì phải hợp lệ.
 */
export function prepareBlocksForSave(blocks: unknown): { blocks: unknown[]; errors: string[] } {
  if (blocks === undefined || blocks === null) return { blocks: [], errors: [] };
  if (!Array.isArray(blocks)) return { blocks: [], errors: ['blocks phải là một mảng'] };
  const errors: string[] = [];
  const out = blocks.map((raw, i) => {
    const block = normalizeBlock(raw);
    const type = (block as { type?: unknown } | null)?.type;
    if (!isKnownBlockType(type)) return block;
    const r = checkBlock(block);
    if (!r.ok) errors.push(...r.errors.map((e) => `Block #${i + 1} (${type}) — ${e}`));
    return block;
  });
  return { blocks: out, errors };
}

/**
 * Như `prepareBlocksForSave`, cho `Contribution.data`: dạng `{ blocks }`
 * (EDIT_LESSON_CONTENT) hoặc `{ levels: [{ lessons: [{ content: { blocks } }] }] }`
 * (NEW_COURSE). Mọi dạng khác được giữ nguyên.
 */
export function prepareContributionData(data: unknown): { data: unknown; errors: string[] } {
  if (!isObj(data)) return { data, errors: [] };
  if (data.blocks !== undefined) {
    const r = prepareBlocksForSave(data.blocks);
    return { data: { ...data, blocks: r.blocks }, errors: r.errors };
  }
  if (!Array.isArray(data.levels)) return { data, errors: [] };
  const errors: string[] = [];
  const levels = data.levels.map((level, li) => {
    if (!isObj(level) || !Array.isArray(level.lessons)) return level;
    const lessons = level.lessons.map((lesson, bi) => {
      if (!isObj(lesson) || !isObj(lesson.content) || lesson.content.blocks === undefined) return lesson;
      const r = prepareBlocksForSave(lesson.content.blocks);
      const name = typeof lesson.name === 'string' && lesson.name ? lesson.name : `bài ${bi + 1}`;
      errors.push(...r.errors.map((e) => `Level ${li + 1} › ${name} › ${e}`));
      return { ...lesson, content: { ...lesson.content, blocks: r.blocks } };
    });
    return { ...level, lessons };
  });
  return { data: { ...data, levels }, errors };
}

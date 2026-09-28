/**
 * Sinh tài liệu cho AI bên ngoài từ `BLOCK_SPECS` + zod schema: file .md/.json để
 * tải về, và prompt để copy. Cùng một nguồn với bước kiểm khi dán JSON, nên tài
 * liệu không thể trôi khỏi validator.
 */
import { z } from 'zod';
import { BLOCK_SCHEMAS, customFieldsSchema, isKnownBlockType } from '@/lib/schemas/blocks';
import type { EditorField } from '@/lib/types/custom-block';
import { BLOCK_SPECS, SPEC_TYPES, type BlockSpec } from './block-specs';

export interface CustomTypeInfo {
  name: string;
  description?: string;
  editorSchema: EditorField[];
}

const GENERAL_RULES = [
  'Viết tiếng Việt có dấu đầy đủ, giọng trung lập, dễ hiểu.',
  'Số liệu và dữ kiện phải đúng sự thật; không bịa nguồn, không bịa URL.',
  'Giữ nguyên tên trường và giá trị `type` như schema. Không thêm trường ngoài schema.',
  'Không cần trường `id` ở cấp block — hệ thống tự gán.',
];

// Đặt JSON trong khối code để người dùng bấm nút Copy của khối đó — copy phần chữ
// đã hiển thị dễ dính ký tự lạ. Không nhắc ký tự ngoặc nhọn ở đây: AI hay chép lại
// câu này, và ngoặc trong lời dẫn từng làm hỏng việc tìm JSON.
const OUTPUT_RULE =
  'Trả về đúng MỘT khối code markdown ```json chứa JSON hợp lệ (key và chuỗi dùng ngoặc kép thẳng). Không viết gì khác ngoài khối code đó.';

export function blockJsonSchema(type: string, custom?: CustomTypeInfo): Record<string, unknown> {
  if (type === 'custom') {
    return z.toJSONSchema(customFieldsSchema(custom?.editorSchema ?? [])) as Record<string, unknown>;
  }
  if (!isKnownBlockType(type)) throw new Error(`Không có schema cho block "${type}"`);
  return z.toJSONSchema(BLOCK_SCHEMAS[type], { unrepresentable: 'any' }) as Record<string, unknown>;
}

function customSpec(custom?: CustomTypeInfo): BlockSpec {
  const base = BLOCK_SPECS.custom;
  const fields = custom?.editorSchema ?? [];
  const example: Record<string, unknown> = {};
  for (const f of fields) {
    example[f.key] =
      f.type === 'number' ? (f.defaultValue ?? 0)
      : f.type === 'boolean' ? (f.defaultValue ?? false)
      : f.type === 'select' ? (f.defaultValue ?? f.options[0]?.value ?? '')
      : `<${f.label}>`;
  }
  return {
    ...base,
    label: custom?.name ? `${base.label}: ${custom.name}` : base.label,
    purpose: custom?.description ? `${custom.description}\n\n${base.purpose}` : base.purpose,
    fields: fields.map((f) => {
      const extra =
        f.type === 'select' ? ` — một trong: ${f.options.map((o) => `"${o.value}" (${o.label})`).join(', ')}`
        : f.type === 'number' && (f.min !== undefined || f.max !== undefined) ? ` — trong khoảng [${f.min ?? '…'}, ${f.max ?? '…'}]`
        : '';
      return `\`${f.key}\` (${f.type}): ${f.label}${extra}`;
    }),
    example: { type: 'custom', fields: example },
  };
}

function specFor(type: string, custom?: CustomTypeInfo): BlockSpec {
  if (type === 'custom') return customSpec(custom);
  const spec = BLOCK_SPECS[type];
  if (!spec) throw new Error(`Không có mô tả cho block "${type}"`);
  return spec;
}

const fence = (lang: string, body: string) => `\`\`\`${lang}\n${body}\n\`\`\``;
const json = (v: unknown) => JSON.stringify(v, null, 2);
const bullets = (items: string[]) => items.map((i) => `- ${i}`).join('\n');

/** Phần mô tả một block, dùng trong cả file đơn, file bộ đầy đủ và prompt. */
function blockSection(type: string, custom: CustomTypeInfo | undefined, heading: string): string {
  const spec = specFor(type, custom);
  return [
    `${heading} \`${type}\` — ${spec.label}`,
    spec.purpose,
    '**Các trường**',
    bullets(spec.fields),
    '**Luật riêng**',
    bullets(spec.rules),
    '**Ví dụ**',
    fence('json', json(spec.example)),
    '**JSON Schema**',
    fence('json', json(blockJsonSchema(type, custom))),
  ].join('\n\n');
}

/** File .md cho một loại block. */
export function blockSpecMarkdown(type: string, custom?: CustomTypeInfo): string {
  return [
    `# Tepup — hướng dẫn điền block \`${type}\``,
    'Đính kèm file này vào AI của bạn (ChatGPT, Claude, Gemini…) rồi mô tả nội dung muốn tạo. AI sẽ trả về JSON; dán JSON đó vào ô "Dán JSON từ AI" của block trong Tepup.',
    '## Luật chung',
    bullets([...GENERAL_RULES, OUTPUT_RULE]),
    blockSection(type, custom, '##'),
  ].join('\n\n') + '\n';
}

/** File .md bộ đầy đủ — mọi loại block có form trong editor (trừ custom). */
export function allBlocksMarkdown(): string {
  return [
    '# Tepup — hướng dẫn điền block cho AI',
    'Đính kèm file này vào AI của bạn (ChatGPT, Claude, Gemini, hoặc Project/Custom GPT) để dùng lại nhiều lần. Mỗi lần, nói rõ **loại block** cần tạo và nội dung mong muốn. AI trả về JSON của đúng một block; dán JSON đó vào ô "Dán JSON từ AI" của block cùng loại trong Tepup.',
    '## Luật chung',
    bullets([...GENERAL_RULES, OUTPUT_RULE]),
    '## Danh sách block',
    bullets(SPEC_TYPES.map((t) => `\`${t}\` — ${BLOCK_SPECS[t].label}: ${BLOCK_SPECS[t].purpose}`)),
    ...SPEC_TYPES.map((t) => blockSection(t, undefined, '##')),
  ].join('\n\n') + '\n';
}

/** File .json cho một loại block. */
export function blockSpecJson(type: string, custom?: CustomTypeInfo) {
  const spec = specFor(type, custom);
  return {
    type,
    label: spec.label,
    purpose: spec.purpose,
    fields: spec.fields,
    rules: [...GENERAL_RULES, ...spec.rules],
    schema: { ...blockJsonSchema(type, custom), examples: [spec.example] },
  };
}

/** File .json bộ đầy đủ. */
export function allBlocksJson() {
  return {
    about: 'Tepup — JSON Schema của các block bài học. Trả về JSON của đúng một block.',
    rules: [...GENERAL_RULES, OUTPUT_RULE],
    blocks: Object.fromEntries(SPEC_TYPES.map((t) => [t, blockSpecJson(t)])),
  };
}

/** Bỏ các trường chỉ phục vụ hệ thống trước khi đưa block hiện tại cho AI. */
function blockForPrompt(block: Record<string, unknown>): Record<string, unknown> {
  if (block.type === 'custom') return { type: 'custom', fields: block.fields ?? {} };
  const rest = { ...block };
  delete rest.id;
  return rest;
}

function hasContent(v: unknown): boolean {
  if (typeof v === 'string') return v.trim() !== '';
  if (typeof v === 'number' || typeof v === 'boolean') return false;
  if (Array.isArray(v)) return v.some(hasContent);
  if (v && typeof v === 'object') return Object.entries(v).some(([k, x]) => k !== 'type' && k !== 'id' && hasContent(x));
  return false;
}

/** Prompt copy một lần: đủ ngữ cảnh để AI chat thường điền đúng block. */
export function buildBlockPrompt(
  block: Record<string, unknown>,
  idea: string,
  custom?: CustomTypeInfo
): string {
  const type = String(block.type);
  const current = blockForPrompt(block);
  const parts = [
    'Bạn là biên tập viên học liệu cho Tepup — nền tảng học tiếng Việt về kinh tế, chính trị, tư duy phản biện. Nhiệm vụ: tạo nội dung cho MỘT block bài học theo đúng đặc tả dưới đây.',
    '# Luật chung',
    bullets(GENERAL_RULES),
    blockSection(type, custom, '#'),
  ];
  if (hasContent(current)) {
    parts.push('# Block hiện tại (sửa tiếp từ đây, giữ những gì còn đúng)', fence('json', json(current)));
  }
  parts.push(
    '# Yêu cầu',
    idea.trim() || '(Người dùng sẽ mô tả nội dung ở tin nhắn tiếp theo. Hãy hỏi họ muốn block nói về điều gì trước khi tạo.)',
    '# Định dạng trả lời',
    OUTPUT_RULE
  );
  return parts.join('\n\n');
}

/** Tin nhắn nhờ AI sửa khi JSON dán vào không hợp lệ. */
export function buildFixPrompt(type: string, errors: string[], pasted: string): string {
  return [
    `JSON block \`${type}\` bạn vừa trả về chưa hợp lệ. Lỗi hệ thống báo:`,
    bullets(errors),
    'JSON đã dán:',
    // Rào 4 dấu vì nội dung dán vào có thể đã chứa ``` của AI.
    `\`\`\`\`\n${pasted.trim()}\n\`\`\`\``,
    `Hãy sửa đúng các lỗi trên và trả lại toàn bộ block. ${OUTPUT_RULE}`,
  ].join('\n\n');
}

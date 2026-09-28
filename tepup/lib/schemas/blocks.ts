/**
 * Zod schemas for content blocks.
 *
 * These mirror the interfaces in `lib/types/content.ts` and serve two purposes:
 *  1. Chặn block sai cấu trúc ở các route lưu bài (block sai type/thiếu trường sẽ
 *     biến mất âm thầm ở `BlockRenderer`).
 *  2. Sinh JSON Schema (qua `z.toJSONSchema`) cho file tải về và prompt gửi AI bên
 *     ngoài — xem `lib/ai-import/`.
 *
 * Schema chỉ kiểm CẤU TRÚC: chuỗi rỗng vẫn hợp lệ để người soạn lưu được bản dở.
 * Ràng buộc chéo (id tham chiếu, công thức an toàn…) nằm trong `superRefine`.
 *
 * Security layer: `STRICT_BLOCK_SCHEMAS` at the bottom of this file are strict,
 * length-bounded schemas for EVERY block type, applied to untrusted contributor content
 * (after the structural check above) via `lib/schemas/content-validation.ts`. Formulas
 * are additionally evaluated at runtime only through `lib/security/safe-expr.ts`.
 */
import { z } from 'zod';
import type {
  ListItem,
  CheckListItem,
} from '@/lib/types/content';
import { PAIR_MATCH_LIMITS, FLIP_CARD_LIMITS } from '@/lib/blockLimits';
import { MAX_EXPR_LENGTH } from '@/lib/security/safe-expr';

const idField = { id: z.string().optional() };

// --- recursive helpers ---
export const listItemSchema: z.ZodType<ListItem> = z.lazy(() =>
  z.object({
    html: z.string(),
    children: z.array(listItemSchema).optional(),
  })
);

export const checkListItemSchema: z.ZodType<CheckListItem> = z.lazy(() =>
  z.object({
    html: z.string(),
    checked: z.boolean(),
    children: z.array(checkListItemSchema).optional(),
  })
);

// --- text / media ---
export const textBlockSchema = z.object({
  ...idField,
  type: z.literal('text'),
  title: z.string().optional(),
  paragraphs: z.array(z.string()),
  html: z.string().optional(),
});

export const imageBlockSchema = z.object({
  ...idField,
  type: z.literal('image'),
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

export const videoBlockSchema = z.object({
  ...idField,
  type: z.literal('video'),
  url: z.string(),
  caption: z.string().optional(),
});

export const audioBlockSchema = z.object({
  ...idField,
  type: z.literal('audio'),
  url: z.string(),
  caption: z.string().optional(),
});

export const fileBlockSchema = z.object({
  ...idField,
  type: z.literal('file'),
  url: z.string(),
  name: z.string().optional(),
  caption: z.string().optional(),
});

// --- native rich-text ---
export const headingBlockSchema = z.object({
  ...idField,
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  html: z.string(),
});

export const quoteBlockSchema = z.object({
  ...idField,
  type: z.literal('quote'),
  html: z.string(),
});

export const codeBlockSchema = z.object({
  ...idField,
  type: z.literal('code'),
  language: z.string().optional(),
  code: z.string(),
});

export const bulletListBlockSchema = z.object({
  ...idField,
  type: z.literal('bullet-list'),
  items: z.array(listItemSchema),
});

export const numberedListBlockSchema = z.object({
  ...idField,
  type: z.literal('numbered-list'),
  items: z.array(listItemSchema),
});

export const checkListBlockSchema = z.object({
  ...idField,
  type: z.literal('check-list'),
  items: z.array(checkListItemSchema),
});

export const tableBlockSchema = z.object({
  ...idField,
  type: z.literal('table'),
  rows: z.array(z.array(z.string())),
  headerRow: z.boolean().optional(),
});

export const stepBreakBlockSchema = z.object({
  ...idField,
  type: z.literal('step-break'),
  label: z.string().optional(),
});

/** Toggle contains nested content; children validated permissively to avoid a
 *  circular dependency on the full ContentBlock union. */
export const toggleBlockSchema = z.object({
  ...idField,
  type: z.literal('toggle'),
  html: z.string(),
  children: z.array(z.looseObject({ type: z.string() })),
});

// --- công thức ---

const MATH_FUNCTIONS = new Set([
  'abs', 'min', 'max', 'round', 'floor', 'ceil', 'pow', 'sqrt', 'log', 'log10', 'exp', 'sign', 'trunc',
]);
const MATH_CONSTANTS = new Set(['PI', 'E']);

const EXPR_TOKEN =
  /\s+|\d+(?:\.\d+)?|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*|===|!==|==|!=|<=|>=|&&|\|\||[-+*/%()<>?:!,]/y;

/**
 * Công thức/điều kiện được chạy phía người học qua `lib/security/safe-expr.ts`; kiểm tra lúc lưu này chỉ cho
 * phép biểu thức số học: số, toán tử, ngoặc, `?:`, so sánh, `Math.<hàm>` và các
 * biến đã khai báo. Mọi thứ khác (chuỗi, gán, dấu chấm phẩy, truy cập thuộc tính)
 * đều bị từ chối — nội dung giờ có thể đến từ người ngoài.
 *
 * Trả về thông báo lỗi, hoặc `null` nếu hợp lệ.
 */
export function checkExpression(expr: string, variables: Iterable<string>): string | null {
  const vars = new Set(variables);
  if (!expr.trim()) return 'không được để trống';
  EXPR_TOKEN.lastIndex = 0;
  while (EXPR_TOKEN.lastIndex < expr.length) {
    const at = EXPR_TOKEN.lastIndex;
    const m = EXPR_TOKEN.exec(expr);
    if (!m) return `ký tự không được phép "${expr[at]}" ở vị trí ${at}`;
    const tok = m[0];
    if (!/^[A-Za-z_$]/.test(tok)) continue;
    if (tok.startsWith('Math.')) {
      const name = tok.slice(5);
      if (MATH_FUNCTIONS.has(name) || MATH_CONSTANTS.has(name)) continue;
      return `không hỗ trợ "${tok}"`;
    }
    if (tok === 'true' || tok === 'false') continue;
    if (!vars.has(tok)) {
      return `biến "${tok}" chưa được khai báo (biến hợp lệ: ${[...vars].join(', ') || 'không có'})`;
    }
  }
  return null;
}

type Ctx = z.core.$RefinementCtx;

function refineExpr(ctx: Ctx, expr: string, vars: string[], path: (string | number)[]) {
  const err = checkExpression(expr, vars);
  if (err) ctx.addIssue({ code: 'custom', message: `công thức ${err}`, path });
}

function refineUniqueIds(ctx: Ctx, items: { id: string }[], path: string) {
  const seen = new Set<string>();
  items.forEach((it, i) => {
    if (seen.has(it.id)) ctx.addIssue({ code: 'custom', message: `id "${it.id}" bị trùng`, path: [path, i, 'id'] });
    seen.add(it.id);
  });
}

// --- widget của Tepup ---

const choiceSchema = z.object({ id: z.string(), text: z.string(), isCorrect: z.boolean() });

export const calloutBlockSchema = z.object({
  ...idField,
  type: z.literal('callout'),
  icon: z.string().optional(),
  title: z.string().optional(),
  text: z.string(),
  variant: z.enum(['info', 'warning', 'success']).optional(),
});

export const questionBlockSchema = z
  .object({
    ...idField,
    type: z.literal('question'),
    question: z.string(),
    mode: z.enum(['single', 'multiple']).optional(),
    options: z.array(choiceSchema).min(2),
    explanation: z.string().optional(),
  })
  .superRefine((b, ctx) => {
    refineUniqueIds(ctx, b.options, 'options');
    const correct = b.options.filter((o) => o.isCorrect).length;
    if (b.mode === 'multiple' ? correct < 2 : correct !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message:
          b.mode === 'multiple'
            ? 'mode "multiple" cần ít nhất 2 đáp án đúng'
            : `cần đúng 1 đáp án có isCorrect: true (đang có ${correct})`,
      });
    }
  });

export const libraryDocumentBlockSchema = z.object({
  ...idField,
  type: z.literal('library-document'),
  mode: z.enum(['reference', 'inline']).optional(),
  documentId: z.string().optional(),
  documentSlug: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  estimatedReadTime: z.string().optional(),
  documentContent: z
    .object({
      sections: z.array(z.object({ heading: z.string().optional(), paragraphs: z.array(z.string()) })),
      relatedConcepts: z.array(z.string()).optional(),
      furtherReading: z.array(z.string()).optional(),
    })
    .optional(),
});

export const calculatorBlockSchema = z
  .object({
    ...idField,
    type: z.literal('calculator'),
    title: z.string().optional(),
    description: z.string().optional(),
    calculatorType: z.enum(['tax', 'compound-interest', 'inflation', 'custom']),
    inputs: z
      .array(
        z.object({
          id: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/, 'id phải là tên biến (chữ, số, _)'),
          label: z.string(),
          type: z.enum(['number', 'select']),
          unit: z.string().optional(),
          defaultValue: z.number(),
          min: z.number().optional(),
          max: z.number().optional(),
          step: z.number().optional(),
          options: z.array(z.object({ value: z.number(), label: z.string() })).optional(),
        })
      )
      .min(1),
    formula: z.string(),
    outputs: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          unit: z.string().optional(),
          formula: z.string(),
          highlight: z.boolean().optional(),
        })
      )
      .min(1),
    presets: z.array(z.object({ label: z.string(), values: z.record(z.string(), z.number()) })).optional(),
    insight: z.string().optional(),
  })
  .superRefine((b, ctx) => {
    refineUniqueIds(ctx, b.inputs, 'inputs');
    refineUniqueIds(ctx, b.outputs, 'outputs');
    const vars = b.inputs.map((i) => i.id);
    refineExpr(ctx, b.formula, vars, ['formula']);
    b.outputs.forEach((o, i) => refineExpr(ctx, o.formula, vars, ['outputs', i, 'formula']));
    b.inputs.forEach((inp, i) => {
      if (inp.type === 'select' && !inp.options?.length) {
        ctx.addIssue({ code: 'custom', message: 'input type "select" cần có options', path: ['inputs', i, 'options'] });
      }
    });
    b.presets?.forEach((p, i) =>
      Object.keys(p.values).forEach((k) => {
        if (!vars.includes(k)) {
          ctx.addIssue({ code: 'custom', message: `preset dùng biến "${k}" không có trong inputs`, path: ['presets', i, 'values', k] });
        }
      })
    );
  });

export const sliderSimulatorBlockSchema = z
  .object({
    ...idField,
    type: z.literal('slider-simulator'),
    title: z.string().optional(),
    description: z.string().optional(),
    sliders: z
      .array(
        z.object({
          id: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/, 'id phải là tên biến (chữ, số, _)'),
          label: z.string(),
          min: z.number(),
          max: z.number(),
          step: z.number().positive(),
          defaultValue: z.number(),
          unit: z.string().optional(),
        })
      )
      .min(1),
    outputs: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          formula: z.string(),
          unit: z.string().optional(),
          format: z.enum(['number', 'percent', 'currency']).optional(),
        })
      )
      .min(1),
    chart: z
      .object({
        type: z.literal('bar'),
        bars: z.array(z.object({ label: z.string(), formula: z.string(), color: z.string().optional() })),
      })
      .optional(),
    breakpoints: z
      .array(z.object({ condition: z.string(), message: z.string(), variant: z.enum(['info', 'warning', 'success']) }))
      .optional(),
  })
  .superRefine((b, ctx) => {
    refineUniqueIds(ctx, b.sliders, 'sliders');
    const vars = b.sliders.map((s) => s.id);
    b.sliders.forEach((s, i) => {
      if (s.min > s.max) ctx.addIssue({ code: 'custom', message: 'min lớn hơn max', path: ['sliders', i] });
      else if (s.defaultValue < s.min || s.defaultValue > s.max) {
        ctx.addIssue({ code: 'custom', message: 'defaultValue nằm ngoài [min, max]', path: ['sliders', i, 'defaultValue'] });
      }
    });
    b.outputs.forEach((o, i) => refineExpr(ctx, o.formula, vars, ['outputs', i, 'formula']));
    b.chart?.bars.forEach((bar, i) => refineExpr(ctx, bar.formula, vars, ['chart', 'bars', i, 'formula']));
    b.breakpoints?.forEach((bp, i) => refineExpr(ctx, bp.condition, vars, ['breakpoints', i, 'condition']));
  });

export const BUDGET_COLORS = ['blue', 'red', 'green', 'amber', 'purple', 'pink', 'cyan', 'orange'] as const;

export const budgetAllocatorBlockSchema = z
  .object({
    ...idField,
    type: z.literal('budget-allocator'),
    title: z.string().optional(),
    description: z.string().optional(),
    totalBudget: z.number().positive(),
    unit: z.string().optional(),
    categories: z
      .array(
        z.object({
          id: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/, 'id phải là tên biến (chữ, số, _)'),
          label: z.string(),
          icon: z.string().optional(),
          // Renderer tự lùi về "blue" khi gặp màu lạ, và nội dung cũ có màu ngoài danh
          // sách — nên chỉ gợi ý (spec cho AI liệt kê), không chặn.
          color: z.string().describe(`Một trong: ${BUDGET_COLORS.join(', ')}`),
          defaultValue: z.number(),
          minValue: z.number().optional(),
          description: z.string().optional(),
        })
      )
      .min(2),
    outcomes: z.array(
      z.object({
        condition: z.string(),
        title: z.string(),
        description: z.string(),
        variant: z.enum(['good', 'neutral', 'bad']),
      })
    ),
    comparison: z.object({ label: z.string(), values: z.record(z.string(), z.number()) }).optional(),
  })
  .superRefine((b, ctx) => {
    refineUniqueIds(ctx, b.categories, 'categories');
    const vars = b.categories.map((c) => c.id);
    b.outcomes.forEach((o, i) => refineExpr(ctx, o.condition, vars, ['outcomes', i, 'condition']));
  });

export const biasDetectorBlockSchema = z
  .object({
    ...idField,
    type: z.literal('bias-detector'),
    title: z.string().optional(),
    instruction: z.string(),
    article: z.object({ text: z.string(), source: z.string().optional() }),
    segments: z.array(
      z.object({
        id: z.string(),
        text: z.string().min(1),
        startIndex: z.number().int().min(0),
        biasType: z.string(),
        explanation: z.string(),
      })
    ),
    biasOptions: z.array(z.object({ id: z.string(), label: z.string() })).min(1),
  })
  .superRefine((b, ctx) => {
    refineUniqueIds(ctx, b.segments, 'segments');
    refineUniqueIds(ctx, b.biasOptions, 'biasOptions');
    const optionIds = new Set(b.biasOptions.map((o) => o.id));
    b.segments.forEach((s, i) => {
      if (!b.article.text.includes(s.text)) {
        ctx.addIssue({ code: 'custom', message: 'text phải là trích nguyên văn từ article.text', path: ['segments', i, 'text'] });
      } else if (b.article.text.slice(s.startIndex, s.startIndex + s.text.length) !== s.text) {
        ctx.addIssue({ code: 'custom', message: 'startIndex không khớp vị trí của text trong article.text', path: ['segments', i, 'startIndex'] });
      }
      if (!optionIds.has(s.biasType)) {
        ctx.addIssue({ code: 'custom', message: `biasType "${s.biasType}" không có trong biasOptions`, path: ['segments', i, 'biasType'] });
      }
    });
  });

export const perspectiveSwitchBlockSchema = z
  .object({
    ...idField,
    type: z.literal('perspective-switch'),
    title: z.string().optional(),
    event: z.string(),
    perspectives: z
      .array(z.object({ id: z.string(), role: z.string(), icon: z.string().optional(), narrative: z.string() }))
      .min(2),
    question: z.object({
      text: z.string(),
      options: z.array(choiceSchema).min(2),
      explanation: z.string(),
    }),
  })
  .superRefine((b, ctx) => {
    refineUniqueIds(ctx, b.perspectives, 'perspectives');
    refineUniqueIds(ctx, b.question.options, 'question.options');
    const correct = b.question.options.filter((o) => o.isCorrect).length;
    if (correct !== 1) {
      ctx.addIssue({ code: 'custom', message: `cần đúng 1 đáp án đúng (đang có ${correct})`, path: ['question', 'options'] });
    }
  });

export const hotColdGuessBlockSchema = z.object({
  ...idField,
  type: z.literal('hot-cold-guess'),
  title: z.string().optional(),
  question: z.string(),
  answer: z.number(),
  unit: z.string(),
  tolerance: z.number().min(0),
  hints: z.array(z.string()),
  context: z.string().optional(),
});

export const pairMatchBlockSchema = z
  .object({
    ...idField,
    type: z.literal('pair-match'),
    title: z.string().optional(),
    instruction: z.string().optional(),
    pairs: z.array(z.object({ id: z.string(), left: z.string(), right: z.string() })).min(2),
  })
  .superRefine((b, ctx) => refineUniqueIds(ctx, b.pairs, 'pairs'));

const flipCardFaceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), text: z.string() }),
  z.object({ kind: z.literal('image'), src: z.string(), alt: z.string().optional() }),
]);

export const flipCardBlockSchema = z
  .object({
    ...idField,
    type: z.literal('flip-card'),
    title: z.string().optional(),
    instruction: z.string().optional(),
    cards: z.array(z.object({ id: z.string(), front: flipCardFaceSchema, back: flipCardFaceSchema })).min(1),
  })
  .superRefine((b, ctx) => refineUniqueIds(ctx, b.cards, 'cards'));

export const sortBucketBlockSchema = z
  .object({
    ...idField,
    type: z.literal('sort-bucket'),
    title: z.string().optional(),
    instruction: z.string().optional(),
    buckets: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
    items: z.array(z.object({ id: z.string(), text: z.string(), bucketId: z.string() })).min(1),
  })
  .superRefine((b, ctx) => {
    refineUniqueIds(ctx, b.buckets, 'buckets');
    refineUniqueIds(ctx, b.items, 'items');
    const bucketIds = new Set(b.buckets.map((x) => x.id));
    b.items.forEach((it, i) => {
      if (!bucketIds.has(it.bucketId)) {
        ctx.addIssue({ code: 'custom', message: `bucketId "${it.bucketId}" không có trong buckets`, path: ['items', i, 'bucketId'] });
      }
    });
  });

const editorFieldSchema = z.looseObject({
  key: z.string(),
  label: z.string(),
  type: z.enum(['text', 'textarea', 'number', 'boolean', 'select']),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export const customBlockSchema = z
  .looseObject({
    ...idField,
    type: z.literal('custom'),
    customBlockTypeId: z.string(),
    fields: z.record(z.string(), z.unknown()),
    configSnapshot: z.looseObject({ editorSchema: z.array(editorFieldSchema).optional() }).optional(),
  })
  .superRefine((b, ctx) => {
    for (const f of b.configSnapshot?.editorSchema ?? []) {
      const v = b.fields[f.key];
      if (v === undefined) continue;
      const ok =
        f.type === 'number' ? typeof v === 'number'
        : f.type === 'boolean' ? typeof v === 'boolean'
        : f.type === 'select' ? typeof v === 'string' && (!f.options || f.options.some((o) => o.value === v))
        : typeof v === 'string';
      if (!ok) ctx.addIssue({ code: 'custom', message: `trường "${f.key}" phải là ${f.type}`, path: ['fields', f.key] });
    }
  });

/** Schema cho custom block dựng từ editorSchema của loại block đó — dùng cho file
 *  tải về/prompt, nơi AI chỉ cần điền `fields`. */
export function customFieldsSchema(editorSchema: { key: string; label: string; type: string; options?: { value: string }[] }[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of editorSchema) {
    const base =
      f.type === 'number' ? z.number()
      : f.type === 'boolean' ? z.boolean()
      : f.type === 'select' && f.options?.length ? z.enum(f.options.map((o) => o.value) as [string, ...string[]])
      : z.string();
    shape[f.key] = base.describe(f.label);
  }
  return z.object({ type: z.literal('custom'), fields: z.object(shape) });
}

/** Block chưa có schema riêng. Chỉ bắt buộc có `type`. */
export const opaqueBlockSchema = z.looseObject({ type: z.string() });

export const BLOCK_SCHEMAS = {
  text: textBlockSchema,
  image: imageBlockSchema,
  video: videoBlockSchema,
  audio: audioBlockSchema,
  file: fileBlockSchema,
  heading: headingBlockSchema,
  quote: quoteBlockSchema,
  code: codeBlockSchema,
  'bullet-list': bulletListBlockSchema,
  'numbered-list': numberedListBlockSchema,
  'check-list': checkListBlockSchema,
  table: tableBlockSchema,
  'step-break': stepBreakBlockSchema,
  toggle: toggleBlockSchema,
  callout: calloutBlockSchema,
  question: questionBlockSchema,
  'library-document': libraryDocumentBlockSchema,
  calculator: calculatorBlockSchema,
  'slider-simulator': sliderSimulatorBlockSchema,
  'budget-allocator': budgetAllocatorBlockSchema,
  'bias-detector': biasDetectorBlockSchema,
  'perspective-switch': perspectiveSwitchBlockSchema,
  'hot-cold-guess': hotColdGuessBlockSchema,
  'pair-match': pairMatchBlockSchema,
  'flip-card': flipCardBlockSchema,
  'sort-bucket': sortBucketBlockSchema,
  custom: customBlockSchema,
} as const;

export type SchemaBlockType = keyof typeof BLOCK_SCHEMAS;

export function isKnownBlockType(type: unknown): type is SchemaBlockType {
  return typeof type === 'string' && Object.hasOwn(BLOCK_SCHEMAS, type);
}

/** Thông báo lỗi mặc định bằng tiếng Việt — người soạn đọc trực tiếp. Truyền theo
 *  từng lần parse thay vì `z.config` để không đổi hành vi zod toàn cục. */
const VI_ERRORS = z.locales.vi().localeError;

function formatPath(path: PropertyKey[]): string {
  return path.reduce<string>((acc, seg) => {
    if (typeof seg === 'number') return `${acc}[${seg}]`;
    return acc ? `${acc}.${String(seg)}` : String(seg);
  }, '');
}

export type BlockCheck =
  | { ok: true; block: unknown }
  | { ok: false; errors: string[] };

/**
 * Kiểm một block. Trả về danh sách lỗi dạng `đường.dẫn: thông báo` để người dùng
 * dán ngược cho AI sửa. Khi hợp lệ, trả về bản đã parse (bỏ trường thừa với các
 * block có schema đóng).
 */
export function checkBlock(block: unknown): BlockCheck {
  const type = (block as { type?: unknown } | null)?.type;
  if (!isKnownBlockType(type)) {
    return { ok: false, errors: [`type: loại block "${String(type)}" không tồn tại`] };
  }
  const result = BLOCK_SCHEMAS[type].safeParse(block, { error: VI_ERRORS });
  if (result.success) return { ok: true, block: result.data };
  return {
    ok: false,
    errors: result.error.issues.map((i) => {
      const where = formatPath(i.path);
      return where ? `${where}: ${i.message}` : i.message;
    }),
  };
}

/** Kiểm cả mảng block của một bài. Lỗi được gắn số thứ tự block (bắt đầu từ 1). */
export function checkBlocks(blocks: unknown): string[] {
  if (!Array.isArray(blocks)) return ['blocks phải là một mảng'];
  const errors: string[] = [];
  blocks.forEach((b, i) => {
    const r = checkBlock(b);
    if (!r.ok) {
      const t = (b as { type?: unknown } | null)?.type;
      errors.push(...r.errors.map((e) => `Block #${i + 1} (${String(t)}) — ${e}`));
    }
  });
  return errors;
}

// ============================================================================
// Strict schemas for UNTRUSTED content (contributor submissions).
//
// `validateBlock` above stays permissive on purpose (editor round-trip, AI fill).
// The schemas below cover every block type in `lib/types/content.ts` with bounded
// lengths. Fields the editor leaves empty while drafting (see `createEmptyBlock`)
// are optional so autosave of a half-written block still works — completeness is
// the reviewer's job, safety is this file's.
//
// `z.object` strips unknown keys, so nothing outside the typed interface (which is
// all the renderers read) is ever stored. URL, HTML and formula *content* checks
// live in `content-validation.ts`; here we only bound their length.
// ============================================================================

/** Hard caps. The soft UX limits in `lib/blockLimits.ts` only warn authors, so the
 *  hard cap for those fields is a generous multiple of the soft one. */
export const CONTENT_LIMITS = {
  id: 100,
  short: 300,
  text: 5_000,
  html: 10_000,
  long: 20_000,
  formula: MAX_EXPR_LENGTH,
  url: 2_048,
  icon: 64,
  blocksPerLesson: 300,
  listItems: 200,
  listDepth: 6,
  toggleDepth: 3,
  tableRows: 100,
  tableCols: 20,
  options: 30,
  items: 200,
} as const;
const L = CONTENT_LIMITS;

const str = (max: number) => z.string().max(max);
const shortStr = str(L.short);
const textStr = str(L.text);
const htmlStr = str(L.html);
const unitStr = str(64);
const formulaStr = str(L.formula);
const urlStr = str(L.url);
const num = z.number(); // zod 4 already rejects NaN and ±Infinity
const arr = <T extends z.ZodType>(item: T, max: number) => z.array(item).max(max);

/** Ids that become formula variables / object keys — refuse prototype keys. */
const varId = str(L.id).refine((s) => !['__proto__', 'constructor', 'prototype'].includes(s), {
  message: 'id không hợp lệ / invalid id',
});

function strictListItem(depth: number): z.ZodType<ListItem> {
  const base = z.object({ html: htmlStr });
  return depth <= 1
    ? base
    : base.extend({ children: arr(strictListItem(depth - 1), L.listItems).optional() });
}
function strictCheckItem(depth: number): z.ZodType<CheckListItem> {
  const base = z.object({ html: htmlStr, checked: z.boolean() });
  return depth <= 1
    ? base
    : base.extend({ children: arr(strictCheckItem(depth - 1), L.listItems).optional() });
}

// Legacy quizzes have options without `id`; the renderer falls back to the index.
const choiceOption = z.object({ id: str(L.id).optional(), text: textStr, isCorrect: z.boolean() });

const flipFace = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), text: str(FLIP_CARD_LIMITS.face * 4) }),
  z.object({ kind: z.literal('image'), src: urlStr, alt: shortStr.optional() }),
]);

/**
 * One strict schema per block type. `toggle.children` is only shape-checked here
 * (array of `{type}`); the validator recurses into it with these same schemas.
 * `custom` is deliberately absent: Sandpack code blocks are admin-only.
 */
export const STRICT_BLOCK_SCHEMAS = {
  // --- native rich text / media ---
  text: z.object({
    ...idField,
    type: z.literal('text'),
    title: shortStr.optional(),
    paragraphs: arr(textStr, L.items),
    html: htmlStr.optional(),
  }),
  image: z.object({
    ...idField,
    type: z.literal('image'),
    src: urlStr,
    alt: shortStr,
    caption: textStr.optional(),
  }),
  video: z.object({ ...idField, type: z.literal('video'), url: urlStr, caption: textStr.optional() }),
  audio: z.object({ ...idField, type: z.literal('audio'), url: urlStr, caption: textStr.optional() }),
  file: z.object({
    ...idField,
    type: z.literal('file'),
    url: urlStr,
    name: shortStr.optional(),
    caption: textStr.optional(),
  }),
  heading: z.object({
    ...idField,
    type: z.literal('heading'),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    html: htmlStr,
  }),
  quote: z.object({ ...idField, type: z.literal('quote'), html: htmlStr }),
  code: z.object({ ...idField, type: z.literal('code'), language: str(64).optional(), code: str(L.long) }),
  'bullet-list': z.object({
    ...idField,
    type: z.literal('bullet-list'),
    items: arr(strictListItem(L.listDepth), L.listItems),
  }),
  'numbered-list': z.object({
    ...idField,
    type: z.literal('numbered-list'),
    items: arr(strictListItem(L.listDepth), L.listItems),
  }),
  'check-list': z.object({
    ...idField,
    type: z.literal('check-list'),
    items: arr(strictCheckItem(L.listDepth), L.listItems),
  }),
  table: z.object({
    ...idField,
    type: z.literal('table'),
    rows: arr(arr(htmlStr, L.tableCols), L.tableRows),
    headerRow: z.boolean().optional(),
  }),
  toggle: z.object({
    ...idField,
    type: z.literal('toggle'),
    html: htmlStr,
    children: arr(z.looseObject({ type: z.string() }), L.blocksPerLesson),
  }),
  'step-break': z.object({ ...idField, type: z.literal('step-break'), label: shortStr.optional() }),

  // --- Tepup widgets ---
  callout: z.object({
    ...idField,
    type: z.literal('callout'),
    icon: str(L.icon).optional(),
    title: shortStr.optional(),
    text: textStr,
    variant: z.enum(['info', 'warning', 'success']).optional(),
  }),
  question: z.object({
    ...idField,
    type: z.literal('question'),
    question: textStr,
    mode: z.enum(['single', 'multiple']).optional(),
    options: arr(choiceOption, L.options),
    explanation: textStr.optional(),
  }),
  'library-document': z.object({
    ...idField,
    type: z.literal('library-document'),
    mode: z.enum(['reference', 'inline']).optional(),
    documentId: str(L.id).optional(),
    documentSlug: shortStr.optional(),
    title: shortStr.optional(),
    description: textStr.optional(),
    category: shortStr.optional(),
    estimatedReadTime: str(64).optional(),
    documentContent: z
      .object({
        sections: arr(z.object({ heading: shortStr.optional(), paragraphs: arr(textStr, L.items) }), L.items),
        relatedConcepts: arr(shortStr, L.items).optional(),
        furtherReading: arr(textStr, L.items).optional(),
      })
      .optional(),
  }),
  calculator: z.object({
    ...idField,
    type: z.literal('calculator'),
    title: shortStr.optional(),
    description: textStr.optional(),
    calculatorType: z.enum(['tax', 'compound-interest', 'inflation', 'custom']),
    inputs: arr(
      z.object({
        id: varId,
        label: shortStr,
        type: z.enum(['number', 'select']),
        unit: unitStr.optional(),
        defaultValue: num,
        min: num.optional(),
        max: num.optional(),
        step: num.optional(),
        options: arr(z.object({ value: num, label: shortStr }), L.items).optional(),
      }),
      L.options,
    ),
    formula: formulaStr.optional(),
    outputs: arr(
      z.object({
        id: str(L.id),
        label: shortStr,
        unit: unitStr.optional(),
        formula: formulaStr,
        highlight: z.boolean().optional(),
      }),
      L.options,
    ),
    presets: arr(z.object({ label: shortStr, values: z.record(varId, num) }), L.options).optional(),
    insight: textStr.optional(),
  }),
  'slider-simulator': z.object({
    ...idField,
    type: z.literal('slider-simulator'),
    title: shortStr.optional(),
    description: textStr.optional(),
    sliders: arr(
      z.object({
        id: varId,
        label: shortStr,
        min: num,
        max: num,
        step: num,
        defaultValue: num,
        unit: unitStr.optional(),
      }),
      L.options,
    ),
    outputs: arr(
      z.object({
        id: str(L.id),
        label: shortStr,
        formula: formulaStr,
        unit: unitStr.optional(),
        format: z.enum(['number', 'percent', 'currency']).optional(),
      }),
      L.options,
    ),
    chart: z
      .object({
        type: z.literal('bar'),
        bars: arr(
          z.object({
            label: shortStr,
            formula: formulaStr,
            // Rendered into className/style: a Tailwind bg token or a hex colour only.
            color: z
              .string()
              .regex(/^(?:bg-[a-z]+-\d{2,3}|#[0-9a-fA-F]{3,8})$/, 'màu không hợp lệ / invalid colour')
              .optional(),
          }),
          L.options,
        ),
      })
      .optional(),
    breakpoints: arr(
      z.object({ condition: formulaStr, message: textStr, variant: z.enum(['info', 'warning', 'success']) }),
      L.options,
    ).optional(),
  }),
  'budget-allocator': z.object({
    ...idField,
    type: z.literal('budget-allocator'),
    title: shortStr.optional(),
    description: textStr.optional(),
    totalBudget: num,
    unit: unitStr.optional(),
    categories: arr(
      z.object({
        id: varId,
        label: shortStr,
        icon: str(L.icon).optional(),
        color: str(32),
        defaultValue: num,
        minValue: num.optional(),
        description: textStr.optional(),
      }),
      L.options,
    ),
    outcomes: arr(
      z.object({
        condition: formulaStr,
        title: shortStr,
        description: textStr,
        variant: z.enum(['good', 'neutral', 'bad']),
      }),
      L.options,
    ),
    comparison: z.object({ label: shortStr, values: z.record(varId, num) }).optional(),
  }),
  'bias-detector': z.object({
    ...idField,
    type: z.literal('bias-detector'),
    title: shortStr.optional(),
    instruction: textStr,
    article: z.object({ text: str(L.long), source: shortStr.optional() }),
    segments: arr(
      z.object({
        id: str(L.id),
        text: textStr,
        startIndex: z.number().int().min(0),
        biasType: str(L.id),
        explanation: textStr,
      }),
      L.items,
    ),
    biasOptions: arr(z.object({ id: str(L.id), label: shortStr }), L.options),
  }),
  'perspective-switch': z.object({
    ...idField,
    type: z.literal('perspective-switch'),
    title: shortStr.optional(),
    event: textStr,
    perspectives: arr(
      z.object({ id: str(L.id), role: shortStr, icon: str(L.icon).optional(), narrative: str(L.long) }),
      L.options,
    ),
    question: z
      .object({ text: textStr, options: arr(choiceOption, L.options), explanation: textStr })
      .optional(),
  }),
  'hot-cold-guess': z.object({
    ...idField,
    type: z.literal('hot-cold-guess'),
    title: shortStr.optional(),
    question: textStr,
    answer: num,
    unit: unitStr,
    tolerance: num,
    hints: arr(textStr, L.options),
    context: textStr.optional(),
  }),
  'pair-match': z.object({
    ...idField,
    type: z.literal('pair-match'),
    title: shortStr.optional(),
    instruction: textStr.optional(),
    pairs: arr(
      z.object({
        id: str(L.id),
        left: str(PAIR_MATCH_LIMITS.left * 4),
        right: str(PAIR_MATCH_LIMITS.right * 4),
      }),
      L.options,
    ),
  }),
  'flip-card': z.object({
    ...idField,
    type: z.literal('flip-card'),
    title: shortStr.optional(),
    instruction: textStr.optional(),
    cards: arr(z.object({ id: str(L.id), front: flipFace, back: flipFace }), L.options),
  }),
  'sort-bucket': z.object({
    ...idField,
    type: z.literal('sort-bucket'),
    title: shortStr.optional(),
    instruction: textStr.optional(),
    buckets: arr(z.object({ id: str(L.id), label: shortStr }), L.options),
    items: arr(z.object({ id: str(L.id), text: textStr, bucketId: str(L.id) }), L.items),
  }),
} as const;

export type StrictBlockType = keyof typeof STRICT_BLOCK_SCHEMAS;

export function isStrictBlockType(type: unknown): type is StrictBlockType {
  return typeof type === 'string' && Object.prototype.hasOwnProperty.call(STRICT_BLOCK_SCHEMAS, type);
}

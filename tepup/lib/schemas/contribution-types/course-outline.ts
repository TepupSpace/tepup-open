import { z } from 'zod';
import type { ContentResult, ContentIssue } from '@/lib/schemas/content-validation';
import { CONTENT_LIMITS } from '@/lib/schemas/blocks';
import type { CourseOutline } from '@/lib/types/outline';

/**
 * EDIT_COURSE data: a proposed course outline (proposal §6.7, §12). Pure module (client + server).
 *
 * ```
 * {
 *   course:  { name, description },
 *   levels:  [{ id | null, tempKey, name }],                // array order = level order
 *   lessons: [{ id | null, tempKey, name, levelRef }],      // array order = order within each level
 * }
 * ```
 *
 * - `id: null` marks an inserted level/lesson. Inserted lessons are created HIDDEN with no
 *   content (there is deliberately no content field: the schema strips anything else); they
 *   are filled later by ordinary EDIT_LESSON_CONTENT proposals.
 * - `tempKey` is a client key, unique among levels and among lessons. For existing rows the
 *   editor uses the id itself.
 * - `levelRef` points at a level of the proposal: an existing level's `id`, or an inserted
 *   level's `tempKey`.
 * - Nothing can be deleted in this round: every existing level and lesson of the course must
 *   appear exactly once. That (and "no unknown ids") needs the live outline, so it is checked
 *   by `checkOutlineAgainstLive` when the proposal starts and again at publish.
 * - Slugs are never part of the data: inserted lessons get a server-derived slug, and a
 *   rename keeps the existing slug, so links keep working.
 */

export const OUTLINE_LIMITS = {
  name: 200,
  levels: 100,
  lessons: 1_000,
  key: 100,
} as const;

const requiredName = z
  .string()
  .trim()
  .min(1, 'Không được để trống / required')
  .max(OUTLINE_LIMITS.name, `Tối đa ${OUTLINE_LIMITS.name} ký tự / too long`);
const id = z.string().min(1).max(CONTENT_LIMITS.id);
const key = z.string().min(1).max(OUTLINE_LIMITS.key);

const outlineProposalSchema = z.object({
  course: z.object({
    name: requiredName,
    description: z.string().trim().max(CONTENT_LIMITS.text).optional().default(''),
  }),
  levels: z
    .array(z.object({ id: id.nullable(), tempKey: key, name: requiredName }))
    .min(1, 'Khóa học cần ít nhất một cấp độ')
    .max(OUTLINE_LIMITS.levels),
  lessons: z
    .array(z.object({ id: id.nullable(), tempKey: key, name: requiredName, levelRef: key }))
    .max(OUTLINE_LIMITS.lessons),
});

export type CourseOutlineProposal = z.infer<typeof outlineProposalSchema>;
export type OutlineProposalLevel = CourseOutlineProposal['levels'][number];
export type OutlineProposalLesson = CourseOutlineProposal['lessons'][number];

function zodPath(path: PropertyKey[]): string {
  return path.reduce<string>((acc, p) => (typeof p === 'number' ? `${acc}[${p}]` : `${acc}.${String(p)}`), 'data');
}

/** Level key a lesson's levelRef resolves against: id for existing levels, tempKey for new ones. */
export function levelKey(l: OutlineProposalLevel): string {
  return l.id ?? l.tempKey;
}

/**
 * Shape check (no database): names, sizes, unique ids/keys, every levelRef resolves.
 * Used for saves, submit and (via validateContributionData) at publish.
 */
export function validateCourseOutlineProposal(data: unknown): ContentResult<CourseOutlineProposal> {
  const parsed = outlineProposalSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.slice(0, 50).map((i) => ({ path: zodPath(i.path), message: i.message })),
    };
  }
  const value = parsed.data;
  const issues: ContentIssue[] = [];

  const levelIds = new Set<string>();
  const levelKeys = new Set<string>();
  const refs = new Set<string>();
  value.levels.forEach((l, i) => {
    if (levelKeys.has(l.tempKey)) issues.push({ path: `data.levels[${i}].tempKey`, message: 'Trùng khóa / duplicate key' });
    levelKeys.add(l.tempKey);
    if (l.id) {
      if (levelIds.has(l.id)) issues.push({ path: `data.levels[${i}].id`, message: 'Cấp độ xuất hiện hai lần / duplicate level' });
      levelIds.add(l.id);
    }
    const ref = levelKey(l);
    if (refs.has(ref)) issues.push({ path: `data.levels[${i}]`, message: 'Trùng khóa / duplicate key' });
    refs.add(ref);
  });

  const lessonIds = new Set<string>();
  const lessonKeys = new Set<string>();
  value.lessons.forEach((l, i) => {
    if (lessonKeys.has(l.tempKey)) issues.push({ path: `data.lessons[${i}].tempKey`, message: 'Trùng khóa / duplicate key' });
    lessonKeys.add(l.tempKey);
    if (l.id) {
      if (lessonIds.has(l.id)) issues.push({ path: `data.lessons[${i}].id`, message: 'Bài học xuất hiện hai lần / duplicate lesson' });
      lessonIds.add(l.id);
    }
    if (!refs.has(l.levelRef)) {
      issues.push({ path: `data.lessons[${i}].levelRef`, message: 'Cấp độ không tồn tại / unknown level' });
    }
  });

  return issues.length ? { ok: false, issues: issues.slice(0, 50) } : { ok: true, value };
}

/**
 * Checks a (shape-valid) proposal against the course's live outline: every existing level and
 * lesson appears exactly once (no deletions this round) and no id is unknown (e.g. a lesson
 * of another course). Returns the issues; empty = fine.
 */
export function checkOutlineAgainstLive(p: CourseOutlineProposal, live: CourseOutline): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const liveLevels = new Set(live.levels.map((l) => l.id));
  const liveLessons = new Set(live.lessons.map((l) => l.id));
  const seenLevels = new Set<string>();
  const seenLessons = new Set<string>();

  p.levels.forEach((l, i) => {
    if (!l.id) return;
    if (!liveLevels.has(l.id)) issues.push({ path: `data.levels[${i}].id`, message: 'Cấp độ không thuộc khóa này / unknown level' });
    seenLevels.add(l.id);
  });
  p.lessons.forEach((l, i) => {
    if (!l.id) return;
    if (!liveLessons.has(l.id)) issues.push({ path: `data.lessons[${i}].id`, message: 'Bài học không thuộc khóa này / unknown lesson' });
    seenLessons.add(l.id);
  });
  const missingLevels = live.levels.filter((l) => !seenLevels.has(l.id)).length;
  const missingLessons = live.lessons.filter((l) => !seenLessons.has(l.id)).length;
  if (missingLevels) {
    issues.push({ path: 'data.levels', message: `Thiếu ${missingLevels} cấp độ: đề xuất không được xóa cấp độ` });
  }
  if (missingLessons) {
    issues.push({ path: 'data.lessons', message: `Thiếu ${missingLessons} bài học: đề xuất không được xóa bài học` });
  }
  return issues;
}

/** The live outline as proposal data (the starting point of a new EDIT_COURSE proposal). */
export function outlineToProposal(o: CourseOutline): CourseOutlineProposal {
  return {
    course: { name: o.course.name, description: o.course.description ?? '' },
    levels: o.levels.map((l) => ({ id: l.id, tempKey: l.id, name: l.name })),
    // Grouped by level in level order, so the array order is the order within each level.
    lessons: o.levels.flatMap((lv) =>
      o.lessons
        .filter((l) => l.levelId === lv.id)
        .map((l) => ({ id: l.id, tempKey: l.id, name: l.name, levelRef: lv.id }))
    ),
  };
}

/** A human-readable list of what the proposal changes compared with `base` (editor, review). */
export function describeOutlineChanges(p: CourseOutlineProposal, base: CourseOutline): string[] {
  const out: string[] = [];
  if (p.course.name.trim() !== base.course.name) out.push(`Đổi tên khóa thành «${p.course.name.trim()}»`);
  if ((p.course.description ?? '').trim() !== (base.course.description ?? '').trim()) out.push('Sửa mô tả khóa học');

  const baseLevel = new Map(base.levels.map((l) => [l.id, l]));
  const levelName = new Map(p.levels.map((l) => [levelKey(l), l.name.trim()]));
  for (const l of p.levels) {
    if (!l.id) out.push(`Thêm cấp độ «${l.name.trim()}»`);
    else {
      const b = baseLevel.get(l.id);
      if (b && b.name !== l.name.trim()) out.push(`Đổi tên cấp độ «${b.name}» thành «${l.name.trim()}»`);
    }
  }
  const existingLevelOrder = p.levels.filter((l) => l.id).map((l) => l.id);
  if (existingLevelOrder.join('|') !== base.levels.map((l) => l.id).filter((id) => existingLevelOrder.includes(id)).join('|')) {
    out.push('Đổi thứ tự cấp độ');
  }

  const baseLesson = new Map(base.lessons.map((l) => [l.id, l]));
  const reordered = new Set<string>();
  for (const l of p.lessons) {
    if (!l.id) {
      out.push(`Thêm bài «${l.name.trim()}» vào «${levelName.get(l.levelRef) ?? '?'}» (ẩn, chưa có nội dung)`);
      continue;
    }
    const b = baseLesson.get(l.id);
    if (!b) continue;
    if (b.name !== l.name.trim()) out.push(`Đổi tên bài «${b.name}» thành «${l.name.trim()}»`);
    if (b.levelId !== l.levelRef) out.push(`Chuyển bài «${l.name.trim()}» sang «${levelName.get(l.levelRef) ?? '?'}»`);
  }
  // Order within each level, among the existing lessons that stayed in it.
  for (const lv of p.levels) {
    if (!lv.id) continue;
    const now = p.lessons.filter((l) => l.id && l.levelRef === lv.id && baseLesson.get(l.id)?.levelId === lv.id).map((l) => l.id);
    const before = base.lessons.filter((l) => l.levelId === lv.id && now.includes(l.id)).map((l) => l.id);
    if (now.join('|') !== before.join('|')) reordered.add(lv.id);
  }
  for (const id of reordered) out.push(`Đổi thứ tự bài trong «${levelName.get(id) ?? '?'}»`);
  return out;
}

/**
 * The outline the proposal would produce, as a CourseOutline (e.g. for OutlineDiff in the
 * review screens). Inserted levels/lessons get their tempKey as id and `isActive: false`;
 * visibility of existing lessons comes from `base`. sortOrder = 1-based position (per level
 * for lessons), as the publisher writes it.
 */
export function proposalToOutline(p: CourseOutlineProposal, base: CourseOutline | null): CourseOutline {
  const baseLesson = new Map((base?.lessons ?? []).map((l) => [l.id, l]));
  const pos = new Map<string, number>();
  return {
    course: { name: p.course.name.trim(), description: p.course.description.trim() || null },
    levels: p.levels.map((l, i) => ({ id: levelKey(l), name: l.name.trim(), sortOrder: i + 1 })),
    lessons: p.lessons.map((l) => {
      const n = (pos.get(l.levelRef) ?? 0) + 1;
      pos.set(l.levelRef, n);
      return {
        id: l.id ?? l.tempKey,
        name: l.name.trim(),
        levelId: l.levelRef,
        sortOrder: n,
        isActive: l.id ? (baseLesson.get(l.id)?.isActive ?? true) : false,
      };
    }),
  };
}

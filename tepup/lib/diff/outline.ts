import type { CourseOutline } from '@/lib/types/outline';
import { align } from './lcs';
import { wordDiff, type Segment } from './text';

/**
 * Diff of two course outlines (proposal §12): course name/description, and levels and
 * lessons inserted, removed, renamed, moved to another level, reordered, shown or hidden.
 *
 * "Reordered" compares the relative order of the items present on both sides (LCS), so
 * renumbering sortOrder (1-based → 0-based, as the reorder route does) is not a change.
 */

export type OutlineChange =
  | { kind: 'course-renamed'; from: string; to: string; words: Segment[] }
  | { kind: 'course-description'; from: string; to: string; words: Segment[] }
  | { kind: 'level-inserted'; id: string; name: string }
  | { kind: 'level-removed'; id: string; name: string }
  | { kind: 'level-renamed'; id: string; from: string; to: string }
  | { kind: 'level-reordered'; id: string; name: string; fromPos: number; toPos: number }
  | { kind: 'lesson-inserted'; id: string; name: string; levelName: string; isActive: boolean }
  | { kind: 'lesson-removed'; id: string; name: string; levelName: string }
  | { kind: 'lesson-renamed'; id: string; from: string; to: string; levelName: string }
  | { kind: 'lesson-moved'; id: string; name: string; fromLevel: string; toLevel: string }
  | { kind: 'lesson-reordered'; id: string; name: string; levelName: string; fromPos: number; toPos: number }
  | { kind: 'lesson-shown'; id: string; name: string; levelName: string }
  | { kind: 'lesson-hidden'; id: string; name: string; levelName: string };

export interface OutlineDiffResult {
  changes: OutlineChange[];
  summary: {
    course: number;
    levels: number;
    lessons: number;
  };
}

type Lvl = CourseOutline['levels'][number];
type Les = CourseOutline['lessons'][number];

const byOrder = <T extends { sortOrder: number }>(list: readonly T[]) =>
  list.map((x, i) => ({ x, i })).sort((p, q) => p.x.sortOrder - q.x.sortOrder || p.i - q.i).map((p) => p.x);

/** Accepts anything and returns a well-formed outline (old/malformed snapshots). */
export function normalizeOutline(v: unknown): CourseOutline {
  const o = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  const c = o.course && typeof o.course === 'object' ? (o.course as Record<string, unknown>) : {};
  const arr = (x: unknown) => (Array.isArray(x) ? x.filter((i) => i && typeof i === 'object') : []) as Record<string, unknown>[];
  return {
    course: { name: String(c.name ?? ''), description: typeof c.description === 'string' ? c.description : null },
    levels: arr(o.levels).map((l) => ({ id: String(l.id), name: String(l.name ?? ''), sortOrder: Number(l.sortOrder) || 0 })),
    lessons: arr(o.lessons).map((l) => ({
      id: String(l.id),
      name: String(l.name ?? ''),
      levelId: String(l.levelId ?? ''),
      sortOrder: Number(l.sortOrder) || 0,
      isActive: l.isActive !== false,
    })),
  };
}

/** Ids (in `after` order) whose relative order differs between the two lists. */
function reorderedIds(beforeIds: string[], afterIds: string[]): Set<string> {
  const common = new Set(beforeIds.filter((id) => afterIds.includes(id)));
  const a = beforeIds.filter((id) => common.has(id));
  const b = afterIds.filter((id) => common.has(id));
  const { ops } = align(a, b, 2000 * 2000);
  const moved = new Set<string>();
  for (const o of ops) if (o.op === 'ins') moved.add(b[o.b]);
  return moved;
}

export function diffOutline(beforeRaw: unknown | null, afterRaw: unknown): OutlineDiffResult {
  const after = normalizeOutline(afterRaw);
  const before = beforeRaw == null ? null : normalizeOutline(beforeRaw);
  const changes: OutlineChange[] = [];
  const summary = { course: 0, levels: 0, lessons: 0 };

  if (!before) {
    // First version: everything is new.
    const levelName = new Map(after.levels.map((l) => [l.id, l.name]));
    for (const l of byOrder(after.levels)) changes.push({ kind: 'level-inserted', id: l.id, name: l.name });
    for (const l of byOrder(after.lessons))
      changes.push({ kind: 'lesson-inserted', id: l.id, name: l.name, levelName: levelName.get(l.levelId) ?? '', isActive: l.isActive });
    summary.levels = after.levels.length;
    summary.lessons = after.lessons.length;
    return { changes, summary };
  }

  if (before.course.name !== after.course.name) {
    changes.push({ kind: 'course-renamed', from: before.course.name, to: after.course.name, words: wordDiff(before.course.name, after.course.name) });
    summary.course++;
  }
  const da = before.course.description ?? '';
  const db = after.course.description ?? '';
  if (da !== db) {
    changes.push({ kind: 'course-description', from: da, to: db, words: wordDiff(da, db) });
    summary.course++;
  }

  // Levels
  const levelsA = byOrder(before.levels);
  const levelsB = byOrder(after.levels);
  const levelA = new Map<string, Lvl>(levelsA.map((l) => [l.id, l]));
  const levelB = new Map<string, Lvl>(levelsB.map((l) => [l.id, l]));
  const levelReordered = reorderedIds(levelsA.map((l) => l.id), levelsB.map((l) => l.id));
  levelsB.forEach((l, pos) => {
    const old = levelA.get(l.id);
    if (!old) {
      changes.push({ kind: 'level-inserted', id: l.id, name: l.name });
      summary.levels++;
      return;
    }
    if (old.name !== l.name) {
      changes.push({ kind: 'level-renamed', id: l.id, from: old.name, to: l.name });
      summary.levels++;
    }
    if (levelReordered.has(l.id)) {
      changes.push({ kind: 'level-reordered', id: l.id, name: l.name, fromPos: levelsA.indexOf(old) + 1, toPos: pos + 1 });
      summary.levels++;
    }
  });
  for (const l of levelsA) {
    if (!levelB.has(l.id)) {
      changes.push({ kind: 'level-removed', id: l.id, name: l.name });
      summary.levels++;
    }
  }

  // Lessons
  const levelNameB = (id: string) => levelB.get(id)?.name ?? levelA.get(id)?.name ?? '';
  const levelNameA = (id: string) => levelA.get(id)?.name ?? levelB.get(id)?.name ?? '';
  const lessonA = new Map<string, Les>(before.lessons.map((l) => [l.id, l]));
  const lessonB = new Set(after.lessons.map((l) => l.id));
  const inLevel = (list: Les[], levelId: string) => byOrder(list.filter((l) => l.levelId === levelId));

  for (const lvl of levelsB.concat(levelsA.filter((l) => !levelB.has(l.id)))) {
    const listB = inLevel(after.lessons, lvl.id);
    // Lessons that were in this same level before (moved ones are reported as moved).
    const stayed = (id: string) => lessonA.get(id)?.levelId === lvl.id;
    const reordered = reorderedIds(
      inLevel(before.lessons, lvl.id).map((l) => l.id).filter((id) => lessonB.has(id)),
      listB.map((l) => l.id).filter(stayed),
    );
    const posA = new Map(inLevel(before.lessons, lvl.id).map((l, i) => [l.id, i + 1]));
    listB.forEach((l, i) => {
      const old = lessonA.get(l.id);
      const levelName = lvl.name;
      if (!old) {
        changes.push({ kind: 'lesson-inserted', id: l.id, name: l.name, levelName, isActive: l.isActive });
        summary.lessons++;
        return;
      }
      if (old.name !== l.name) {
        changes.push({ kind: 'lesson-renamed', id: l.id, from: old.name, to: l.name, levelName });
        summary.lessons++;
      }
      if (old.levelId !== l.levelId) {
        changes.push({ kind: 'lesson-moved', id: l.id, name: l.name, fromLevel: levelNameA(old.levelId), toLevel: levelNameB(l.levelId) });
        summary.lessons++;
      } else if (reordered.has(l.id)) {
        changes.push({ kind: 'lesson-reordered', id: l.id, name: l.name, levelName, fromPos: posA.get(l.id) ?? 0, toPos: i + 1 });
        summary.lessons++;
      }
      if (old.isActive !== l.isActive) {
        changes.push({ kind: l.isActive ? 'lesson-shown' : 'lesson-hidden', id: l.id, name: l.name, levelName });
        summary.lessons++;
      }
    });
  }
  // Lessons whose level is in neither outline (corrupt data) still count.
  const placed = new Set([...levelA.keys(), ...levelB.keys()]);
  for (const l of after.lessons) {
    if (!placed.has(l.levelId) && !lessonA.has(l.id)) {
      changes.push({ kind: 'lesson-inserted', id: l.id, name: l.name, levelName: '', isActive: l.isActive });
      summary.lessons++;
    }
  }
  for (const l of before.lessons) {
    if (!lessonB.has(l.id)) {
      changes.push({ kind: 'lesson-removed', id: l.id, name: l.name, levelName: levelNameA(l.levelId) });
      summary.lessons++;
    }
  }
  return { changes, summary };
}

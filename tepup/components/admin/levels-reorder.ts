/**
 * Pure ordering maths for the admin Levels & Bài học tree.
 *
 * Kept out of the page component so the fiddly index arithmetic (which shifts once
 * you remove the dragged item before re-inserting it) can be reasoned about — and
 * tested — on its own. Every function returns a NEW array; nothing is mutated.
 */

export interface ReorderLesson {
  id: string;
}

export interface ReorderLevel<L extends ReorderLesson = ReorderLesson> {
  id: string;
  lessons: L[];
}

/** Where a dragged row is about to land. */
export type DropTarget =
  /** Next to another level (level drags only). */
  | { kind: 'level'; levelId: string; before: boolean }
  /** Next to a specific lesson, possibly in a different level. */
  | { kind: 'lesson'; levelId: string; lessonId: string; before: boolean }
  /** Onto a level's header or its empty body — append to the end of that level. */
  | { kind: 'level-body'; levelId: string };

/** Insert `item` into `list` at `index`, clamped to the list's bounds. */
function insertAt<T>(list: T[], index: number, item: T): T[] {
  const next = [...list];
  next.splice(Math.max(0, Math.min(index, next.length)), 0, item);
  return next;
}

/**
 * Reorder levels. Returns the original array unchanged when the move is a no-op,
 * so callers can skip the network round-trip with a `===` check.
 */
export function moveLevel<L extends ReorderLevel>(
  levels: L[],
  draggedId: string,
  targetId: string,
  before: boolean
): L[] {
  if (draggedId === targetId) return levels;

  const from = levels.findIndex((l) => l.id === draggedId);
  if (from === -1) return levels;

  const without = levels.filter((l) => l.id !== draggedId);
  const targetIdx = without.findIndex((l) => l.id === targetId);
  if (targetIdx === -1) return levels;

  const insertIdx = before ? targetIdx : targetIdx + 1;
  if (insertIdx === from) return levels;

  return insertAt(without, insertIdx, levels[from]);
}

/**
 * Move a lesson within its level, or across levels. `target` decides the landing
 * spot; dropping a lesson right back where it was returns the input untouched.
 */
export function moveLesson<L extends ReorderLevel>(
  levels: L[],
  draggedId: string,
  target: DropTarget
): L[] {
  if (target.kind === 'level') return levels;
  if (target.kind === 'lesson' && target.lessonId === draggedId) return levels;

  const sourceLevel = levels.find((l) => l.lessons.some((x) => x.id === draggedId));
  if (!sourceLevel) return levels;
  const lesson = sourceLevel.lessons.find((x) => x.id === draggedId)!;

  const destLevelId = target.levelId;
  const destLevel = levels.find((l) => l.id === destLevelId);
  if (!destLevel) return levels;

  // Strip the dragged lesson everywhere first, so the destination indexes below
  // are computed against the list the user will actually end up seeing.
  const stripped = levels.map((l) =>
    l.lessons.some((x) => x.id === draggedId)
      ? { ...l, lessons: l.lessons.filter((x) => x.id !== draggedId) }
      : l
  ) as L[];

  const destAfterStrip = stripped.find((l) => l.id === destLevelId)!;

  let insertIdx: number;
  if (target.kind === 'level-body') {
    insertIdx = destAfterStrip.lessons.length;
  } else {
    const at = destAfterStrip.lessons.findIndex((x) => x.id === target.lessonId);
    if (at === -1) return levels;
    insertIdx = target.before ? at : at + 1;
  }

  // No-op check: same level, same resulting slot.
  if (sourceLevel.id === destLevelId) {
    const originalIdx = sourceLevel.lessons.findIndex((x) => x.id === draggedId);
    if (originalIdx === insertIdx) return levels;
  }

  return stripped.map((l) =>
    l.id === destLevelId ? ({ ...l, lessons: insertAt(l.lessons, insertIdx, lesson) } as L) : l
  );
}

/** The array-order-is-the-order payload the reorder endpoint expects. */
export function toReorderPayload<L extends ReorderLevel>(levels: L[]) {
  return { levels: levels.map((l) => ({ id: l.id, lessonIds: l.lessons.map((x) => x.id) })) };
}

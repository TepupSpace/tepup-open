'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { CourseOutline } from '@/lib/types/outline';
import InfoToggle from '@/components/ui/InfoToggle';
import {
  OUTLINE_LIMITS,
  describeOutlineChanges,
  levelKey,
  type CourseOutlineProposal,
  type OutlineProposalLesson,
  type OutlineProposalLevel,
} from '@/lib/schemas/contribution-types/course-outline';

/**
 * Editor for an EDIT_COURSE proposal (proposal §6.7): rename course/levels/lessons, reorder,
 * move lessons between levels, insert new (hidden, empty) lessons and levels. No deletions.
 * Keyboard-operable reordering (buttons, no drag).
 * `value` is the proposal's data (shape: lib/schemas/contribution-types/course-outline.ts),
 * `base` the outline the proposal started from. `Contribution.baseSnapshot` of an outline
 * proposal is `{ outline, hash }`; passing that object as `base` works too.
 */

const inputClass =
  'w-full rounded-lg border border-gray-500 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-700 aria-[invalid=true]:border-red-600';
const iconButton =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

function normalize(value: unknown): CourseOutlineProposal {
  const v = (value && typeof value === 'object' ? value : {}) as Partial<CourseOutlineProposal>;
  return {
    course: {
      name: typeof v.course?.name === 'string' ? v.course.name : '',
      description: typeof v.course?.description === 'string' ? v.course.description : '',
    },
    levels: Array.isArray(v.levels) ? v.levels : [],
    lessons: Array.isArray(v.lessons) ? v.lessons : [],
  };
}

function normalizeBase(base: unknown): CourseOutline | null {
  if (!base || typeof base !== 'object') return null;
  const b = base as { outline?: unknown; levels?: unknown };
  if (b.outline && typeof b.outline === 'object') return b.outline as CourseOutline;
  return Array.isArray(b.levels) ? (base as CourseOutline) : null;
}

let keySeq = 0;
function newKey(prefix: string) {
  keySeq += 1;
  return `new-${prefix}-${Date.now().toString(36)}-${keySeq}`;
}

export default function OutlineProposalEditor({
  value,
  base,
  onChange,
  readOnly = false,
}: {
  value: unknown;
  base: CourseOutline | null;
  onChange: (next: unknown) => void;
  /** Optional: show the outline without editing controls (e.g. a submitted proposal). */
  readOnly?: boolean;
}) {
  const uid = useId();
  const p = useMemo(() => normalize(value), [value]);
  const baseOutline = useMemo(() => normalizeBase(base), [base]);
  const [announcement, setAnnouncement] = useState('');
  /** Control to focus after the next render (set by an action, consumed by the effect). */
  const focusTarget = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Moving rows re-orders DOM nodes, which can drop focus: put it back on the control used.
  useEffect(() => {
    const key = focusTarget.current;
    if (!key) return;
    focusTarget.current = null;
    rootRef.current?.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(key)}"]`)?.focus();
  }, [p]);

  const baseLessons = useMemo(() => new Map((baseOutline?.lessons ?? []).map((l) => [l.id, l])), [baseOutline]);
  const changes = useMemo(() => (baseOutline ? describeOutlineChanges(p, baseOutline) : []), [p, baseOutline]);

  const emit = (next: CourseOutlineProposal, message?: string, focus?: string) => {
    onChange(next);
    if (message) setAnnouncement(message);
    if (focus) focusTarget.current = focus;
  };

  const levelName = (lv: OutlineProposalLevel, i: number) => lv.name.trim() || `Cấp độ ${i + 1}`;
  const lessonsOf = (lv: OutlineProposalLevel) => p.lessons.filter((l) => l.levelRef === levelKey(lv));

  // --- course ---
  const setCourse = (patch: Partial<CourseOutlineProposal['course']>) =>
    emit({ ...p, course: { ...p.course, ...patch } });

  // --- levels ---
  const renameLevel = (key: string, name: string) =>
    emit({ ...p, levels: p.levels.map((l) => (l.tempKey === key ? { ...l, name } : l)) });

  const moveLevel = (index: number, delta: -1 | 1, focusKey: string) => {
    const to = index + delta;
    if (to < 0 || to >= p.levels.length) return;
    const levels = [...p.levels];
    const [moved] = levels.splice(index, 1);
    levels.splice(to, 0, moved);
    emit({ ...p, levels }, `Đã chuyển cấp độ «${levelName(moved, to)}» tới vị trí ${to + 1}.`, focusKey);
  };

  const addLevel = () => {
    if (p.levels.length >= OUTLINE_LIMITS.levels) return;
    const tempKey = newKey('level');
    emit(
      { ...p, levels: [...p.levels, { id: null, tempKey, name: 'Cấp độ mới' }] },
      'Đã thêm cấp độ mới ở cuối khóa.',
      `${tempKey}:name`
    );
  };

  const removeNewLevel = (lv: OutlineProposalLevel, i: number) => {
    if (lv.id || lessonsOf(lv).length) return;
    const next = p.levels.filter((l) => l.tempKey !== lv.tempKey);
    const neighbour = next[Math.min(i, next.length - 1)];
    emit({ ...p, levels: next }, `Đã bỏ cấp độ mới «${levelName(lv, i)}».`, neighbour ? `${neighbour.tempKey}:name` : 'add-level');
  };

  // --- lessons ---
  const renameLesson = (key: string, name: string) =>
    emit({ ...p, lessons: p.lessons.map((l) => (l.tempKey === key ? { ...l, name } : l)) });

  /** Swap with the previous/next lesson of the same level (in the global array). */
  const moveLesson = (ls: OutlineProposalLesson, delta: -1 | 1, focusKey: string) => {
    const idx = p.lessons.findIndex((l) => l.tempKey === ls.tempKey);
    let j = idx + delta;
    while (j >= 0 && j < p.lessons.length && p.lessons[j].levelRef !== ls.levelRef) j += delta;
    if (j < 0 || j >= p.lessons.length) return;
    const lessons = [...p.lessons];
    [lessons[idx], lessons[j]] = [lessons[j], lessons[idx]];
    const pos = lessons.filter((l) => l.levelRef === ls.levelRef).findIndex((l) => l.tempKey === ls.tempKey) + 1;
    emit({ ...p, lessons }, `Đã chuyển bài «${ls.name.trim()}» tới vị trí ${pos}.`, focusKey);
  };

  /** Move to another level: the lesson goes to the end of that level. */
  const moveLessonToLevel = (ls: OutlineProposalLesson, ref: string) => {
    if (ref === ls.levelRef) return;
    const lessons = p.lessons.filter((l) => l.tempKey !== ls.tempKey);
    lessons.push({ ...ls, levelRef: ref });
    const li = p.levels.findIndex((l) => levelKey(l) === ref);
    const target = li >= 0 ? levelName(p.levels[li], li) : '';
    emit({ ...p, lessons }, `Đã chuyển bài «${ls.name.trim()}» sang cấp độ «${target}», ở cuối cấp độ.`, `${ls.tempKey}:level`);
  };

  const addLesson = (lv: OutlineProposalLevel) => {
    if (p.lessons.length >= OUTLINE_LIMITS.lessons) return;
    const tempKey = newKey('lesson');
    const ref = levelKey(lv);
    // Insert after the level's last lesson (array order = order within the level).
    let at = -1;
    p.lessons.forEach((l, i) => {
      if (l.levelRef === ref) at = i;
    });
    const lessons = [...p.lessons];
    lessons.splice(at + 1, 0, { id: null, tempKey, name: 'Bài mới', levelRef: ref });
    emit({ ...p, lessons }, 'Đã thêm bài mới ở cuối cấp độ. Bài mới sẽ được tạo ở trạng thái ẩn.', `${tempKey}:name`);
  };

  const removeNewLesson = (ls: OutlineProposalLesson) => {
    if (ls.id) return;
    emit({ ...p, lessons: p.lessons.filter((l) => l.tempKey !== ls.tempKey) }, `Đã bỏ bài mới «${ls.name.trim()}».`, `${ls.levelRef}:add`);
  };

  const ariaDisabled = (cond: boolean) => (cond ? { 'aria-disabled': true as const } : {});

  return (
    <div ref={rootRef} className="space-y-6">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {baseOutline && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
          <p className="font-medium">
            {changes.length === 0 ? 'Chưa có thay đổi nào so với mục lục gốc.' : `${changes.length} thay đổi so với mục lục gốc`}
          </p>
          {changes.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-teal-800 underline">Xem danh sách thay đổi</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <fieldset className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-gray-900">Khóa học</legend>
        <div>
          <label htmlFor={`${uid}-course-name`} className="mb-1 block text-sm font-medium text-gray-700">
            Tên khóa học
          </label>
          <input
            id={`${uid}-course-name`}
            className={inputClass}
            value={p.course.name}
            maxLength={OUTLINE_LIMITS.name}
            readOnly={readOnly}
            aria-invalid={!p.course.name.trim() || undefined}
            onChange={(e) => setCourse({ name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-course-desc`} className="mb-1 block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            id={`${uid}-course-desc`}
            className={`${inputClass} min-h-24`}
            value={p.course.description}
            maxLength={5_000}
            readOnly={readOnly}
            onChange={(e) => setCourse({ description: e.target.value })}
          />
        </div>
      </fieldset>

      <ol className="space-y-4" aria-label="Các cấp độ">
        {p.levels.map((lv, li) => {
          const lessons = lessonsOf(lv);
          const lvName = levelName(lv, li);
          const nameId = `${uid}-${lv.tempKey}-name`;
          return (
            <li key={lv.tempKey} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-48 flex-1">
                  <label htmlFor={nameId} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Cấp độ {li + 1}
                    {!lv.id && <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 normal-case text-teal-900">Cấp độ mới</span>}
                  </label>
                  <input
                    id={nameId}
                    data-focus-key={`${lv.tempKey}:name`}
                    className={inputClass}
                    value={lv.name}
                    maxLength={OUTLINE_LIMITS.name}
                    readOnly={readOnly}
                    aria-invalid={!lv.name.trim() || undefined}
                    onChange={(e) => renameLevel(lv.tempKey, e.target.value)}
                  />
                </div>
                {!readOnly && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className={iconButton}
                      data-focus-key={`${lv.tempKey}:up`}
                      aria-label={`Chuyển cấp độ «${lvName}» lên`}
                      title="Chuyển lên"
                      {...ariaDisabled(li === 0)}
                      onClick={() => moveLevel(li, -1, `${lv.tempKey}:up`)}
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={iconButton}
                      data-focus-key={`${lv.tempKey}:down`}
                      aria-label={`Chuyển cấp độ «${lvName}» xuống`}
                      title="Chuyển xuống"
                      {...ariaDisabled(li === p.levels.length - 1)}
                      onClick={() => moveLevel(li, 1, `${lv.tempKey}:down`)}
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {!lv.id && (
                      <button
                        type="button"
                        className={iconButton}
                        aria-label={`Bỏ cấp độ mới «${lvName}»`}
                        title={lessons.length ? 'Chuyển hoặc bỏ các bài trong cấp độ trước' : 'Bỏ cấp độ mới'}
                        {...ariaDisabled(lessons.length > 0)}
                        onClick={() => removeNewLevel(lv, li)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {lessons.length === 0 ? (
                <p className="mt-3 text-sm text-gray-600">Cấp độ này chưa có bài nào.</p>
              ) : (
                <ol className="mt-3 space-y-2" aria-label={`Bài trong cấp độ «${lvName}»`}>
                  {lessons.map((ls, si) => {
                    const b = ls.id ? baseLessons.get(ls.id) : undefined;
                    const lsName = ls.name.trim() || `Bài ${si + 1}`;
                    const lessonNameId = `${uid}-${ls.tempKey}-name`;
                    const levelSelectId = `${uid}-${ls.tempKey}-level`;
                    return (
                      <li key={ls.tempKey} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex flex-wrap items-end gap-2">
                          <div className="min-w-48 flex-1">
                            <label htmlFor={lessonNameId} className="mb-1 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-700">
                              Bài {si + 1}
                              {!ls.id && (
                                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-900">
                                  Bài mới — sẽ được tạo ở trạng thái ẩn
                                </span>
                              )}
                              {b && !b.isActive && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">Đang ẩn</span>
                              )}
                            </label>
                            <input
                              id={lessonNameId}
                              data-focus-key={`${ls.tempKey}:name`}
                              className={inputClass}
                              value={ls.name}
                              maxLength={OUTLINE_LIMITS.name}
                              readOnly={readOnly}
                              aria-invalid={!ls.name.trim() || undefined}
                              onChange={(e) => renameLesson(ls.tempKey, e.target.value)}
                            />
                          </div>
                          {!readOnly && (
                            <>
                              <div>
                                <label htmlFor={levelSelectId} className="mb-1 block text-xs font-medium text-gray-700">
                                  Thuộc cấp độ
                                </label>
                                <select
                                  id={levelSelectId}
                                  data-focus-key={`${ls.tempKey}:level`}
                                  className={`${inputClass} w-auto`}
                                  value={ls.levelRef}
                                  onChange={(e) => moveLessonToLevel(ls, e.target.value)}
                                >
                                  {p.levels.map((o, oi) => (
                                    <option key={o.tempKey} value={levelKey(o)}>
                                      {oi + 1}. {levelName(o, oi)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  className={iconButton}
                                  data-focus-key={`${ls.tempKey}:up`}
                                  aria-label={`Chuyển bài «${lsName}» lên`}
                                  title="Chuyển lên"
                                  {...ariaDisabled(si === 0)}
                                  onClick={() => moveLesson(ls, -1, `${ls.tempKey}:up`)}
                                >
                                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  className={iconButton}
                                  data-focus-key={`${ls.tempKey}:down`}
                                  aria-label={`Chuyển bài «${lsName}» xuống`}
                                  title="Chuyển xuống"
                                  {...ariaDisabled(si === lessons.length - 1)}
                                  onClick={() => moveLesson(ls, 1, `${ls.tempKey}:down`)}
                                >
                                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                                </button>
                                {!ls.id && (
                                  <button
                                    type="button"
                                    className={iconButton}
                                    aria-label={`Bỏ bài mới «${lsName}»`}
                                    title="Bỏ bài mới"
                                    onClick={() => removeNewLesson(ls)}
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {!readOnly && (
                <button
                  type="button"
                  data-focus-key={`${levelKey(lv)}:add`}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-teal-800 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  onClick={() => addLesson(lv)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Thêm bài vào «{lvName}»
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {!readOnly && (
        <div className="space-y-2">
          <button
            type="button"
            data-focus-key="add-level"
            className="inline-flex items-center gap-2 rounded-xl border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            onClick={addLevel}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Thêm cấp độ
          </button>
          <InfoToggle label="Quy tắc sửa mục lục" storageKey="tepup:help-open:outline-proposal">
            <p className="text-sm text-gray-700">
              Bài mới được tạo ở trạng thái ẩn và chưa có nội dung; sau khi đề xuất được duyệt, bạn viết nội dung bằng một
              đề xuất sửa bài. Xóa bài hoặc cấp độ có sẵn chỉ quản trị viên làm được.
            </p>
          </InfoToggle>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from '@/components/ui/AppLink';
import {
  moveLevel,
  moveLesson,
  toReorderPayload,
  type DropTarget,
} from '@/components/admin/levels-reorder';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  BookOpen,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer, useFocusAfterRender } from '@/components/blocks/useAnnouncer';
import AdminDialog from '../../../../_components/AdminDialog';
import ConfirmDialog from '../../../../_components/ConfirmDialog';
import { BackLink, FormError } from '../../../../_components/form';

interface Lesson {
  id: string;
  name: string;
  sortOrder: number;
  _count: {
    exercises: number;
  };
}

interface Level {
  id: string;
  name: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  name: string;
  slug: string;
}

const dialogInputClass =
  'w-full px-4 py-3 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600';

/** Nút lên/xuống: lối thay thế cho kéo thả, dùng được bằng bàn phím (WCAG 2.1.1, 2.5.7). */
const moveButtonClass =
  'p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors aria-disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent';

export default function LevelsClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [message, announce] = useAnnouncer();
  const focusAfterRender = useFocusAfterRender();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Modal states
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    lesson: Lesson | null;
    levelId: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'level' | 'lesson';
    id: string;
    levelId?: string;
  } | null>(null);
  // Lỗi hiện ngay trong hộp thoại đang mở (hộp thoại che mất vùng lỗi của trang).
  const [dialogError, setDialogError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Drag & drop reorder. `handleArmed` gates `draggable` to the grip handle only —
  // without it the row's own links and buttons would start drags of their own.
  const [handleArmed, setHandleArmed] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ kind: 'level' | 'lesson'; id: string } | null>(null);
  const [dropHint, setDropHint] = useState<DropTarget | null>(null);

  // Form states
  const [levelName, setLevelName] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Disarm the grip on any mouse release — pressing a handle and letting go without
  // dragging would otherwise leave that row `draggable` for the next stray gesture.
  useEffect(() => {
    const disarm = () => setHandleArmed(null);
    document.addEventListener('mouseup', disarm);
    return () => document.removeEventListener('mouseup', disarm);
  }, []);

  async function fetchData() {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`);
      const data = await res.json();
      if (data.data) {
        setCourse({
          id: data.data.id,
          name: data.data.name,
          slug: data.data.slug,
        });
        setLevels(data.data.levels);
        // Expand all levels by default
        setExpandedLevels(new Set(data.data.levels.map((l: Level) => l.id)));
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  function toggleLevel(levelId: string) {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
  }

  // ---- Reorder (drag & drop, and the keyboard move buttons) -------------

  /**
   * Apply a new order optimistically and save it; roll back on failure.
   * `expandLevelId`: a lesson moved into a collapsed level would otherwise vanish from view.
   */
  async function commitOrder(next: Level[], expandLevelId?: string): Promise<boolean> {
    if (next === levels) return false; // dropped right back where it started

    const previous = levels;
    setLevels(next);
    if (expandLevelId) {
      setExpandedLevels((prev) => new Set(prev).add(expandLevelId));
    }

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toReorderPayload(next)),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Không lưu được thứ tự');
      }
      return true;
    } catch (err) {
      setLevels(previous); // roll the optimistic move back
      setError(err instanceof Error ? err.message : 'Không lưu được thứ tự');
      return false;
    }
  }

  function sameTarget(a: DropTarget | null, b: DropTarget | null) {
    if (a === b) return true;
    if (!a || !b || a.kind !== b.kind) return false;
    if (a.kind === 'level' && b.kind === 'level')
      return a.levelId === b.levelId && a.before === b.before;
    if (a.kind === 'lesson' && b.kind === 'lesson')
      return a.lessonId === b.lessonId && a.before === b.before;
    return a.levelId === b.levelId;
  }

  // dragover fires continuously; only re-render when the landing spot really moved.
  function setHint(t: DropTarget | null) {
    setDropHint((prev) => (sameTarget(prev, t) ? prev : t));
  }

  function beginDrag(e: React.DragEvent, kind: 'level' | 'lesson', id: string) {
    // dragstart bubbles: a lesson row's would otherwise reach its level container
    // and overwrite the drag with a level drag.
    e.stopPropagation();
    setDrag({ kind, id });
    e.dataTransfer.effectAllowed = 'move';
    // Firefox won't start a drag unless some payload is set.
    e.dataTransfer.setData('text/plain', id);
  }

  function endDrag() {
    setDrag(null);
    setDropHint(null);
    setHandleArmed(null);
  }

  /** Above or below the midpoint of the hovered row? */
  function isTopHalf(e: React.DragEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2;
  }

  function handleDragOverLevel(e: React.DragEvent, levelId: string) {
    if (!drag) return;
    e.preventDefault();
    setHint(
      drag.kind === 'level'
        ? { kind: 'level', levelId, before: isTopHalf(e) }
        : // anywhere in a level that isn't a lesson row => append to the end
          { kind: 'level-body', levelId }
    );
  }

  function handleDragOverLesson(e: React.DragEvent, levelId: string, lessonId: string) {
    if (drag?.kind !== 'lesson') return;
    e.preventDefault();
    e.stopPropagation();
    setHint({ kind: 'lesson', levelId, lessonId, before: isTopHalf(e) });
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    // A lesson row sits inside its level's container, and both bind onDrop. Without
    // this the parent would re-run the move on the same (not yet re-rendered) state
    // and fire a second identical PUT.
    e.stopPropagation();
    const dragged = drag;
    const target = dropHint;
    endDrag();
    if (!dragged || !target) return;

    const next =
      dragged.kind === 'level'
        ? target.kind === 'level'
          ? moveLevel(levels, dragged.id, target.levelId, target.before)
          : levels
        : moveLesson(levels, dragged.id, target);

    await commitOrder(next, target.kind !== 'level' ? target.levelId : undefined);
  }

  /** Move a level one place up or down (keyboard alternative to dragging). */
  async function moveLevelBy(levelId: string, dir: -1 | 1) {
    const idx = levels.findIndex((l) => l.id === levelId);
    const neighbour = levels[idx + dir];
    if (idx === -1 || !neighbour) return;
    const next = moveLevel(levels, levelId, neighbour.id, dir === -1);
    // Nút vừa bấm có thể bị gỡ rồi gắn lại khi hàng đổi chỗ: hẹn focus lại nó.
    focusAfterRender(() => document.getElementById(`move-${levelId}-${dir === -1 ? 'up' : 'down'}`));
    if (await commitOrder(next)) {
      announce(`Đã chuyển ${levels[idx].name} tới vị trí ${idx + dir + 1} trên ${levels.length}.`);
    }
  }

  /**
   * Move a lesson one place up or down. At the edge of its level it crosses into the
   * previous level (as its last lesson) or the next level (as its first lesson).
   */
  async function moveLessonBy(levelId: string, lessonId: string, dir: -1 | 1) {
    const li = levels.findIndex((l) => l.id === levelId);
    const level = levels[li];
    if (!level) return;
    const idx = level.lessons.findIndex((x) => x.id === lessonId);
    const lesson = level.lessons[idx];
    const neighbour = level.lessons[idx + dir];

    let target: DropTarget | null = null;
    if (neighbour) {
      target = { kind: 'lesson', levelId, lessonId: neighbour.id, before: dir === -1 };
    } else {
      const otherLevel = levels[li + dir];
      if (!otherLevel) return;
      target =
        dir === -1 || otherLevel.lessons.length === 0
          ? { kind: 'level-body', levelId: otherLevel.id }
          : { kind: 'lesson', levelId: otherLevel.id, lessonId: otherLevel.lessons[0].id, before: true };
    }

    const next = moveLesson(levels, lessonId, target);
    focusAfterRender(() => document.getElementById(`move-${lessonId}-${dir === -1 ? 'up' : 'down'}`));
    if (await commitOrder(next, target.levelId)) {
      const destLevel = next.find((l) => l.id === target.levelId);
      const pos = (destLevel?.lessons.findIndex((x) => x.id === lessonId) ?? 0) + 1;
      announce(
        `Đã chuyển ${lesson.name} tới vị trí ${pos} trên ${destLevel?.lessons.length ?? 0}` +
          (destLevel && destLevel.id !== levelId ? `, sang ${destLevel.name}.` : '.')
      );
    }
  }

  /** Blue insertion line / drop highlight for the row being hovered. */
  function levelHintClass(levelId: string) {
    if (dropHint?.kind === 'level' && dropHint.levelId === levelId) {
      return dropHint.before ? 'border-t-4 border-t-blue-600' : 'border-b-4 border-b-blue-600';
    }
    if (dropHint?.kind === 'level-body' && dropHint.levelId === levelId) {
      return 'ring-2 ring-inset ring-blue-600';
    }
    return '';
  }

  function lessonHintClass(lessonId: string) {
    if (dropHint?.kind !== 'lesson' || dropHint.lessonId !== lessonId) return '';
    return dropHint.before ? 'border-t-2 border-t-blue-600' : 'border-b-2 border-b-blue-600';
  }

  function closeLevelModal() {
    setShowLevelModal(false);
    setEditingLevel(null);
    setLevelName('');
    setDialogError('');
  }

  function closeLessonModal() {
    setShowLessonModal(false);
    setEditingLesson(null);
    setLessonName('');
    setDialogError('');
  }

  // Level CRUD
  async function handleSaveLevel() {
    if (saving) return;
    if (!levelName.trim()) {
      setDialogError('Nhập tên cấp độ.');
      return;
    }
    setSaving(true);
    setDialogError('');

    try {
      const url = editingLevel
        ? `/api/admin/courses/${courseId}/levels/${editingLevel.id}`
        : `/api/admin/courses/${courseId}/levels`;

      const res = await fetch(url, {
        method: editingLevel ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: levelName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDialogError(data.error || 'Không thể lưu cấp độ');
        return;
      }

      await fetchData();
      announce(editingLevel ? `Đã lưu cấp độ ${levelName}.` : `Đã thêm cấp độ ${levelName}.`);
      closeLevelModal();
    } catch (err) {
      console.error('Error saving level:', err);
      setDialogError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLevel(levelId: string) {
    const name = levels.find((l) => l.id === levelId)?.name ?? '';
    setDeleting(true);
    setDialogError('');
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/levels/${levelId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        setDialogError(data.error || 'Không thể xóa cấp độ');
        return;
      }

      await fetchData();
      setDeleteConfirm(null);
      announce(`Đã xóa cấp độ ${name}.`);
    } catch (err) {
      console.error('Error deleting level:', err);
      setDialogError('Đã xảy ra lỗi');
    } finally {
      setDeleting(false);
    }
  }

  // Lesson CRUD
  async function handleSaveLesson() {
    if (saving || !editingLesson) return;
    if (!lessonName.trim()) {
      setDialogError('Nhập tên bài học.');
      return;
    }
    setSaving(true);
    setDialogError('');

    try {
      const url = editingLesson.lesson
        ? `/api/admin/lessons/${editingLesson.lesson.id}`
        : `/api/admin/levels/${editingLesson.levelId}/lessons`;

      const res = await fetch(url, {
        method: editingLesson.lesson ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lessonName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDialogError(data.error || 'Không thể lưu bài học');
        return;
      }

      await fetchData();
      announce(editingLesson.lesson ? `Đã lưu bài học ${lessonName}.` : `Đã thêm bài học ${lessonName}.`);
      closeLessonModal();
    } catch (err) {
      console.error('Error saving lesson:', err);
      setDialogError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    const name = levels.flatMap((l) => l.lessons).find((x) => x.id === lessonId)?.name ?? '';
    setDeleting(true);
    setDialogError('');
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setDialogError(data.error || 'Không thể xóa bài học');
        return;
      }

      await fetchData();
      setDeleteConfirm(null);
      announce(`Đã xóa bài học ${name}.`);
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setDialogError('Đã xảy ra lỗi');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải cấp độ và bài học…" />
      </div>
    );
  }

  const deleteName =
    deleteConfirm?.type === 'level'
      ? levels.find((l) => l.id === deleteConfirm.id)?.name
      : levels.flatMap((l) => l.lessons).find((x) => x.id === deleteConfirm?.id)?.name;

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackLink href="/admin/courses" label="Quay lại danh sách khóa học" />
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">
              Quản lý cấp độ và bài học
            </h1>
            <p className="text-gray-600 mt-1">{course?.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingLevel(null);
            setLevelName('');
            setDialogError('');
            setShowLevelModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm cấp độ</span>
        </button>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Đổi thứ tự: kéo biểu tượng <GripVertical className="inline w-4 h-4 align-text-bottom" /> hoặc dùng
        các nút mũi tên lên/xuống. Bài học ở đầu hoặc cuối một cấp độ sẽ chuyển sang cấp độ liền kề.
      </p>

      {/* Error */}
      <div role="alert" className="empty:hidden mb-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
            <button
              type="button"
              onClick={() => {
                setError('');
                headingRef.current?.focus();
              }}
              className="ml-2 text-red-800 underline hover:no-underline"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Levels List */}
      <div className="space-y-4">
        {levels.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">
              Chưa có cấp độ nào. Hãy thêm cấp độ đầu tiên!
            </p>
          </div>
        ) : (
          levels.map((level, levelIndex) => {
            const expanded = expandedLevels.has(level.id);
            const listId = `level-${level.id}-lessons`;
            const firstLevel = levelIndex === 0;
            const lastLevel = levelIndex === levels.length - 1;
            return (
              // Kéo thả chỉ là tiện cho chuột; bàn phím dùng nút lên/xuống trong hàng.
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- vùng thả của kéo thả (chuột); lối bàn phím là các nút lên/xuống
              <section
                key={level.id}
                aria-labelledby={`level-${level.id}-name`}
                draggable={handleArmed === level.id}
                onDragStart={(e) => beginDrag(e, 'level', level.id)}
                onDragEnd={endDrag}
                onDragOver={(e) => handleDragOverLevel(e, level.id)}
                onDrop={handleDrop}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${levelHintClass(
                  level.id
                )} ${drag?.kind === 'level' && drag.id === level.id ? 'opacity-40' : ''}`}
              >
                {/* Level Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {/* Tay nắm kéo: chỉ cho chuột (ẩn với trình đọc màn hình); bàn phím dùng nút lên/xuống. */}
                    <span
                      onMouseDown={() => setHandleArmed(level.id)}
                      onMouseUp={() => setHandleArmed(null)}
                      title="Kéo để đổi thứ tự cấp độ"
                      aria-hidden="true"
                      className="text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-5 h-5" />
                    </span>
                    <h2 className="flex items-center gap-3">
                      {/* Tên cấp độ nằm trong nút mở/thu gọn (disclosure). */}
                      <button
                        type="button"
                        onClick={() => toggleLevel(level.id)}
                        aria-expanded={expanded}
                        aria-controls={listId}
                        className="flex items-center gap-2 p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {expanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                        <span id={`level-${level.id}-name`} className="font-medium text-gray-900">
                          {level.name}
                        </span>
                      </button>
                      <span className="text-sm font-normal text-gray-600">
                        ({level.lessons.length} bài học)
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`move-${level.id}-up`}
                      onClick={() => {
                        if (!firstLevel) void moveLevelBy(level.id, -1);
                      }}
                      aria-disabled={firstLevel || undefined}
                      aria-label={`Chuyển cấp độ ${level.name} lên`}
                      title="Chuyển lên"
                      className={moveButtonClass}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      id={`move-${level.id}-down`}
                      onClick={() => {
                        if (!lastLevel) void moveLevelBy(level.id, 1);
                      }}
                      aria-disabled={lastLevel || undefined}
                      aria-label={`Chuyển cấp độ ${level.name} xuống`}
                      title="Chuyển xuống"
                      className={moveButtonClass}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLesson({ lesson: null, levelId: level.id });
                        setLessonName('');
                        setDialogError('');
                        setShowLessonModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Thêm bài học"
                      aria-label={`Thêm bài học vào ${level.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLevel(level);
                        setLevelName(level.name);
                        setDialogError('');
                        setShowLevelModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Sửa cấp độ"
                      aria-label={`Sửa cấp độ ${level.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDialogError('');
                        setDeleteConfirm({ type: 'level', id: level.id });
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa cấp độ"
                      aria-label={`Xóa cấp độ ${level.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                {expanded && (
                  <div id={listId}>
                    {level.lessons.length === 0 ? (
                      <p className="px-6 py-8 text-center text-gray-500">
                        {drag?.kind === 'lesson'
                          ? 'Thả vào đây để chuyển bài học sang cấp độ này'
                          : 'Chưa có bài học nào trong cấp độ này'}
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {level.lessons.map((lesson, lessonIndex) => {
                          const cannotUp = firstLevel && lessonIndex === 0;
                          const cannotDown = lastLevel && lessonIndex === level.lessons.length - 1;
                          return (
                            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- vùng thả của kéo thả (chuột); lối bàn phím là các nút lên/xuống
                            <li
                              key={lesson.id}
                              draggable={handleArmed === lesson.id}
                              onDragStart={(e) => beginDrag(e, 'lesson', lesson.id)}
                              onDragEnd={endDrag}
                              onDragOver={(e) => handleDragOverLesson(e, level.id, lesson.id)}
                              onDrop={handleDrop}
                              className={`flex items-center justify-between px-6 py-3 hover:bg-gray-50 ${lessonHintClass(
                                lesson.id
                              )} ${drag?.kind === 'lesson' && drag.id === lesson.id ? 'opacity-40' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Tay nắm kéo: chỉ cho chuột (ẩn với trình đọc màn hình); bàn phím dùng nút lên/xuống. */}
                                <span
                                  onMouseDown={() => setHandleArmed(lesson.id)}
                                  onMouseUp={() => setHandleArmed(null)}
                                  title="Kéo để đổi thứ tự bài học"
                                  aria-hidden="true"
                                  className="text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </span>
                                <BookOpen className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-900">{lesson.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({lesson._count.exercises} bài tập)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  id={`move-${lesson.id}-up`}
                                  onClick={() => {
                                    if (!cannotUp) void moveLessonBy(level.id, lesson.id, -1);
                                  }}
                                  aria-disabled={cannotUp || undefined}
                                  aria-label={`Chuyển bài ${lesson.name} lên`}
                                  title="Chuyển lên"
                                  className={moveButtonClass}
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  id={`move-${lesson.id}-down`}
                                  onClick={() => {
                                    if (!cannotDown) void moveLessonBy(level.id, lesson.id, 1);
                                  }}
                                  aria-disabled={cannotDown || undefined}
                                  aria-label={`Chuyển bài ${lesson.name} xuống`}
                                  title="Chuyển xuống"
                                  className={moveButtonClass}
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <Link
                                  href={`/admin/lessons/${lesson.id}/content`}
                                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  Nội dung<span className="sr-only"> bài {lesson.name}</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingLesson({
                                      lesson,
                                      levelId: level.id,
                                    });
                                    setLessonName(lesson.name);
                                    setDialogError('');
                                    setShowLessonModal(true);
                                  }}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Sửa bài học"
                                  aria-label={`Sửa bài học ${lesson.name}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDialogError('');
                                    setDeleteConfirm({
                                      type: 'lesson',
                                      id: lesson.id,
                                      levelId: level.id,
                                    });
                                  }}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Xóa bài học"
                                  aria-label={`Xóa bài học ${lesson.name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* Level Modal */}
      {showLevelModal && (
        <AdminDialog
          title={editingLevel ? 'Sửa cấp độ' : 'Thêm cấp độ mới'}
          onClose={closeLevelModal}
          busy={saving}
          // Focus vào ô tên ngay khi mở: hộp thoại chỉ có một ô để điền.
          initialFocus="#level-name"
          fallbackFocus={() => headingRef.current}
        >
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void handleSaveLevel();
            }}
          >
            <label htmlFor="level-name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên cấp độ
            </label>
            <input
              id="level-name"
              type="text"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              placeholder="Tên cấp độ..."
              required
              aria-invalid={!!dialogError || undefined}
              aria-describedby={dialogError ? 'level-dialog-error' : undefined}
              className={`${dialogInputClass} mb-4`}
            />
            <FormError id="level-dialog-error" message={dialogError} />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeLevelModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                aria-disabled={saving || undefined}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 aria-disabled:opacity-70 aria-disabled:cursor-wait transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <AdminDialog
          title={editingLesson?.lesson ? 'Sửa bài học' : 'Thêm bài học mới'}
          onClose={closeLessonModal}
          busy={saving}
          // Focus vào ô tên ngay khi mở: hộp thoại chỉ có một ô để điền.
          initialFocus="#lesson-name"
          fallbackFocus={() => headingRef.current}
        >
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void handleSaveLesson();
            }}
          >
            <label htmlFor="lesson-name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên bài học
            </label>
            <input
              id="lesson-name"
              type="text"
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              placeholder="Tên bài học..."
              required
              aria-invalid={!!dialogError || undefined}
              aria-describedby={dialogError ? 'lesson-dialog-error' : undefined}
              className={`${dialogInputClass} mb-4`}
            />
            <FormError id="lesson-dialog-error" message={dialogError} />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeLessonModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                aria-disabled={saving || undefined}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 aria-disabled:opacity-70 aria-disabled:cursor-wait transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmDialog
          onCancel={() => {
            setDeleteConfirm(null);
            setDialogError('');
          }}
          onConfirm={() => {
            if (deleteConfirm.type === 'level') {
              handleDeleteLevel(deleteConfirm.id);
            } else {
              handleDeleteLesson(deleteConfirm.id);
            }
          }}
          busy={deleting}
          error={dialogError}
          fallbackFocus={() => headingRef.current}
        >
          Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'level' ? 'cấp độ' : 'bài học'}
          {deleteName ? ` “${deleteName}”` : ' này'}?
        </ConfirmDialog>
      )}
    </div>
  );
}

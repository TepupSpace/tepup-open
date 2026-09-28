'use client';

import { useState, useEffect, use } from 'react';
import Link from '@/components/ui/AppLink';
import {
  moveLevel,
  moveLesson,
  toReorderPayload,
  type DropTarget,
} from '@/components/admin/levels-reorder';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

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

export default function LevelsPage({
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

  // ---- Drag & drop reorder ----------------------------------------------

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

    if (next === levels) return; // dropped right back where it started

    const previous = levels;
    setLevels(next);
    // A lesson dropped onto a collapsed level would otherwise vanish from view.
    if (target.kind !== 'level') {
      setExpandedLevels((prev) => new Set(prev).add(target.levelId));
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
    } catch (err) {
      setLevels(previous); // roll the optimistic move back
      setError(err instanceof Error ? err.message : 'Không lưu được thứ tự');
    }
  }

  /** Blue insertion line / drop highlight for the row being hovered. */
  function levelHintClass(levelId: string) {
    if (dropHint?.kind === 'level' && dropHint.levelId === levelId) {
      return dropHint.before ? 'border-t-4 border-t-blue-500' : 'border-b-4 border-b-blue-500';
    }
    if (dropHint?.kind === 'level-body' && dropHint.levelId === levelId) {
      return 'ring-2 ring-inset ring-blue-400';
    }
    return '';
  }

  function lessonHintClass(lessonId: string) {
    if (dropHint?.kind !== 'lesson' || dropHint.lessonId !== lessonId) return '';
    return dropHint.before ? 'border-t-2 border-t-blue-500' : 'border-b-2 border-b-blue-500';
  }

  // Level CRUD
  async function handleSaveLevel() {
    if (!levelName.trim()) return;
    setSaving(true);

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
        setError(data.error || 'Không thể lưu level');
        return;
      }

      await fetchData();
      setShowLevelModal(false);
      setEditingLevel(null);
      setLevelName('');
    } catch (err) {
      console.error('Error saving level:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLevel(levelId: string) {
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/levels/${levelId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Không thể xóa level');
        return;
      }

      await fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting level:', err);
      setError('Đã xảy ra lỗi');
    }
  }

  // Lesson CRUD
  async function handleSaveLesson() {
    if (!lessonName.trim() || !editingLesson) return;
    setSaving(true);

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
        setError(data.error || 'Không thể lưu bài học');
        return;
      }

      await fetchData();
      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonName('');
    } catch (err) {
      console.error('Error saving lesson:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Không thể xóa bài học');
        return;
      }

      await fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('Đã xảy ra lỗi');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/courses"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Levels & Bài học
            </h1>
            <p className="text-gray-600 mt-1">{course?.name}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingLevel(null);
            setLevelName('');
            setShowLevelModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Level</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-800 hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Levels List */}
      <div className="space-y-4">
        {levels.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">
              Chưa có level nào. Hãy thêm level đầu tiên!
            </p>
          </div>
        ) : (
          levels.map((level) => (
            <div
              key={level.id}
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
                  <span
                    onMouseDown={() => setHandleArmed(level.id)}
                    onMouseUp={() => setHandleArmed(null)}
                    title="Kéo để đổi thứ tự level"
                    className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-5 h-5" />
                  </span>
                  <button
                    onClick={() => toggleLevel(level.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {expandedLevels.has(level.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <span className="font-medium text-gray-900">{level.name}</span>
                  <span className="text-sm text-gray-500">
                    ({level.lessons.length} bài học)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingLesson({ lesson: null, levelId: level.id });
                      setLessonName('');
                      setShowLessonModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Thêm bài học"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingLevel(level);
                      setLevelName(level.name);
                      setShowLevelModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sửa level"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({ type: 'level', id: level.id })
                    }
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa level"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lessons */}
              {expandedLevels.has(level.id) && (
                <div className="divide-y divide-gray-100">
                  {level.lessons.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                      {drag?.kind === 'lesson'
                        ? 'Thả vào đây để chuyển bài học sang level này'
                        : 'Chưa có bài học nào trong level này'}
                    </div>
                  ) : (
                    level.lessons.map((lesson) => (
                      <div
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
                          <span
                            onMouseDown={() => setHandleArmed(lesson.id)}
                            onMouseUp={() => setHandleArmed(null)}
                            title="Kéo để đổi thứ tự bài học"
                            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{lesson.name}</span>
                          <span className="text-sm text-gray-500">
                            ({lesson._count.exercises} bài tập)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/lessons/${lesson.id}/content`}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Nội dung
                          </Link>
                          <button
                            onClick={() => {
                              setEditingLesson({
                                lesson,
                                levelId: level.id,
                              });
                              setLessonName(lesson.name);
                              setShowLessonModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'lesson',
                                id: lesson.id,
                                levelId: level.id,
                              })
                            }
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Level Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLevel ? 'Sửa Level' : 'Thêm Level mới'}
            </h3>
            <input
              type="text"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              placeholder="Tên level..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowLevelModal(false);
                  setEditingLevel(null);
                  setLevelName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveLevel}
                disabled={saving || !levelName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLesson?.lesson ? 'Sửa Bài học' : 'Thêm Bài học mới'}
            </h3>
            <input
              type="text"
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              placeholder="Tên bài học..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowLessonModal(false);
                  setEditingLesson(null);
                  setLessonName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveLesson}
                disabled={saving || !lessonName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa{' '}
              {deleteConfirm.type === 'level' ? 'level' : 'bài học'} này?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'level') {
                    handleDeleteLevel(deleteConfirm.id);
                  } else {
                    handleDeleteLesson(deleteConfirm.id);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

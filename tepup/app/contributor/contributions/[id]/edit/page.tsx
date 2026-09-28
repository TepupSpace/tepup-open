'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from '@/components/ui/AppLink';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  BookOpen,
  Layers,
  FileText,
} from 'lucide-react';
import NotionBlockEditor from '@/components/admin/editor/NotionBlockEditor';
import type { ContentBlock } from '@/lib/types/content';

interface LessonData {
  name: string;
  sortOrder: number;
  content: {
    title: string;
    blocks: ContentBlock[];
  };
}

interface LevelData {
  name: string;
  sortOrder: number;
  lessons: LessonData[];
}

interface CourseData {
  course: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    icon: string;
  };
  levels: LevelData[];
}

type EditStep = 'overview' | { level: number } | { level: number; lesson: number };

export default function EditContributionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<CourseData | null>(null);
  const [contributionStatus, setContributionStatus] = useState('');
  const [step, setStep] = useState<EditStep>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load contribution data
  useEffect(() => {
    fetch(`/api/contributor/contributions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((contribution) => {
        setData(contribution.data as CourseData);
        setContributionStatus(contribution.status);
      })
      .catch(() => setError('Không thể tải đóng góp'));
  }, [id]);

  const save = useCallback(async (newData?: CourseData) => {
    const dataToSave = newData || data;
    if (!dataToSave) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/contributor/contributions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToSave }),
      });
      if (res.ok) {
        setLastSaved(new Date());
        setError('');
      } else {
        // Không được im lặng: bản lưu bị từ chối nghĩa là thay đổi chưa nằm trên server.
        // `details` is string[] from the block-structure check, or {path, message}[]
        // from the content-safety validation — show both.
        const d = await res.json().catch(() => ({}));
        const details: string[] = Array.isArray(d.details)
          ? d.details.map((x: unknown) =>
              typeof x === 'string'
                ? x
                : x && typeof x === 'object' && 'message' in x
                  ? `${(x as { path?: string }).path ?? ''}: ${(x as { message: string }).message}`
                  : String(x)
            )
          : [];
        setError([d.error || 'Không lưu được bản nháp', ...details].join('\n'));
      }
    } catch {
      setError('Mất kết nối — chưa lưu được bản nháp');
    } finally {
      setIsSaving(false);
    }
  }, [data, id]);

  const submit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/contributor/contributions/${id}/submit`, {
        method: 'POST',
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Lỗi khi gửi duyệt');
        return;
      }
      router.push('/contributor/submissions');
    } catch {
      setError('Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Level operations
  const addLevel = () => {
    if (!data) return;
    const newData = {
      ...data,
      levels: [
        ...data.levels,
        { name: `Level ${data.levels.length + 1}`, sortOrder: data.levels.length, lessons: [] },
      ],
    };
    setData(newData);
    save(newData);
  };

  const removeLevel = (idx: number) => {
    if (!data) return;
    const newData = {
      ...data,
      levels: data.levels.filter((_, i) => i !== idx).map((l, i) => ({ ...l, sortOrder: i })),
    };
    setData(newData);
    save(newData);
    if (typeof step === 'object' && 'level' in step && step.level === idx) {
      setStep('overview');
    }
  };

  const updateLevelName = (idx: number, name: string) => {
    if (!data) return;
    const newLevels = [...data.levels];
    newLevels[idx] = { ...newLevels[idx], name };
    setData({ ...data, levels: newLevels });
  };

  // Lesson operations
  const addLesson = (levelIdx: number) => {
    if (!data) return;
    const newLevels = [...data.levels];
    const level = newLevels[levelIdx];
    newLevels[levelIdx] = {
      ...level,
      lessons: [
        ...level.lessons,
        {
          name: `Bài ${level.lessons.length + 1}`,
          sortOrder: level.lessons.length,
          content: { title: '', blocks: [] },
        },
      ],
    };
    const newData = { ...data, levels: newLevels };
    setData(newData);
    save(newData);
  };

  const removeLesson = (levelIdx: number, lessonIdx: number) => {
    if (!data) return;
    const newLevels = [...data.levels];
    newLevels[levelIdx] = {
      ...newLevels[levelIdx],
      lessons: newLevels[levelIdx].lessons
        .filter((_, i) => i !== lessonIdx)
        .map((l, i) => ({ ...l, sortOrder: i })),
    };
    const newData = { ...data, levels: newLevels };
    setData(newData);
    save(newData);
    if (typeof step === 'object' && 'lesson' in step && step.level === levelIdx && step.lesson === lessonIdx) {
      setStep({ level: levelIdx });
    }
  };

  const updateLessonName = (levelIdx: number, lessonIdx: number, name: string) => {
    if (!data) return;
    const newLevels = [...data.levels];
    newLevels[levelIdx].lessons[lessonIdx] = {
      ...newLevels[levelIdx].lessons[lessonIdx],
      name,
    };
    setData({ ...data, levels: newLevels });
  };

  const updateLessonBlocks = (levelIdx: number, lessonIdx: number, blocks: ContentBlock[]) => {
    if (!data) return;
    const newLevels = [...data.levels];
    newLevels[levelIdx].lessons[lessonIdx] = {
      ...newLevels[levelIdx].lessons[lessonIdx],
      content: {
        ...newLevels[levelIdx].lessons[lessonIdx].content,
        blocks,
      },
    };
    setData({ ...data, levels: newLevels });
  };

  const updateLessonTitle = (levelIdx: number, lessonIdx: number, title: string) => {
    if (!data) return;
    const newLevels = [...data.levels];
    newLevels[levelIdx].lessons[lessonIdx] = {
      ...newLevels[levelIdx].lessons[lessonIdx],
      content: {
        ...newLevels[levelIdx].lessons[lessonIdx].content,
        title,
      },
    };
    setData({ ...data, levels: newLevels });
  };

  if (error && !data) {
    return (
      <div className="p-12 text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/contributor/drafts" className="text-teal-600 text-sm mt-2 inline-block">
          Quay lại bản nháp
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canSubmit = ['DRAFT', 'CHANGES_REQUESTED'].includes(contributionStatus);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/contributor/drafts"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Bản nháp
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.course.name || 'Khóa học chưa đặt tên'}
          </h1>
          {lastSaved && (
            <p className="text-xs text-gray-400 mt-1">
              Lưu lần cuối: {lastSaved.toLocaleTimeString('vi-VN')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
          {canSubmit && (
            <button
              onClick={submit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Đang gửi...' : 'Gửi duyệt'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Left sidebar - course structure */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-6">
            {/* Course overview */}
            <button
              onClick={() => setStep('overview')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium mb-2 ${
                step === 'overview' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Thông tin khóa học
            </button>

            {/* Levels */}
            <div className="space-y-1">
              {data.levels.map((level, levelIdx) => (
                <div key={levelIdx}>
                  <button
                    onClick={() => setStep({ level: levelIdx })}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                      typeof step === 'object' && 'level' in step && step.level === levelIdx && !('lesson' in step)
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{level.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{level.lessons.length}</span>
                  </button>

                  {/* Lessons under this level */}
                  {typeof step === 'object' && 'level' in step && step.level === levelIdx && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {level.lessons.map((lesson, lessonIdx) => (
                        <button
                          key={lessonIdx}
                          onClick={() => setStep({ level: levelIdx, lesson: lessonIdx })}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs ${
                            typeof step === 'object' && 'lesson' in step && step.lesson === lessonIdx
                              ? 'bg-teal-50 text-teal-700 font-medium'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{lesson.name}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => addLesson(levelIdx)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-teal-600 hover:bg-teal-50 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm bài học
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addLevel}
              className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Thêm Level
            </button>
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1 min-w-0">
          {step === 'overview' && (
            <CourseOverviewEditor
              data={data}
              onChange={(course) => {
                const newData = { ...data, course };
                setData(newData);
              }}
              onSave={() => save()}
            />
          )}

          {typeof step === 'object' && 'level' in step && !('lesson' in step) && (
            <LevelEditor
              level={data.levels[step.level]}
              levelIdx={step.level}
              onNameChange={(name) => updateLevelName(step.level, name)}
              onRemove={() => removeLevel(step.level)}
              onAddLesson={() => addLesson(step.level)}
              onEditLesson={(lessonIdx) => setStep({ level: step.level, lesson: lessonIdx })}
              onRemoveLesson={(lessonIdx) => removeLesson(step.level, lessonIdx)}
              onSave={() => save()}
            />
          )}

          {typeof step === 'object' && 'lesson' in step && (
            <LessonEditor
              lesson={data.levels[step.level].lessons[step.lesson]}
              onNameChange={(name) => updateLessonName(step.level, step.lesson, name)}
              onTitleChange={(title) => updateLessonTitle(step.level, step.lesson, title)}
              onBlocksChange={(blocks) => updateLessonBlocks(step.level, step.lesson, blocks)}
              onSave={() => save()}
              onBack={() => setStep({ level: step.level })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function CourseOverviewEditor({
  data,
  onChange,
  onSave,
}: {
  data: CourseData;
  onChange: (course: CourseData['course']) => void;
  onSave: () => void;
}) {
  const course = data.course;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khóa học</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
          <input
            type="text"
            value={course.name}
            onChange={(e) => onChange({ ...course, name: e.target.value })}
            onBlur={onSave}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={course.slug}
            onChange={(e) => onChange({ ...course, slug: e.target.value })}
            onBlur={onSave}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={course.description}
            onChange={(e) => onChange({ ...course, description: e.target.value })}
            onBlur={onSave}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>
        <p className="text-xs text-gray-400">
          Tổng cộng: {data.levels.length} levels, {data.levels.reduce((sum, l) => sum + l.lessons.length, 0)} bài học
        </p>
      </div>
    </div>
  );
}

function LevelEditor({
  level,
  levelIdx,
  onNameChange,
  onRemove,
  onAddLesson,
  onEditLesson,
  onRemoveLesson,
  onSave,
}: {
  level: LevelData;
  levelIdx: number;
  onNameChange: (name: string) => void;
  onRemove: () => void;
  onAddLesson: () => void;
  onEditLesson: (lessonIdx: number) => void;
  onRemoveLesson: (lessonIdx: number) => void;
  onSave: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Level {levelIdx + 1}</h2>
        <button
          onClick={onRemove}
          className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Xóa Level
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Level</label>
        <input
          type="text"
          value={level.name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onSave}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Bài học ({level.lessons.length})
      </h3>

      {level.lessons.length === 0 ? (
        <p className="text-sm text-gray-400 mb-3">Chưa có bài học nào.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {level.lessons.map((lesson, lessonIdx) => (
            <div
              key={lessonIdx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <GripVertical className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-700 flex-1">{lesson.name}</span>
              <span className="text-xs text-gray-400">
                {lesson.content.blocks.length} blocks
              </span>
              <button
                onClick={() => onEditLesson(lessonIdx)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Sửa
              </button>
              <button
                onClick={() => onRemoveLesson(lessonIdx)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onAddLesson}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100"
      >
        <Plus className="w-4 h-4" />
        Thêm bài học
      </button>
    </div>
  );
}

function LessonEditor({
  lesson,
  onNameChange,
  onTitleChange,
  onBlocksChange,
  onSave,
  onBack,
}: {
  lesson: LessonData;
  onNameChange: (name: string) => void;
  onTitleChange: (title: string) => void;
  onBlocksChange: (blocks: ContentBlock[]) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Level
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học</label>
            <input
              type="text"
              value={lesson.name}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={onSave}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề nội dung</label>
            <input
              type="text"
              value={lesson.content.title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={onSave}
              placeholder="Tiêu đề hiển thị cho bài học"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Block Editor */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Nội dung bài học</h3>
        <NotionBlockEditor
          blocks={lesson.content.blocks}
          onChange={(blocks) => onBlocksChange(blocks)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={onSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Lưu nội dung
          </button>
        </div>
      </div>
    </div>
  );
}

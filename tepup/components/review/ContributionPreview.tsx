'use client';

import { useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Eye, FileText, Layers } from 'lucide-react';
import { BlockRenderer, INTERACTIVE_BLOCK_TYPES } from '@/components/learn/BlockRenderer';
import { isNativeBlock } from '@/components/learn/NativeBlock';
import type { ContentBlock } from '@/lib/types/content';
import { toggleAnswer } from '@/lib/utils/quiz';

/**
 * Xem trước ĐẦY ĐỦ nội dung một đóng góp, render bằng đúng `BlockRenderer` của
 * người học — người duyệt thấy chính xác thứ sẽ được xuất bản, không chỉ "(N blocks)".
 *
 * Mọi lớp bảo vệ lúc render (lọc HTML, allowlist media, bộ tính công thức an toàn)
 * đều áp dụng ở đây như ở trang học. Riêng block `custom` (mã Sandpack) KHÔNG được
 * chạy trong trang duyệt: chỉ hiện cảnh báo, vì contributor không được phép dùng nó.
 */

type Accent = 'blue' | 'teal';

interface LessonLike {
  name?: string;
  content?: { title?: string; blocks?: unknown };
}
interface LevelLike {
  name?: string;
  lessons?: LessonLike[];
}

const RENDERABLE = new Set<string>([
  'text', 'callout', 'image', 'question', 'library-document', 'step-break',
  ...INTERACTIVE_BLOCK_TYPES,
]);

function isRenderable(type: string) {
  return RENDERABLE.has(type) || isNativeBlock(type);
}

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

/** Danh sách block, render như người học thấy. */
export function BlockListPreview({ blocks, revealAnswers }: { blocks: unknown; revealAnswers: boolean }) {
  const explanationRef = useRef<HTMLDivElement>(null);
  const [questionState, setQuestionState] = useState<
    Record<number, { selected: string[]; checked: boolean; correct: boolean | null }>
  >({});
  const list = asArray<ContentBlock>(blocks);

  if (!Array.isArray(blocks)) {
    return <Warning>Dữ liệu block không hợp lệ (không phải danh sách).</Warning>;
  }
  if (list.length === 0) {
    return <p className="text-sm text-gray-400">Bài học chưa có nội dung.</p>;
  }

  return (
    <div>
      {list.map((block, i) => {
        const type = (block as { type?: unknown } | null)?.type;
        if (typeof type !== 'string') {
          return <Warning key={i}>Block #{i + 1} không hợp lệ (thiếu loại).</Warning>;
        }
        if (type === 'custom') {
          return (
            <Warning key={i}>
              Block #{i + 1}: block tuỳ chỉnh (custom) chứa mã chạy trong sandbox — không hiển thị
              trong trang duyệt. Contributor không được phép dùng loại block này.
            </Warning>
          );
        }
        if (!isRenderable(type)) {
          return (
            <Warning key={i}>
              Block #{i + 1}: loại &quot;{type.slice(0, 40)}&quot; không xác định — người học sẽ
              không thấy block này.
            </Warning>
          );
        }
        if (type === 'step-break') {
          const label = (block as { label?: string }).label;
          return (
            <div key={i} className="my-6 flex items-center gap-3 text-xs text-gray-400" aria-hidden="true">
              <div className="h-px flex-1 bg-gray-200" />
              Ngắt bước{label ? `: ${label}` : ''}
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          );
        }

        let qs = questionState[i];
        if (revealAnswers && block.type === 'question') {
          // Same id fallback as QuestionBlockComponent (index over ALL options).
          const correct = asArray<{ id?: string; isCorrect?: boolean }>(block.options)
            .map((o, idx) => (o.isCorrect ? o.id ?? String(idx) : null))
            .filter((id): id is string => id !== null);
          qs = { selected: correct, checked: true, correct: true };
        }

        return (
          <BlockRenderer
            key={i}
            block={block}
            index={i}
            questionState={qs}
            onSelectAnswer={(idx, optionId) => {
              if (revealAnswers) return;
              setQuestionState((s) => ({
                ...s,
                [idx]: {
                  selected: toggleAnswer(
                    s[idx]?.selected ?? [],
                    optionId,
                    block.type === 'question' ? block.mode : undefined
                  ),
                  checked: false,
                  correct: null,
                },
              }));
            }}
            onInteractiveComplete={() => {}}
            isLastVisible={false}
            explanationRef={explanationRef}
            isCurrentBlock={false}
          />
        );
      })}
    </div>
  );
}

function LessonPreview({
  lesson,
  index,
  accent,
  revealAnswers,
}: {
  lesson: LessonLike;
  index: number;
  accent: Accent;
  revealAnswers: boolean;
}) {
  const [open, setOpen] = useState(true);
  const blocks = lesson.content?.blocks;
  const count = Array.isArray(blocks) ? blocks.length : 0;
  return (
    <div className="border border-gray-100 rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        aria-expanded={open}
      >
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        <FileText className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-medium">
          {index + 1}. {lesson.name || 'Bài chưa đặt tên'}
        </span>
        <span className="text-xs text-gray-400">({count} blocks)</span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-5 sm:px-6 bg-white">
          {lesson.content?.title && (
            <h3 className={`text-xl font-bold mb-4 ${accent === 'teal' ? 'text-teal-900' : 'text-blue-900'}`}>
              {lesson.content.title}
            </h3>
          )}
          <BlockListPreview blocks={blocks} revealAnswers={revealAnswers} />
        </div>
      )}
    </div>
  );
}

/**
 * Xem trước theo loại đóng góp: NEW_COURSE (level → bài → block) hoặc
 * EDIT_LESSON_CONTENT (`{ blocks }`).
 */
export default function ContributionPreview({
  type,
  data,
  accent = 'blue',
}: {
  type: string;
  data: unknown;
  accent?: Accent;
}) {
  const [revealAnswers, setRevealAnswers] = useState(true);
  const obj = (data && typeof data === 'object' ? data : {}) as { levels?: unknown; blocks?: unknown };
  const accentText = accent === 'teal' ? 'text-teal-500' : 'text-blue-500';

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <Eye className={`w-4 h-4 ${accentText}`} />
        Xem trước nội dung (như người học thấy)
      </h2>
      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={revealAnswers}
          onChange={(e) => setRevealAnswers(e.target.checked)}
          className="w-3.5 h-3.5"
        />
        Hiện đáp án câu hỏi
      </label>
    </div>
  );

  if (type === 'EDIT_LESSON_CONTENT') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {header}
        <div className="border border-gray-100 rounded-lg px-4 py-5 sm:px-6">
          <BlockListPreview blocks={obj.blocks} revealAnswers={revealAnswers} />
        </div>
      </div>
    );
  }

  const levels = asArray<LevelLike>(obj.levels);
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      {header}
      {type !== 'NEW_COURSE' && (
        <Warning>Loại đóng góp &quot;{type}&quot; chưa được hỗ trợ xuất bản.</Warning>
      )}
      {levels.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có levels nào.</p>
      ) : (
        <div className="space-y-4">
          {levels.map((level, levelIdx) => {
            const lessons = asArray<LessonLike>(level.lessons);
            return (
              <div key={levelIdx} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className={`w-4 h-4 ${accentText}`} />
                  <span className="font-medium text-sm">{level.name || `Level ${levelIdx + 1}`}</span>
                  <span className="text-xs text-gray-400">{lessons.length} bài</span>
                </div>
                <div className="space-y-2">
                  {lessons.map((lesson, lessonIdx) => (
                    <LessonPreview
                      key={lessonIdx}
                      lesson={lesson}
                      index={lessonIdx}
                      accent={accent}
                      revealAnswers={revealAnswers}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

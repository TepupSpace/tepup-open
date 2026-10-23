'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Eye, FileText, Layers } from 'lucide-react';
import { BlockRenderer, INTERACTIVE_BLOCK_TYPES } from '@/components/learn/BlockRenderer';
import { isNativeBlock } from '@/components/learn/NativeBlock';
import type { ContentBlock } from '@/lib/types/content';
import { toggleAnswer } from '@/lib/utils/quiz';
import { TYPE_LABELS as ENTRY_TYPE_LABELS, type EntryType } from '@/lib/library/schemas';
import { asOutlineProposal, outlineOfSnapshot, outlineToProposal } from '@/components/contributor/proposal/outline-utils';
import { levelKey } from '@/lib/schemas/contribution-types/course-outline';

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
    return <p className="text-sm text-gray-500">Bài học chưa có nội dung.</p>;
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
              trong trang duyệt. Người đóng góp không được phép dùng loại block này.
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
            <div key={i} className="my-6 flex items-center gap-3 text-xs text-gray-500" aria-hidden="true">
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
        {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
        <FileText className="w-3.5 h-3.5 text-gray-500" />
        <span className="font-medium">
          {index + 1}. {lesson.name || 'Bài chưa đặt tên'}
        </span>
        <span className="text-xs text-gray-500">({count} blocks)</span>
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
 * Xem trước theo loại đóng góp: NEW_COURSE (level → bài → block), EDIT_LESSON_CONTENT và
 * EDIT_CHAPTER_CONTENT (`{ title?, blocks }`), EDIT_LIBRARY_ENTRY (các trường của mục) và
 * EDIT_COURSE (mục lục; nhận cả dữ liệu đề xuất lẫn bản `{ outline, hash }` đang chạy).
 */
export default function ContributionPreview({
  type,
  data,
  accent = 'blue',
  entryType,
}: {
  type: string;
  data: unknown;
  accent?: Accent;
  /** EDIT_LIBRARY_ENTRY: the entry's type, for field labels. */
  entryType?: string;
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

  if (type === 'EDIT_LESSON_CONTENT' || type === 'EDIT_CHAPTER_CONTENT') {
    const title = (obj as { title?: unknown }).title;
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {header}
        <div className="border border-gray-100 rounded-lg px-4 py-5 sm:px-6">
          {typeof title === 'string' && title && (
            <h3 className={`text-xl font-bold mb-4 ${accent === 'teal' ? 'text-teal-900' : 'text-blue-900'}`}>{title}</h3>
          )}
          <BlockListPreview blocks={obj.blocks} revealAnswers={revealAnswers} />
        </div>
      </div>
    );
  }

  if (type === 'EDIT_LIBRARY_ENTRY') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Eye className={`w-4 h-4 ${accentText}`} aria-hidden="true" />
          Xem trước mục thư viện
        </h2>
        <EntryFieldsPreview data={data} entryType={entryType} />
      </div>
    );
  }

  if (type === 'EDIT_COURSE') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Eye className={`w-4 h-4 ${accentText}`} aria-hidden="true" />
          Mục lục khóa học
        </h2>
        <OutlinePreview data={data} accentText={accentText} />
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
        <p className="text-sm text-gray-500">Chưa có levels nào.</p>
      ) : (
        <div className="space-y-4">
          {levels.map((level, levelIdx) => {
            const lessons = asArray<LessonLike>(level.lessons);
            return (
              <div key={levelIdx} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className={`w-4 h-4 ${accentText}`} />
                  <span className="font-medium text-sm">{level.name || `Level ${levelIdx + 1}`}</span>
                  <span className="text-xs text-gray-500">{lessons.length} bài</span>
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

// --- EDIT_LIBRARY_ENTRY ----------------------------------------------------------------

const META_LABELS: Record<string, string> = {
  titleEn: 'Tên tiếng Anh / tên gốc',
  pronunciation: 'Cách đọc',
  sourceType: 'Loại nguồn',
  authors: 'Tác giả',
  year: 'Năm',
  date: 'Ngày đăng',
  containerTitle: 'Tạp chí / báo / chương trình',
  publisher: 'Nhà xuất bản',
  url: 'Link',
  archivedUrl: 'Bản lưu trữ',
  accessedAt: 'Ngày truy cập',
  language: 'Ngôn ngữ',
  identifier: 'Số hiệu (DOI, ISBN…)',
  durationMin: 'Thời lượng (phút)',
  expansion: 'Dạng đầy đủ',
  expansionVi: 'Dạng đầy đủ (tiếng Việt)',
  tiers: 'Mức làm theo',
};

const LINK_LABELS: Record<string, string> = { RELATED: 'Liên quan', CITES: 'Trích nguồn' };

/** id → title of library entries readable by everyone (/api/library), for link names. */
export function useEntryTitles(): Map<string, string> {
  const [titles, setTitles] = useState<Map<string, string>>(() => new Map());
  useEffect(() => {
    let cancelled = false;
    fetch('/api/library')
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data?: { id: string; title: string }[] } | null) => {
        if (!cancelled && body?.data) setTitles(new Map(body.data.map((d) => [d.id, d.title])));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return titles;
}

function metaValue(v: unknown): string {
  if (Array.isArray(v)) {
    return v
      .map((x) => {
        if (!x || typeof x !== 'object') return String(x);
        const tier = x as { level?: string; what?: string; picks?: { name?: string; url?: string }[] };
        const picks = (tier.picks ?? []).map((p) => `${p.name ?? ''} (${p.url ?? ''})`);
        return [tier.level, tier.what, ...picks].filter(Boolean).join(' — ');
      })
      .join('; ');
  }
  return v === undefined || v === null ? '' : String(v);
}

function EntryFieldsPreview({ data, entryType }: { data: unknown; entryType?: string }) {
  const titles = useEntryTitles();
  const d = (data && typeof data === 'object' ? data : {}) as {
    title?: unknown;
    summary?: unknown;
    body?: { sections?: { heading?: string; paragraphs?: string[] }[] } | null;
    meta?: Record<string, unknown>;
    links?: { toId: string; kind: string }[];
  };
  const sections = Array.isArray(d.body?.sections) ? d.body.sections : [];
  const meta = d.meta && typeof d.meta === 'object' ? Object.entries(d.meta) : [];
  const links = Array.isArray(d.links) ? d.links : [];
  // Plain text throughout: proposal text is contributor input.
  return (
    <div className="space-y-4 text-sm text-gray-800">
      {entryType && (
        <p className="text-xs text-gray-600">Loại mục: {ENTRY_TYPE_LABELS[entryType as EntryType] ?? entryType}</p>
      )}
      <div>
        <p className="text-xs font-medium text-gray-600">Tiêu đề</p>
        <p className="text-lg font-semibold text-gray-900 break-words">{typeof d.title === 'string' ? d.title : ''}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600">Xem nhanh</p>
        <p className="whitespace-pre-line break-words">{typeof d.summary === 'string' ? d.summary : ''}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600">Thân bài</p>
        {sections.length === 0 ? (
          <p className="text-gray-600">Không có thân bài.</p>
        ) : (
          <div className="space-y-3">
            {sections.map((sec, i) => (
              <div key={i}>
                {sec.heading && <h3 className="font-semibold text-gray-900">{sec.heading}</h3>}
                {(sec.paragraphs ?? []).map((p, j) => (
                  <p key={j} className="mt-1 whitespace-pre-line break-words">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      {meta.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-3">
          {meta.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-xs font-medium text-gray-600 sm:pt-0.5">{META_LABELS[k] ?? k}</dt>
              <dd className="sm:col-span-2 break-words">{metaValue(v)}</dd>
            </div>
          ))}
        </dl>
      )}
      <div>
        <p className="text-xs font-medium text-gray-600">Liên kết</p>
        {links.length === 0 ? (
          <p className="text-gray-600">Không có liên kết.</p>
        ) : (
          <ul className="list-disc pl-5">
            {links.map((l, i) => (
              <li key={`${l.toId}-${l.kind}-${i}`}>
                {LINK_LABELS[l.kind] ?? l.kind}: {titles.get(l.toId) ?? `mục ${l.toId}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- EDIT_COURSE -----------------------------------------------------------------------

function OutlinePreview({ data, accentText }: { data: unknown; accentText: string }) {
  const live = outlineOfSnapshot(data);
  const proposal = live ? outlineToProposal(live) : asOutlineProposal(data);
  if (!proposal) return <Warning>Dữ liệu mục lục không hợp lệ.</Warning>;
  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-semibold text-gray-900 break-words">{proposal.course.name}</p>
        {proposal.course.description && (
          <p className="mt-1 whitespace-pre-line break-words text-gray-700">{proposal.course.description}</p>
        )}
      </div>
      <ol className="space-y-3">
        {proposal.levels.map((lv, i) => {
          const lessons = proposal.lessons.filter((l) => l.levelRef === levelKey(lv));
          return (
            <li key={lv.tempKey} className="rounded-lg border border-gray-100 p-3">
              <p className="flex items-center gap-2 font-medium text-gray-900">
                <Layers className={`w-4 h-4 ${accentText}`} aria-hidden="true" />
                {i + 1}. {lv.name}
                {!lv.id && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Mới</span>}
              </p>
              {lessons.length === 0 ? (
                <p className="mt-1 pl-6 text-gray-600">Chưa có bài.</p>
              ) : (
                <ol className="mt-1 list-decimal space-y-0.5 pl-10 text-gray-800">
                  {lessons.map((l) => (
                    <li key={l.tempKey}>
                      {l.name}
                      {!l.id && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                          Mới, ẩn, chưa có nội dung
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

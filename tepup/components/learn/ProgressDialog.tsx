'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import FocusTrap from 'focus-trap-react';
import { Check, CircleDot, Circle, X } from 'lucide-react';
import Link from '@/components/ui/AppLink';

/** Một phần của bài (một heading), kèm vị trí block để nhảy tới. */
export interface LessonSection {
  blockIndex: number;
  title: string;
  /** 'done': đã qua, 'current': đang ở phần này, 'todo': chưa mở tới. */
  status: 'done' | 'current' | 'todo';
}

/** Mục lục khoá (bài có hiện), lấy từ getCourseBySlug ở LessonRouteView. Cùng một bản cho mọi người (cache-safe). */
export interface CourseOutline {
  id: string;
  name: string;
  href: string;
  levels: { id: string; name: string; lessons: { id: string; name: string; href: string }[] }[];
}

type Tab = 'course' | 'lesson';

/**
 * Bảng "Tiến độ" của trang học: tab "Khoá học" (đã học tới bài nào, đọc từ tiến độ trong
 * localStorage) và tab "Bài này" (các phần của bài, phần nào đã qua). Modal: focus vào
 * tab đang chọn, Tab ở lại bên trong, Esc đóng, focus về nút mở (hoặc về phần vừa chọn).
 */
export default function ProgressDialog({
  open,
  onClose,
  noun,
  title,
  sections,
  stepsSeen,
  stepsTotal,
  course,
  currentId,
  isCompleted,
  onJump,
  returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  noun: string;
  title: string;
  sections: LessonSection[];
  stepsSeen: number;
  stepsTotal: number;
  course: CourseOutline | null;
  currentId: string;
  isCompleted: (lessonId: string) => boolean;
  /** Nhảy tới một phần đã mở. Trả về phần tử để focus sau khi đóng. */
  onJump: (blockIndex: number) => HTMLElement | null;
  returnFocusTo: () => HTMLElement | null;
}) {
  const id = useId();
  const [tab, setTab] = useState<Tab>(course ? 'course' : 'lesson');
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ course: null, lesson: null });
  const jumpTarget = useRef<HTMLElement | null>(null);

  if (!open) return null;

  const tabs: Tab[] = course ? ['course', 'lesson'] : ['lesson'];
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const i = tabs.indexOf(tab);
    const next =
      e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs[tabs.length - 1] : tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const allLessons = course?.levels.flatMap((l) => l.lessons) ?? [];
  const doneCount = allLessons.filter((l) => isCompleted(l.id)).length;
  const label = (t: Tab) => (t === 'course' ? 'Khoá học' : noun === 'chương' ? 'Chương này' : 'Bài này');

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40" onMouseDown={onClose} aria-hidden="true" />
      <FocusTrap
        focusTrapOptions={{
          allowOutsideClick: true,
          initialFocus: () => tabRefs.current[tab] ?? undefined,
          preventScroll: true,
          setReturnFocus: () => {
            const el = jumpTarget.current ?? returnFocusTo();
            jumpTarget.current = null;
            return el?.isConnected ? el : false;
          },
          // Không đóng trong onDeactivate: StrictMode (dev) gỡ rồi gắn lại trap ngay khi mở, gọi
          // onDeactivate và đóng luôn bảng (như SettingsDialog). Esc đóng ở đây; nút ✕ và nền tối tự gọi onClose.
          escapeDeactivates: () => {
            onClose();
            return true;
          },
        }}
      >
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            className="pointer-events-auto w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[85dvh] flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div className="min-w-0">
                <h2 id={`${id}-title`} className="font-[family-name:var(--pl-serif)] italic text-2xl text-gray-900">
                  Tiến độ
                </h2>
                <p className="text-sm text-gray-600 mt-0.5 truncate">{course ? course.name : title}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -m-1 rounded-full hover:bg-gray-100"
                aria-label="Đóng bảng tiến độ"
              >
                <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
              </button>
            </div>

            {tabs.length > 1 && (
              <div role="tablist" aria-label="Xem tiến độ theo" className="mx-5 mt-4 flex gap-1 rounded-full bg-gray-100 p-1">
                {tabs.map((t) => (
                  <button
                    key={t}
                    ref={(el) => {
                      tabRefs.current[t] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${id}-tab-${t}`}
                    aria-selected={tab === t}
                    aria-controls={`${id}-panel-${t}`}
                    tabIndex={tab === t ? 0 : -1}
                    onClick={() => setTab(t)}
                    onKeyDown={onTabKey}
                    className="flex-1 rounded-full px-3 py-2 text-sm font-semibold text-gray-600 aria-selected:bg-white aria-selected:text-gray-900 aria-selected:shadow-sm"
                  >
                    {label(t)}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-y-auto px-5 pt-4 pb-6">
              {course && (
                <div
                  role="tabpanel"
                  id={`${id}-panel-course`}
                  aria-labelledby={`${id}-tab-course`}
                  hidden={tab !== 'course'}
                >
                  <p className="text-sm text-gray-700 mb-3">
                    Đã học xong <strong>{doneCount}</strong>/{allLessons.length} bài.
                  </p>
                  {course.levels.map((level) => (
                    <section key={level.id} aria-labelledby={`${id}-lv-${level.id}`} className="mb-4">
                      <h3 id={`${id}-lv-${level.id}`} className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                        {level.name}
                      </h3>
                      <ol className="flex flex-col gap-1">
                        {level.lessons.map((l) => {
                          const here = l.id === currentId;
                          const done = isCompleted(l.id);
                          const state = here ? 'Đang học' : done ? 'Đã học xong' : 'Chưa học';
                          return (
                            <li key={l.id}>
                              <Link
                                href={l.href}
                                aria-current={here ? 'page' : undefined}
                                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-gray-50 ${here ? 'bg-gray-100' : ''}`}
                              >
                                <StatusIcon status={here ? 'current' : done ? 'done' : 'todo'} />
                                <span className="flex-1 min-w-0 text-gray-900">{l.name}</span>
                                <span className="text-xs text-gray-600 shrink-0">{state}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ol>
                    </section>
                  ))}
                </div>
              )}

              <div
                role="tabpanel"
                id={`${id}-panel-lesson`}
                aria-labelledby={tabs.length > 1 ? `${id}-tab-lesson` : undefined}
                aria-label={tabs.length > 1 ? undefined : label('lesson')}
                hidden={tab !== 'lesson'}
              >
                <p className="text-sm text-gray-700 mb-3">
                  Đã xem <strong>{stepsSeen}</strong>/{stepsTotal} bước của {noun}.
                </p>
                {sections.length === 0 ? (
                  <p className="text-sm text-gray-600">{noun[0].toUpperCase() + noun.slice(1)} này chưa chia thành các phần có tiêu đề.</p>
                ) : (
                  <ol className="flex flex-col gap-1">
                    {sections.map((s) => {
                      const state = s.status === 'done' ? 'Đã qua' : s.status === 'current' ? 'Đang ở đây' : 'Chưa tới';
                      const inner = (
                        <>
                          <StatusIcon status={s.status} />
                          <span className={`flex-1 min-w-0 ${s.status === 'todo' ? 'text-gray-600' : 'text-gray-900'}`}>{s.title}</span>
                          <span className="text-xs text-gray-600 shrink-0">{state}</span>
                        </>
                      );
                      return (
                        <li key={s.blockIndex}>
                          {s.status === 'todo' ? (
                            // Chưa mở tới thì không nhảy được (bài mở từng bước).
                            <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5">{inner}</div>
                          ) : (
                            <button
                              type="button"
                              aria-current={s.status === 'current' ? 'step' : undefined}
                              onClick={() => {
                                jumpTarget.current = onJump(s.blockIndex);
                                onClose();
                              }}
                              className={`w-full text-left flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-gray-50 ${s.status === 'current' ? 'bg-gray-100' : ''}`}
                            >
                              {inner}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      </FocusTrap>
    </>
  );
}

/** Biểu tượng chỉ để nhìn; trạng thái luôn có chữ đi kèm (không dựa vào màu). */
function StatusIcon({ status }: { status: 'done' | 'current' | 'todo' }) {
  if (status === 'done') return <Check className="w-5 h-5 text-green-700 shrink-0" aria-hidden="true" />;
  if (status === 'current') return <CircleDot className="w-5 h-5 text-gray-900 shrink-0" aria-hidden="true" />;
  return <Circle className="w-5 h-5 text-gray-500 shrink-0" aria-hidden="true" />;
}

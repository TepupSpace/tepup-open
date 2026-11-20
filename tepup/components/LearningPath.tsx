'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { LevelDisplay } from '@/lib/types/content';
import { useProgress } from '@/lib/contexts/ProgressContext';
import LessonNode from './LessonNode';
import LessonStartCard from './LessonStartCard';

interface LearningPathProps {
  levels: LevelDisplay[];
  courseSlug: string;
}

export default function LearningPath({ levels, courseSlug }: LearningPathProps) {
  /** Bài người học bấm chọn; chưa chọn thì thẻ đáy hiện bài đang học. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const startRef = useRef<HTMLAnchorElement>(null);
  const { isCompleted, getCurrentLessonIndex, isSkippingAhead, refreshProgress } = useProgress();
  const currentLessonRef = useRef<HTMLLIElement>(null);
  const hasScrolledRef = useRef(false);
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);

  // Refresh progress when component mounts to ensure latest data
  useEffect(() => {
    refreshProgress();
    // Mark progress as loaded after a small delay to ensure state is updated
    const timer = setTimeout(() => {
      setIsProgressLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [refreshProgress]);

  // Progress is keyed by the lesson id, not its slug: ids are immutable, so renaming
  // a lesson or its slug never orphans a learner's progress.
  const allLessonIds = useMemo(() => {
    const ids: string[] = [];
    for (const level of levels) {
      for (const lesson of level.lessons) {
        ids.push(lesson.id);
      }
    }
    return ids;
  }, [levels]);

  // Get current lesson index (first incomplete)
  const currentLessonIndex = getCurrentLessonIndex(allLessonIds);

  // Compute lesson states
  const getLessonState = (lessonId: string) => {
    const lessonIndex = allLessonIds.indexOf(lessonId);
    const completed = isCompleted('lesson', lessonId);
    const isCurrent = lessonIndex === currentLessonIndex;
    const skippingAhead = isSkippingAhead(lessonIndex, allLessonIds);
    return { completed, isCurrent, isSkippingAhead: skippingAhead };
  };

  // Active lesson is the current one (first incomplete)
  const activeLessonId = allLessonIds[currentLessonIndex] || null;

  // Scroll to current lesson when progress is loaded
  useEffect(() => {
    if (isProgressLoaded && currentLessonRef.current && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        // Cuộn mượt bằng JS không chịu quy tắc CSS prefers-reduced-motion: tự kiểm tra.
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        currentLessonRef.current?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'center',
        });
      }, 150);
    }
  }, [isProgressLoaded, currentLessonIndex]);

  const shownId = selectedId ?? activeLessonId ?? allLessonIds[0];
  const shownIndex = allLessonIds.indexOf(shownId);
  const shown = levels.flatMap((l) => l.lessons).find((l) => l.id === shownId);
  const shownState = (() => {
    const st = getLessonState(shownId);
    if (st.completed) return 'done' as const;
    if (shownId === activeLessonId) return 'go' as const;
    return st.isSkippingAhead ? ('ahead' as const) : ('idle' as const);
  })();

  // Vị trí so le của từng nút trong chương: giữa → trái → giữa → phải → …
  const OFFSETS = [0, -1, 0, 1];

  return (
    <div className="cp-path">
      {levels.map((level, levelIndex) => (
        <section key={level.id} className="cp-level" aria-labelledby={`cp-level-${level.id}`}>
          <header className="cp-level__head">
            <p className="cp-level__kicker">Chương {levelIndex + 1}</p>
            {/* h2: ngay dưới h1 tên khoá, không nhảy cấp */}
            <h2 id={`cp-level-${level.id}`} className="paper-serif">
              {level.name}
            </h2>
          </header>

          <ol className="cp-nodes">
            {level.lessons.map((lesson, lessonIndex) => {
              const state = getLessonState(lesson.id);
              const lessonWithState = { ...lesson, isCompleted: state.completed, isLocked: false };
              const isCurrentLesson = lesson.id === activeLessonId;
              return (
                <li
                  key={lesson.id}
                  ref={isCurrentLesson ? currentLessonRef : undefined}
                  style={{ ['--x' as string]: OFFSETS[lessonIndex % OFFSETS.length] }}
                  data-side={OFFSETS[lessonIndex % OFFSETS.length] > 0 ? 'right' : undefined}
                >
                  <LessonNode
                    lesson={lessonWithState}
                    isActive={isCurrentLesson}
                    isCurrent={state.isCurrent}
                    isSkippingAhead={state.isSkippingAhead}
                    isSelected={lesson.id === shownId}
                    onClick={() => {
                      setSelectedId(lesson.id);
                      // Đưa focus tới nút vào học của thẻ đáy (nội dung vừa đổi).
                      requestAnimationFrame(() => startRef.current?.focus({ preventScroll: true }));
                    }}
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {shown && (
        <LessonStartCard
          ref={startRef}
          title={shown.name}
          number={shownIndex + 1}
          href={`/courses/${courseSlug}/${shown.slug}`}
          state={shownState}
        />
      )}
    </div>
  );
}

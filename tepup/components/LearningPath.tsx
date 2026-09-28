'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { LevelDisplay, LessonDisplay } from '@/lib/types/content';
import { useProgress } from '@/lib/contexts/ProgressContext';
import LessonNode from './LessonNode';
import LessonPopup from './LessonPopup';

interface LearningPathProps {
  levels: LevelDisplay[];
  courseSlug: string;
}

export default function LearningPath({ levels, courseSlug }: LearningPathProps) {
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: LessonDisplay; isSkippingAhead: boolean } | null>(null);
  const { isCompleted, getCurrentLessonIndex, isSkippingAhead, refreshProgress } = useProgress();
  const currentLessonRef = useRef<HTMLDivElement>(null);
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
        currentLessonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 150);
    }
  }, [isProgressLoaded, currentLessonIndex]);

  return (
    <div className="relative">
      {levels.map((level, levelIndex) => (
        <div key={level.id} className="mb-12">
          {/* Level Header */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 text-center shadow-sm">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-wide">
              Cấp độ {levelIndex + 1}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{level.name}</h3>
          </div>

          {/* Lessons Path */}
          <div className="flex flex-col items-center gap-8">
            {level.lessons.map((lesson, lessonIndex) => {
              const state = getLessonState(lesson.id);
              // Create lesson with computed state
              const lessonWithState = {
                ...lesson,
                isCompleted: state.completed,
                isLocked: false, // All lessons are now unlocked
              };

              const isCurrentLesson = lesson.id === activeLessonId;

              return (
                <div
                  key={lesson.id}
                  className="relative"
                  ref={isCurrentLesson ? currentLessonRef : undefined}
                >
                  {/* Connector Line */}
                  {lessonIndex < level.lessons.length - 1 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-8 bg-gray-200" />
                  )}

                  {/* Zigzag positioning — độ lệch nhỏ lại trên màn hẹp, vì lệch
                      64px trên màn 390px đẩy nút gần sát mép phải. */}
                  <div
                    className={`
                      transform transition-transform
                      ${lessonIndex % 2 === 0 ? '' : 'translate-x-8 sm:translate-x-16'}
                    `}
                  >
                    <LessonNode
                      lesson={lessonWithState}
                      isActive={isCurrentLesson}
                      isCurrent={state.isCurrent}
                      isSkippingAhead={state.isSkippingAhead}
                      onClick={() => setSelectedLesson({ lesson: lessonWithState, isSkippingAhead: state.isSkippingAhead })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Lesson Popup */}
      {selectedLesson && (
        <LessonPopup
          lesson={selectedLesson.lesson}
          href={`/courses/${courseSlug}/${selectedLesson.lesson.slug}`}
          isSkippingAhead={selectedLesson.isSkippingAhead}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </div>
  );
}

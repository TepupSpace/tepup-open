'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import FolderCard from '@/components/courses-hub/FolderCard';
import { categoryColorStyle } from '@/lib/paper/category-colors';
import type { CourseDisplay } from '@/lib/types/content';

interface CategoryShelfProps {
  id: string;
  name: string;
  description?: string;
  /** Khoá màu preset của danh mục; giá trị lạ → xanh dương. */
  color: string;
  courses: CourseDisplay[];
}

/** Bước cuộn dự phòng (thẻ 220 + khe 32) khi chưa đo được thẻ. */
const FALLBACK_STEP = 252;

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.4697 5.46973C14.7626 5.17683 15.2374 5.17683 15.5303 5.46973C15.8232 5.76262 15.8232 6.23738 15.5303 6.53027L10.0605 12L15.5303 17.4697C15.8232 17.7626 15.8232 18.2374 15.5303 18.5303C15.2374 18.8232 14.7626 18.8232 14.4697 18.5303L8.46973 12.5303C8.17683 12.2374 8.17683 11.7626 8.46973 11.4697L14.4697 5.46973Z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8.46973 5.46973C8.76262 5.17683 9.23738 5.17683 9.53027 5.46973L15.5303 11.4697C15.8232 11.7626 15.8232 12.2374 15.5303 12.5303L9.53027 18.5303C9.23738 18.8232 8.76262 18.8232 8.46973 18.5303C8.17683 18.2374 8.17683 17.7626 8.46973 17.4697L13.9395 12L8.46973 6.53027C8.17683 6.23738 8.17683 5.76262 8.46973 5.46973Z" />
    </svg>
  );
}

/**
 * Một danh mục trên /courses (design demo-course-stories, `.shelf`): tên + mô tả,
 * cặp nút ‹ › cuộn hàng đúng một thẻ, rồi hàng folder cuộn ngang trên dải nền loang
 * màu danh mục. Nút ở đầu/cuối dùng `aria-disabled` (không `disabled`) để focus
 * không rơi mất khi vừa bấm tới mép.
 */
export default function CategoryShelf({ id, name, description, color, courses }: CategoryShelfProps) {
  const rowRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const headingId = `ch-cat-${id}`;

  const sync = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setCanPrev(row.scrollLeft > 1);
    setCanNext(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    sync();
    row.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      row.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  function scrollByCard(dir: -1 | 1) {
    const row = rowRef.current;
    if (!row) return;
    if (dir < 0 ? !canPrev : !canNext) return;
    const first = row.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    const step = first ? first.offsetWidth + gap : FALLBACK_STEP;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' });
  }

  return (
    <section className="ch-cat" style={categoryColorStyle(color)} aria-labelledby={headingId}>
      <div className="ch-cat__top">
        <div className="ch-cat__title">
          <h3 id={headingId} className="paper-serif">
            {name}
          </h3>
          {description && <p>{description}</p>}
        </div>
        <div className="ch-pager">
          <button
            type="button"
            aria-label="Khoá trước"
            aria-controls={`${headingId}-row`}
            aria-disabled={!canPrev || undefined}
            onClick={() => scrollByCard(-1)}
          >
            <ChevronLeft />
          </button>
          <span className="ch-pager__sep" aria-hidden="true" />
          <button
            type="button"
            aria-label="Khoá tiếp theo"
            aria-controls={`${headingId}-row`}
            aria-disabled={!canNext || undefined}
            onClick={() => scrollByCard(1)}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="ch-cat__stage">
        <div className="ch-cat__panel" aria-hidden="true" />
        <ul ref={rowRef} id={`${headingId}-row`} className="ch-cat__row">
          {courses.map((course) => (
            <FolderCard
              key={course.slug}
              title={course.name}
              imageUrl={course.imageUrl}
              isNew={course.isNew}
              href={`/courses/${course.slug}`}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

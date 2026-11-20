import type { ReactNode } from 'react';
import CategoryShelf from '@/components/courses-hub/CategoryShelf';
import type { CourseDisplay } from '@/lib/types/content';

export interface CourseShelfGroup {
  id: string;
  /** Tên danh mục, thành tiêu đề Fraunces của kệ. */
  label: string;
  /** Một dòng mô tả dưới tên danh mục. */
  description?: string;
  /** Khoá màu preset do admin chọn (lib/paper/category-colors.ts). */
  color?: string;
  courses: CourseDisplay[];
}

interface CourseShelfProps {
  /** Dùng cho id của tiêu đề, để `aria-labelledby` trỏ đúng. */
  id: string;
  /** Phần cần nhấn mạnh đặt trong `<em>`. */
  title: ReactNode;
  description?: string;
  groups: CourseShelfGroup[];
}

/**
 * Khối "Học qua Chuyên đề" ở /courses: tiêu đề lớn căn giữa, rồi mỗi danh mục là
 * một kệ folder mang màu riêng của danh mục (design demo-course-stories, `.shelf`).
 */
export default function CourseShelf({ id, title, description, groups }: CourseShelfProps) {
  const shown = groups.filter((g) => g.courses.length > 0);
  if (shown.length === 0) return null;
  const headingId = `ch-shelf-${id}`;

  return (
    <section className="ch-topics" aria-labelledby={headingId}>
      <div className="paper-head ch-topics__head">
        <h2 id={headingId} className="paper-serif">
          {title}
        </h2>
        {description && <p>{description}</p>}
      </div>

      {shown.map((group) => (
        <CategoryShelf
          key={group.id}
          id={group.id}
          name={group.label}
          description={group.description}
          color={group.color ?? 'blue'}
          courses={group.courses}
        />
      ))}
    </section>
  );
}

import type { ReactNode } from 'react';
import Link from '@/components/ui/AppLink';
import type { CourseDisplay } from '@/lib/types/content';

/** Màu xoay vòng theo thứ tự nhóm: xanh → tím → hồng. */
const TONES = ['blue', 'purple', 'pink'] as const;

export interface CourseShelfGroup {
  id: string;
  /** Nhãn nhỏ đặt trên dải thẻ, kiểu nhãn dán trên kệ sách. */
  label: string;
  /** Một dòng mô tả nằm trong nhãn, dưới tên nhóm. */
  description?: string;
  courses: CourseDisplay[];
}

interface CourseShelfProps {
  /** Dùng cho id của tiêu đề, để `aria-labelledby` trỏ đúng. */
  id: string;
  /** Phần cần nhấn mạnh đặt trong `<em>` để lấy màu của kệ. */
  title: ReactNode;
  description?: string;
  groups: CourseShelfGroup[];
}

/** Một khối ở /courses: tiêu đề lớn, rồi từng nhóm khoá học có nhãn riêng trên nền loang màu. */
export default function CourseShelf({ id, title, description, groups }: CourseShelfProps) {
  const shown = groups.filter((g) => g.courses.length > 0);
  if (shown.length === 0) return null;
  const headingId = `ch-shelf-${id}`;

  return (
    <section className="ch-shelf ch-shelf--blue" aria-labelledby={headingId}>
      <div className="ch-shelf__head">
        <h2 id={headingId} className="ch-serif">
          {title}
        </h2>
        {description && <p>{description}</p>}
      </div>

      {shown.map((group, i) => {
        const labelId = `ch-group-${group.id}`;
        return (
          <div
            key={group.id}
            className={`ch-shelf__group ch-shelf--${TONES[i % TONES.length]}`}
            role="group"
            aria-labelledby={labelId}
          >
            <div className="ch-shelf__label">
              <h3 id={labelId}>{group.label}</h3>
              {group.description && <p>{group.description}</p>}
            </div>

            <div className="ch-shelf__stage">
              <ul className="ch-shelf__row">
                {group.courses.map((course) => (
                  <li key={course.slug} className="ch-course">
                    <Link
                      className={`ch-course__card${course.imageUrl ? '' : ' ch-course__card--blank'}`}
                      href={`/courses/${course.slug}`}
                    >
                      {course.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- ảnh bìa 220×280 từ Supabase Storage
                        <img src={course.imageUrl} alt="" loading="lazy" />
                      )}
                      <span className="ch-course__title ch-serif">{course.name}</span>
                    </Link>
                    {course.isNew && <span className="ch-course__badge">Mới</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </section>
  );
}

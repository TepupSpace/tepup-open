import Link from '@/components/ui/AppLink';
import type { CategoryDisplay } from '@/lib/types/content';

/** Màu xoay vòng theo thứ tự danh mục: xanh → tím → hồng. */
const TONES = ['blue', 'purple', 'pink'] as const;

interface CourseShelfProps {
  category: CategoryDisplay;
  index: number;
}

/** Một kệ danh mục ở /courses: tiêu đề + dải thẻ ảnh bìa trên nền loang màu. */
export default function CourseShelf({ category, index }: CourseShelfProps) {
  if (category.courses.length === 0) return null;
  const tone = TONES[index % TONES.length];

  return (
    <section className={`ch-shelf ch-shelf--${tone}`} aria-labelledby={`ch-cat-${category.slug}`}>
      <div className="ch-shelf__head">
        <h2 id={`ch-cat-${category.slug}`} className="ch-serif">
          <em>{category.name}</em>
        </h2>
        {category.description && <p>{category.description}</p>}
      </div>

      <div className="ch-shelf__stage">
        <ul className="ch-shelf__row">
          {category.courses.map((course) => (
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
    </section>
  );
}

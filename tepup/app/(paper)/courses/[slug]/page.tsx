import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GraduationCap, Layers } from 'lucide-react';
import BackButton from '@/components/BackButton';
import LearningPath from '@/components/LearningPath';
import FolderCard from '@/components/courses-hub/FolderCard';
import { getCourseBySlug } from '@/lib/services/content-service';
import { categoryColorStyle } from '@/lib/paper/category-colors';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import RelatedStories, { RelatedStoriesSkeleton } from '@/components/RelatedStories';
import CourseCredits from '@/components/learn/CourseCredits';

// ISR. Trước đây `.next/prerender-manifest.json` có `dynamicRoutes: {}` — nghĩa là
// mọi route nội dung đều SSR lại từ đầu ở mỗi lượt xem, không hề có cache CDN.
// Người đầu tiên trả giá, những người sau ăn cache. An toàn vì các route này
// không đọc cookie/header, và admin lưu bài sẽ xoá cache ngay.
export const revalidate = 300;

/**
 * Mảng rỗng = không prerender sẵn đường nào lúc build (nội dung nằm ở DB, không
 * muốn build phụ thuộc vào nó), nhưng vẫn ĐĂNG KÝ route này là ISR: lượt xem đầu
 * tiên render rồi được cache, những lượt sau ăn cache.
 *
 * Cần thiết vì `export const revalidate` một mình không đủ — không có hàm này thì
 * `prerender-manifest.json` để `dynamicRoutes: {}` và route SSR lại từ đầu ở mỗi
 * lượt xem, không có cache CDN nào.
 */
export async function generateStaticParams() {
  return [];
}


interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

// Tiêu đề riêng cho từng trang: trình thông báo route của Next chỉ đọc khi
// document.title đổi. Hàm lấy dữ liệu đã được cache nên không tốn thêm query.
export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return course ? { title: `${course.name} | Tepup` } : {};
}

/**
 * Trang chi tiết khoá học, giao diện giấy (course.css): cột trái là folder bìa + giới
 * thiệu (màu theo danh mục), cột phải là lộ trình các chương, câu chuyện liên quan và
 * tác giả. Server render giống nhau cho mọi người; trạng thái học do LearningPath tính
 * ở client từ localStorage.
 */
export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  // Chỉ chờ đúng thứ dựng nên nửa trên màn hình. Truyện liên quan nằm dưới lộ
  // trình học và cần thêm một vòng query nhân vật, nên để nó stream vào sau.
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <>
      <div className="paper-backrow">
        <BackButton variant="paper" fallbackUrl="/courses" label="Khoá học" />
      </div>
      <main id="main-content" className="cp" style={categoryColorStyle(course.categoryColor)}>
        <aside className="cp-side" aria-label="Giới thiệu khoá học">
          {/* Bìa folder trang trí (tên khoá đã có ở h1 bên cạnh): FolderCard không có href thì aria-hidden.
              Chỉ khi khoá có ảnh bìa: không có thì folder chỉ là một tờ giấy trắng trơn. */}
          {isAllowedMediaUrl(course.imageUrl) && (
            <div className="cp-cover">
              <FolderCard as="div" title={course.name} imageUrl={course.imageUrl} isNew={course.isNew} />
            </div>
          )}
          <div className="cp-info">
            {course.categoryName && <p className="cp-kicker">{course.categoryName}</p>}
            <h1 className="paper-serif">{course.name}</h1>
            {course.description && <p className="cp-desc">{course.description}</p>}
            <ul className="cp-stats">
              <li>
                <GraduationCap aria-hidden="true" />
                {course.lessonsCount} bài học
              </li>
              <li>
                <Layers aria-hidden="true" />
                {course.levels.length} chương
              </li>
            </ul>
          </div>
        </aside>

        <div className="cp-main">
          <LearningPath levels={course.levels} courseSlug={course.slug} />

          {/* Phần bổ trợ, sau lộ trình học: trên mobile không chen giữa giới thiệu và danh sách bài. */}
          <Suspense fallback={<RelatedStoriesSkeleton />}>
            <RelatedStories courseSlug={slug} />
          </Suspense>

          {/* Tác giả, người đóng góp, người thẩm định (cached, giống nhau cho mọi người xem). */}
          <CourseCredits courseId={course.id} />
        </div>
      </main>
    </>
  );
}

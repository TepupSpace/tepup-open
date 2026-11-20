import StoryBook from '@/components/paper/StoryBook';
import { toBookCharacters } from '@/components/paper/book-data';
import CourseShelf from '@/components/courses-hub/CourseShelf';
import { getCategories, getCharacters } from '@/lib/services/content-service';
import InstallPrompt from '@/components/pwa/InstallPrompt';

// Trang hub được vào nhiều nhất, mà cả hai query của nó đều đã cache — `force-dynamic`
// khiến mỗi lượt xem là một lượt render mới kèm round-trip tới DB ở Singapore.
// Bỏ được là nhờ admin lưu nội dung sẽ gọi `revalidateContent()` xoá cache ngay.
export const revalidate = 300;

export default async function CoursesPage() {
  const [categories, characters] = await Promise.all([
    getCategories(),
    getCharacters(),
  ]);
  // Trang chỉ có hai khối: Câu chuyện và Chuyên đề. Mỗi danh mục trong DB là một
  // nhóm có nhãn nhỏ bên trong khối Chuyên đề, không phải một khối riêng.
  const groups = categories.map((c) => ({
    id: c.slug,
    label: c.name,
    description: c.description,
    color: c.color,
    courses: c.courses,
  }));

  return (
    <main id="main-content" className="ch-main">
      {/* Tiêu đề trang chỉ cho trình đọc màn hình: trang mở thẳng vào khối Câu chuyện. */}
      <h1 className="sr-only">Khoá học</h1>

      <div className="ch-shell ch-sections">
        {characters.length > 0 && (
          <section className="sb-stories" aria-labelledby="hoc-qua-cau-chuyen">
            <div className="paper-head">
              <h2 id="hoc-qua-cau-chuyen" className="paper-serif">
                Học qua <em>Câu chuyện</em>
              </h2>
              <p>Khám phá kiến thức qua hành trình của các nhân vật</p>
            </div>
            {/* Ảnh nhân vật lọc qua isAllowedMediaUrl ở server (toBookCharacters). */}
            <StoryBook characters={toBookCharacters(characters)} mode="list" />
          </section>
        )}

        <CourseShelf
          id="chuyen-de"
          title={<>Học qua <em>Chuyên đề</em></>}
          description="Đi sâu vào từng chủ đề qua các bài học ngắn, tương tác"
          groups={groups}
        />

        {/* Đặt ở cuối trang thay vì làm thanh chắn ngang màn hình: người đã cuộn tới
            đây là người đang thật sự tìm khoá học. Component tự ẩn khi đã cài, khi
            người dùng từng tắt đi, hoặc khi nền tảng không hỗ trợ cài đặt. */}
        <InstallPrompt />
      </div>
    </main>
  );
}

import StoryShowcase from '@/components/courses-hub/StoryShowcase';
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
    courses: c.courses,
  }));

  return (
    <main id="main-content" className="ch-main">
      <div className="ch-pagehead">
        <h1 className="ch-serif">Khoá học</h1>
        <p>Khám phá các khoá học của Tépup</p>
      </div>

      <div className="ch-shell ch-sections">
        <StoryShowcase characters={characters} />

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

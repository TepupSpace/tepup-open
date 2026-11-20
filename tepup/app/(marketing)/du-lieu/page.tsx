import type { Metadata } from 'next';
import Link from '@/components/ui/AppLink';
import { ShieldCheck } from 'lucide-react';
import OpenPrivacySettings from '@/components/analytics/OpenPrivacySettings';

/**
 * Trang công khai: Tepup thu thập gì (CLAUDE.md › Analytics). Chỉ nêu các DẠNG dữ liệu,
 * không liệt kê từng event. Thêm event thuộc một dạng mới → sửa trang này cùng commit.
 * Nội dung phải khớp đúng những gì lib/analytics/schema.ts cho phép gửi.
 */
export const metadata: Metadata = {
  title: 'Tepup thu thập dữ liệu gì — Tepup',
  description:
    'Tepup đếm số liệu ẩn danh để đánh giá chất lượng khoá học và sửa lỗi. Không IP, không tài khoản, không nội dung bạn gõ.',
};

const COLLECTED: { title: string; body: string }[] = [
  {
    title: 'Hoạt động học',
    body: 'Bạn mở bài hay chương nào, học xong chưa, dừng ở phần nào, và trả lời câu hỏi đúng hay sai.',
  },
  {
    title: 'Số đếm tổng',
    body: 'Số lượt hoàn thành bài, chương và cả khoá, và số người chọn mỗi đáp án. Chỉ cộng vào con số chung, không gắn với mã nào, và vẫn được gửi khi bạn tắt “Đóng góp số liệu ẩn danh”.',
  },
  {
    title: 'Cách dùng tính năng',
    body: 'Bạn có mở thư viện tham chiếu, gửi câu hỏi cho trợ lý AI (chỉ đếm lượt gửi, không gửi nội dung bạn gõ), hay đổi cài đặt đọc không.',
  },
  {
    title: 'Lỗi kỹ thuật',
    body: 'Trang hoặc phần nào bị lỗi và loại lỗi, đã lược bỏ mọi chi tiết có thể là thông tin của bạn.',
  },
  {
    title: 'Thông tin chung về thiết bị',
    body: 'Quốc gia, loại thiết bị (điện thoại, máy tính bảng, máy tính) và loại trình duyệt. Không có thành phố hay vị trí chi tiết.',
  },
  {
    title: 'Một mã ngẫu nhiên',
    body: 'Trình duyệt của bạn tự tạo một mã ngẫu nhiên, tự đổi sau 30 ngày, để biết các lượt học có nối tiếp nhau không. Kèm theo là nhóm thô như “lần đầu” hay “quay lại sau một tuần”. Mã mới không nối được với mã cũ.',
  },
];

const NOT_COLLECTED = [
  'Địa chỉ IP',
  'Tên, email, tài khoản',
  'Nội dung bạn gõ (câu hỏi cho AI, góp ý)',
  'Vị trí chi tiết',
  'Cookie quảng cáo hay công cụ theo dõi của bên khác',
];

export default function DataPage() {
  return (
    // Khung giấy (PaperShell, theme sáng cố định) như trang hướng dẫn đóng góp; màu nhấn: ../guide.css.
    // .paper xoá margin của p/h1–h3, chỉ khôi phục mb-*, nên khoảng cách ở đây dùng mb-* và gap.
    <div className="guide guide--accent">
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-2xl mb-4">
            <ShieldCheck className="w-7 h-7 text-teal-700" aria-hidden="true" />
          </div>
          <h1 className="paper-serif text-4xl text-gray-900 mb-3">Tepup thu thập dữ liệu gì?</h1>
          <p className="text-lg text-gray-700">
            Tepup đếm một số số liệu ẩn danh để <strong>đánh giá chất lượng khoá học</strong> (bài nào được học
            xong, người học dừng ở đâu, câu nào khó) và <strong>sửa lỗi</strong>. Việc này{' '}
            <strong>không làm lộ danh tính</strong> của bạn, và không dùng để nhận diện bạn.
          </p>
        </div>

        <section aria-labelledby="collected" className="mb-10">
          <h2 id="collected" className="paper-serif text-2xl text-gray-900 mb-4">
            Những gì được ghi lại
          </h2>
          <ul className="flex flex-col gap-3">
            {COLLECTED.map((c) => (
              <li key={c.title} className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-gray-700">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="not-collected" className="mb-10">
          <h2 id="not-collected" className="paper-serif text-2xl text-gray-900 mb-4">
            Những gì Tepup không thu thập
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <ul className="list-disc pl-6 flex flex-col gap-1 text-gray-700">
              {NOT_COLLECTED.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="keep" className="mb-10">
          <h2 id="keep" className="paper-serif text-2xl text-gray-900 mb-4">
            Lưu ở đâu, bao lâu
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-gray-700 mb-3">
              Số liệu nằm trong cơ sở dữ liệu của chính Tepup, không gửi cho bên thứ ba nào. Số liệu chi tiết được
              xoá sau 1 năm; chỉ các con số tổng được giữ lại. Thời điểm bắt đầu mỗi lượt học chỉ được ghi đến giờ,
              không đến phút.
            </p>
            <p className="text-gray-700">Tiến độ học của bạn vẫn chỉ nằm trên máy bạn, như trước đây.</p>
          </div>
        </section>

        <section aria-labelledby="turn-off" className="mb-10">
          <h2 id="turn-off" className="paper-serif text-2xl text-gray-900 mb-4">
            Cách tắt
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-gray-700 mb-3">
              Bấm nút <strong>⚙ Cài đặt</strong> ở góc trên bên phải, mục <strong>Quyền riêng tư</strong>, rồi tắt{' '}
              <strong>“Đóng góp số liệu ẩn danh”</strong>. Khi tắt, Tepup không gửi gì có mã nữa và xoá mã trên máy bạn; chỉ còn cộng vào
              các số đếm tổng và báo lỗi, đều không gắn mã.
            </p>
            <p className="mb-3">
              <OpenPrivacySettings className="bg-teal-600 hover:bg-teal-700 rounded-full px-5 py-2.5 text-sm font-semibold" />
            </p>
            <p className="text-gray-700">
              Nếu trình duyệt của bạn bật <strong>Global Privacy Control</strong>, Tepup tự coi như bạn đã tắt.
            </p>
          </div>
        </section>

        <p>
          <Link href="/courses" className="text-teal-700 underline underline-offset-2 hover:text-teal-800">
            Về trang khoá học
          </Link>
        </p>
      </main>
    </div>
  );
}

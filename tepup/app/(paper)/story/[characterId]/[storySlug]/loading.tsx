/**
 * Chờ tải trang chi tiết câu chuyện: giữ nền giấy trống (không khung xương kiểu cũ),
 * vì trang tự chạy hiệu ứng vào khi hiện ra.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh]" role="status">
      <span className="sr-only">Đang tải câu chuyện…</span>
    </div>
  );
}

import '@/components/learn/player-paper.css';

/**
 * Màn chờ của trang học: chỉ nền giấy, không khung xương.
 *
 * Trang học mở bằng Screen 1 (tem + tên, không thanh trên), và khi đi từ trang câu
 * chuyện thì tem đang bay ở tâm màn. Một khung xương có thanh trên/nút dưới ở đây sẽ
 * nháy lên giữa hai cảnh đó, nên màn chờ chỉ giữ nền giấy cùng màu và báo cho trình
 * đọc màn hình biết đang tải.
 */
export default function PlayerSkeleton() {
  return (
    <div className="reader pl">
      <p role="status" className="sr-only">
        Đang mở bài học…
      </p>
    </div>
  );
}

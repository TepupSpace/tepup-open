/** Liên kết tới bài/chương kế tiếp, hiện ở chân trình phát khi người học xong bài. */
export interface NextItemLink {
  href: string;
  title: string;
}

/**
 * Phần tử đứng ngay sau `currentId` trong danh sách đã xếp thứ tự, hoặc null nếu
 * đó là phần tử cuối hay không có trong danh sách (vd. bài đang ẩn mà staff xem).
 */
export function itemAfter<T extends { id: string }>(ordered: T[], currentId: string): T | null {
  const i = ordered.findIndex((item) => item.id === currentId);
  return i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : null;
}

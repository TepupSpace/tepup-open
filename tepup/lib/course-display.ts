/**
 * Số chương hiện cho người học trên trang khoá học.
 *
 * Mặc định chương đầu là "Chương 1". Khoá nào có "Chương 0 - Mở đầu" trong danh sách bài
 * (Critical Thinking 101, theo docs/content-course-Critical-Thinking-101/02.lesson-list.md)
 * thì đếm từ 0, để số trên trang khớp với số các bài nhắc tới nhau ("ở Chương 1…").
 * Danh sách theo slug: đổi slug của khoá thì sửa ở đây.
 */
const CHAPTERS_FROM_ZERO = new Set(['critical-thinking-101']);

/** `levelIndex` là vị trí (từ 0) của chương trong khoá. */
export function chapterNumber(courseSlug: string, levelIndex: number): number {
  return CHAPTERS_FROM_ZERO.has(courseSlug) ? levelIndex : levelIndex + 1;
}

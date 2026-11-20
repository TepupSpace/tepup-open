import { permanentRedirect } from 'next/navigation';

/**
 * Thư viện chuyển sang /thu-vien (Phương án B, docs/design-reference-library.md §7.4):
 * tài liệu cũ giờ là chủ đề/nguồn/bài đọc trong cùng một thư viện, duyệt theo lĩnh vực.
 * Giữ đường dẫn cũ cho link đã chia sẻ và trang đánh dấu.
 */
export default function LibraryPage() {
  permanentRedirect('/thu-vien');
}

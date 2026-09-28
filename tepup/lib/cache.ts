/**
 * Tag cache và các hàm xoá cache dùng chung.
 *
 * Trước đây toàn bộ cache chỉ hết hạn theo TTL 60 giây, không có chỗ nào gọi
 * `revalidateTag`. Nghĩa là admin sửa bài xong phải ngồi chờ. Ngay khi TTL được
 * nâng lên (hoặc trang chuyển sang ISR) thì cách đó không dùng được nữa — nên
 * việc xoá cache tường minh phải đi cùng với việc cache lâu hơn.
 *
 * Cố tình dùng tag thô. Các route admin định danh theo id chứ không theo slug,
 * nên tag hẹp sẽ phải tra ngược DB chỉ để dựng tên tag. Xoá rộng hơn cần thiết
 * một chút vẫn đúng, và rẻ hơn nhiều so với việc xoá sót.
 */

import { revalidateTag } from 'next/cache';

/** Khoá học, chương, bài, truyện, nhân vật, danh mục. */
export const CONTENT_TAG = 'content';

/** Tài liệu thư viện — vòng đời tách riêng khỏi nội dung khoá học. */
export const LIBRARY_TAG = 'library';

/**
 * Gọi sau MỌI mutation nội dung thành công ở phía admin.
 *
 * Next 16 bắt buộc truyền profile cho `revalidateTag`. Dùng `'max'` = hết hạn
 * ngay lập tức; đó chính là điều mong muốn ở đây, vì admin bấm Lưu xong là muốn
 * thấy thay đổi liền. (`updateTag` chỉ gọi được từ Server Action, còn đây là các
 * route handler.)
 */
export function revalidateContent() {
  revalidateTag(CONTENT_TAG, 'max');
}

/** Gọi sau mọi mutation tài liệu thư viện thành công. */
export function revalidateLibrary() {
  revalidateTag(LIBRARY_TAG, 'max');
}

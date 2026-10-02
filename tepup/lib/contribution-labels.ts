/**
 * Vietnamese labels for contribution and review enums, so pages never show raw values
 * like "CHANGES_REQUESTED". Pure: safe in client and server components.
 */

export const REVIEW_ACTION_LABEL: Record<string, string> = {
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CHANGES_REQUESTED: 'Yêu cầu chỉnh sửa',
};

export function reviewActionLabel(action: string): string {
  return REVIEW_ACTION_LABEL[action] ?? action;
}

/**
 * What the reviewer's "approve" button really does (`publishContribution`):
 * a NEW_COURSE becomes a HIDDEN course that an admin still has to activate, while an
 * EDIT_LESSON_CONTENT goes straight into the live lesson.
 */
export function approveActionText(type: string): { label: string; hint: string } {
  if (type === 'EDIT_LESSON_CONTENT') {
    return {
      label: 'Duyệt và cập nhật bài học',
      hint: 'Nội dung mới thay ngay nội dung bài học đang hiển thị cho người học.',
    };
  }
  return {
    label: 'Duyệt (tạo khóa học ẩn)',
    hint:
      'Khóa học được tạo ở trạng thái ẩn. Người học chưa thấy cho tới khi quản trị viên kích hoạt nó trong Quản trị → Khóa học.',
  };
}

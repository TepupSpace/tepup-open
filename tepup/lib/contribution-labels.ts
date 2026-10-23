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
  if (type === 'EDIT_CHAPTER_CONTENT') {
    return {
      label: 'Duyệt và cập nhật chương truyện',
      hint: 'Nội dung mới thay ngay nội dung chương đang hiển thị cho người đọc.',
    };
  }
  if (type === 'EDIT_LIBRARY_ENTRY') {
    return {
      label: 'Duyệt và cập nhật mục thư viện',
      hint: 'Tiêu đề, phần xem nhanh, thân bài, thông tin mô tả và liên kết của mục được thay ngay. Đường dẫn, loại mục và trạng thái hiển thị giữ nguyên.',
    };
  }
  if (type === 'EDIT_COURSE') {
    return {
      label: 'Duyệt và cập nhật mục lục khóa học',
      hint: 'Tên, thứ tự cấp độ và bài học đổi ngay. Bài học mới được tạo ở trạng thái ẩn, chưa có nội dung.',
    };
  }
  return {
    label: 'Duyệt (tạo khóa học ẩn)',
    hint:
      'Khóa học được tạo ở trạng thái ẩn. Người học chưa thấy cho tới khi quản trị viên kích hoạt nó trong Quản trị → Khóa học.',
  };
}

/** Every ContributionType, in Vietnamese (review queues, dashboards, submissions). */
export const TYPE_LABELS: Record<string, string> = {
  NEW_COURSE: 'Khóa học mới',
  NEW_LEVEL: 'Cấp độ mới',
  NEW_LESSON: 'Bài học mới',
  EDIT_LESSON_CONTENT: 'Chỉnh sửa bài học',
  EDIT_COURSE: 'Chỉnh sửa dàn bài khóa học',
  EDIT_CHAPTER_CONTENT: 'Chỉnh sửa chương truyện',
  EDIT_LIBRARY_ENTRY: 'Chỉnh sửa mục thư viện',
};

export function contributionTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

/** Course roles (CourseMember.role) in Vietnamese. */
export const COURSE_ROLE_LABEL: Record<string, string> = {
  COURSE_LEAD: 'Trưởng khóa học',
  TRUSTED_REVIEWER: 'Người duyệt tin cậy',
};

/** Trusted reviewer disclosure levels (proposal §6.14a), short labels. */
export const DISCLOSURE_LABEL: Record<string, string> = {
  NONE: 'Không hiển thị',
  ANONYMOUS: 'Ẩn danh',
  CREDENTIAL: 'Chuyên môn (không tên)',
  FULL: 'Tên và chuyên môn',
};

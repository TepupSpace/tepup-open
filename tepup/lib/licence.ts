/**
 * Content licence for contributions (proposal §6.11). CC BY-SA 4.0 is confirmed; the exact
 * Vietnamese consent wording is still being drafted by the organisation, so the texts below
 * are a DRAFT. Changing the wording in substance means a new LICENCE_VERSION.
 *
 * Pure: safe in client and server components.
 */

/** Stored on User.licenceVersion and Contribution.licenceVersion. */
export const LICENCE_VERSION = 'CC-BY-SA-4.0/2026-10';

export const LICENCE_NAME = 'CC BY-SA 4.0';
export const LICENCE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.vi';

/** Three-line summary shown above the sign-up checkbox. DRAFT wording. */
export const LICENCE_SUMMARY: readonly string[] = [
  'Nội dung bạn đóng góp được phát hành theo giấy phép CC BY-SA 4.0: ai cũng được chia sẻ và chỉnh sửa, miễn là ghi công và giữ cùng giấy phép.',
  'Bạn xác nhận nội dung do chính bạn viết, hoặc lấy từ nguồn tương thích với giấy phép này, hoặc là trích dẫn ngắn có ghi nguồn.',
  'Người khác có thể sửa nội dung của bạn trên TepUp. Bạn chọn cách được ghi công: tên tài khoản hoặc một bút danh ngẫu nhiên.',
];

export const LICENCE_CHECKBOX_LABEL = 'Tôi đồng ý phát hành nội dung đóng góp theo giấy phép CC BY-SA 4.0';

/** One line above "Gửi duyệt". */
export const LICENCE_SUBMIT_NOTE = 'Nội dung được phát hành theo giấy phép CC BY-SA 4.0.';

/** Footer line on every public page (same for every visitor: cache-safe). */
export const LICENCE_FOOTER = 'Nội dung: CC BY-SA 4.0 · Những người đóng góp cho TepUp';

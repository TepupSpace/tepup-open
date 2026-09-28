/**
 * Ngưỡng độ dài cho các block tương tác.
 *
 * Con số đến từ phép đo trên màn 390px: sau khi trừ đệm khung và đệm thẻ, mỗi ô
 * Nối cặp chỉ còn ~151px chiều rộng chữ, tức ~21 ký tự một dòng ở cỡ `text-sm`.
 * Vượt các mốc dưới đây thì thẻ bắt đầu cao quá và hai cột lệch nhau trông thấy.
 *
 * Editor dùng để cảnh báo tác giả; `scripts/audit-block-limits.ts` dùng để rà
 * nội dung đã nằm trong database. Cả hai đọc chung một nguồn để không trôi khỏi nhau.
 */

export const PAIR_MATCH_LIMITS = {
  /** Vế trái là nhãn — hai dòng là vừa. */
  left: 50,
  /** Vế phải là định nghĩa — bốn dòng là trần chịu được. */
  right: 90,
  /**
   * Bề rộng chữ của một ô trên màn 390px, quy ra số ký tự tiếng Việt mỗi dòng.
   * Dùng để ước lượng chiều cao thẻ từ độ dài chuỗi.
   */
  charsPerLine: 21,
  /**
   * Chênh bao nhiêu dòng thì bắt đầu trông lệch.
   *
   * Cố ý đo bằng số dòng chứ không bằng tỉ lệ ký tự. Tỉ lệ đánh giá sai cả hai phía:
   * nhãn "Thuế" (4 ký tự) cạnh bất kỳ định nghĩa nào cũng vượt mọi ngưỡng tỉ lệ, dù
   * 1 dòng cạnh 4 dòng là chuyện bình thường; ngược lại hai vế dài 60 và 90 ký tự có
   * tỉ lệ đẹp nhưng vẫn là 3 dòng cạnh 5 dòng. Khoảng trắng người học nhìn thấy là
   * hiệu số dòng, nên đó mới là thứ đáng đo.
   */
  maxLineGap: 3,
} as const;

/** Số dòng một chuỗi chiếm trong một ô Nối cặp trên điện thoại. */
export function estimateLines(text: string): number {
  return Math.max(1, Math.ceil(text.length / PAIR_MATCH_LIMITS.charsPerLine));
}

export const FLIP_CARD_LIMITS = {
  /** Mỗi mặt thẻ. Vượt mốc này thì thẻ chạm trần 300px và phải cuộn bên trong. */
  face: 200,
} as const;

/** Vế phải cao hơn vế trái nhiều dòng đến mức thẻ ngắn bị kéo giãn trông thấy. */
export function isPairLopsided(left: string, right: string): boolean {
  return pairLineGap(left, right) > PAIR_MATCH_LIMITS.maxLineGap;
}

/** Số dòng trắng mà vế ngắn hơn phải chịu khi bị kéo giãn cho bằng vế kia. */
export function pairLineGap(left: string, right: string): number {
  return Math.abs(estimateLines(right) - estimateLines(left));
}

/**
 * Bàn giao "tem bay" giữa trang chi tiết câu chuyện và player (client-only).
 *
 * Hợp đồng vị trí: trang chi tiết tự chạy hiệu ứng (tem rút khỏi folder, trượt
 * về giữa, xoay thẳng, thả viền thẻ trắng) và dừng với TÂM tem đúng TÂM viewport,
 * cạnh = `introStampSize()`, rồi mới `router.push`. Player đọc cờ lúc mount:
 *  - có cờ → vẽ tem ngay tại tâm viewport (không fade), rồi trượt nó lên chỗ của
 *    nó trong Screen 1 (FLIP) trong lúc tên chương hiện dần;
 *  - không có (vào thẳng URL, bài học khoá) → Screen 1 fade vào như bình thường.
 *
 * Biến cấp module sống qua điều hướng phía client của Next (cùng một bundle),
 * và tự mất khi tải lại trang — đúng ý: tải lại thì không có tem nào đang bay.
 */

export interface StampHandoff {
  /** URL player sẽ mở; player chỉ nhận cờ nếu khớp pathname của nó. */
  href: string;
  /** Ảnh tem đang bay (theo trạng thái folder). */
  stampSrc: string;
  at: number;
}

let pending: StampHandoff | null = null;

/** Hết hạn sau ngần này ms: phòng khi điều hướng bị huỷ giữa chừng. */
const TTL_MS = 4000;

export function setStampHandoff(h: Omit<StampHandoff, 'at'>): void {
  pending = { ...h, at: Date.now() };
}

/** Lấy và xoá cờ nếu khớp `pathname`. */
export function takeStampHandoff(pathname: string): StampHandoff | null {
  const h = pending;
  pending = null;
  if (!h || Date.now() - h.at > TTL_MS) return null;
  const path = h.href.split(/[?#]/)[0];
  return decodeURI(path) === decodeURI(pathname) ? h : null;
}

/** Kích thước tem ở Screen 1 (Figma 376-67819): 210px, mobile ≤600px 170px. */
export function introStampSize(viewportWidth: number): number {
  return viewportWidth <= 600 ? 170 : 210;
}

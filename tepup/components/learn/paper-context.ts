'use client';

import { createContext, useContext } from 'react';

/**
 * Đang ở trong trang học "giấy" (LessonPlayer) hay không.
 *
 * Các component block dùng chung với nơi khác (xem trước của người duyệt,
 * /contributor-guide/block-demo, admin): trong trang học thì dùng class giấy
 * (components/learn/player-paper.css), ngoài đó giữ nguyên giao diện cũ.
 * Chỉ đổi trình bày, không đổi hành vi.
 */
export const PaperPlayerContext = createContext<{ root: HTMLElement | null } | null>(null);

export function usePaperPlayer(): boolean {
  return useContext(PaperPlayerContext) !== null;
}

/** Phần tử gốc `.pl` (có `.reader`): nơi đặt portal để hộp thoại thoát khỏi vùng cuộn có mask. */
export function usePaperRoot(): HTMLElement | null {
  return useContext(PaperPlayerContext)?.root ?? null;
}

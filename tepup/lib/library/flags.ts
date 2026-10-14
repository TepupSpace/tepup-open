/**
 * Cờ bật trình đọc tham chiếu (xem nhanh + bảng bên). Đọc ở server, truyền xuống
 * client qua props. BẬT mặc định từ bản phát hành 14.10.2026; đặt TEPUP_TV_REFERENCES=0
 * trong Vercel (Production) rồi chạy lại workflow deploy để tắt khẩn cấp.
 * Tắt: link /tv/ vẫn hoạt động như link thường tới trang mục (/tv/<slug> → /thu-vien/muc/<slug>).
 */
export function tvReferencesEnabled(): boolean {
  return process.env.TEPUP_TV_REFERENCES !== '0';
}

import { fraunces, beVietnam } from '@/lib/fonts/paper';
import '@/app/staff-paper.css';

/**
 * Đăng nhập, đăng ký người đóng góp, tài khoản bị khoá, đề xuất tính năng: cùng giao diện giấy
 * với /admin và /contributor (`staff`, app/staff-paper.css). `reader` giữ tuỳ chọn sáng/tối,
 * phông và cỡ chữ người dùng đã chọn.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`reader staff ${fraunces.variable} ${beVietnam.variable} min-h-screen`}>{children}</div>
  );
}

import PaperShell from '@/components/paper/PaperShell';
import './guide.css';

/**
 * Hướng dẫn đóng góp (/contributor-guide, /block-demo): khung giấy như các trang học viên
 * (nút "Đóng góp bài" ở header dẫn tới đây). Trang được cache công khai: không đọc
 * cookie/session ở đây. Màu nhấn trong trang: ./guide.css.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <PaperShell>{children}</PaperShell>;
}

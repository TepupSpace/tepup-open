import Link from '@/components/ui/AppLink';
import { fraunces, beVietnam } from '@/lib/fonts/paper';
import './player-paper.css';

/**
 * Màn "chưa có nội dung" của bài học / chương, cùng nền giấy với trang học.
 * Server component, giống nhau với mọi người xem (trang được cache công khai).
 */
export default function PaperEmptyState({
  title,
  message,
  backHref,
  backLabel,
  children,
  before,
}: {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
  /** Dòng phụ dưới thông báo (ví dụ: link công cụ cho staff). */
  children?: React.ReactNode;
  /** Phần tử đặt ngoài khối giữa (ví dụ: nhãn "đang ẩn" cố định). */
  before?: React.ReactNode;
}) {
  return (
    // <main id="main-content">: đích của link "bỏ qua tới nội dung".
    <main id="main-content" className={`reader pl ${fraunces.variable} ${beVietnam.variable}`}>
      {before}
      <div className="pl__empty">
        <h1 className="pl__serif">{title}</h1>
        <p>{message}</p>
        {children}
        <Link href={backHref} className="lbtn">
          {backLabel}
        </Link>
      </div>
    </main>
  );
}

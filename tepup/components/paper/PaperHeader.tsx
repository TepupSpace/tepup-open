import Link from '@/components/ui/AppLink';
import SettingsDialog from '@/components/settings/SettingsDialog';

/**
 * Header của giao diện giấy (Figma 300-472): logo, pill menu ở giữa, nút
 * "Đóng góp bài" và nút Cài đặt (⚙) bên phải. Dùng ở /courses và /story/**.
 *
 * Server component, giống nhau cho mọi người xem: các trang này được Cloudflare
 * cache (xem `publicPages` trong next.config.ts), nên không đọc session ở đây.
 * "Công cụ" chưa có trang nên chỉ hiện mờ kèm chip "Sắp có", không bấm được.
 */
export default function PaperHeader({ current }: { current?: 'courses' | 'library' }) {
  return (
    <header className="paper-hdr" data-paper-header>
      <div className="paper-hdr__row">
        <Link className="paper-hdr__logo" href="/" aria-label="Tépup — về trang chủ">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo cố định, next/image chỉ thêm wrapper thừa */}
          <img src="/paper/logo.webp" alt="Tépup" width={147} height={60} />
        </Link>
        <nav className="paper-hdr__nav" aria-label="Điều hướng chính">
          <Link href="/courses" aria-current={current === 'courses' ? 'page' : undefined}>
            Khoá học
          </Link>
          <Link href="/thu-vien" aria-current={current === 'library' ? 'page' : undefined}>
            Thư viện
          </Link>
          <span className="paper-hdr__soon" aria-disabled="true">
            Công cụ
            <span className="paper-hdr__chip">Sắp có</span>
          </span>
        </nav>
        <div className="paper-hdr__actions">
        <Link className="paper-hdr__cta" href="/contributor-guide">
          <span className="paper-hdr__cta-label">Đóng góp bài</span>
          <span className="paper-hdr__cta-icon" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- icon tĩnh 24px */}
            <img src="/paper/icon-pen-add.svg" alt="" width={24} height={24} />
          </span>
        </Link>
        {/* Cài đặt: hướng dẫn cài Tépup về máy + tuỳ chọn đọc. */}
        <SettingsDialog />
        </div>
      </div>
    </header>
  );
}

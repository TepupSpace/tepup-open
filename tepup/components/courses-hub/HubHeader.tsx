import Link from '@/components/ui/AppLink';

/**
 * Header pill của trang /courses (design demo-course-stories).
 *
 * "Công cụ" chưa có trang nên chỉ hiện mờ kèm nhãn "Sắp có", không bấm được.
 */
export default function HubHeader() {
  return (
    <header className="ch-header">
      <div className="ch-header__inner">
        <Link href="/" aria-label="Tépup — về trang chủ">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo cố định 60px, next/image chỉ thêm wrapper thừa */}
          <img className="ch-logo" src="/courses-hub/logo.webp" alt="Tépup" width={147} height={60} />
        </Link>
        <nav className="ch-nav" aria-label="Điều hướng chính">
          <Link href="/courses" aria-current="page">
            Khoá học
          </Link>
          <Link href="/library">Thư viện</Link>
          <span className="ch-nav__soon" aria-disabled="true">
            Công cụ
            <small>Sắp có</small>
          </span>
        </nav>
      </div>
    </header>
  );
}

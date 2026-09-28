import Link from '@/components/ui/AppLink';

/**
 * Chân trang của landing v2.
 *
 * Figma không vẽ footer, nên phần này dựng lại bằng đúng bộ token của các
 * section trên và giữ nguyên kiến trúc thông tin của MarketingFooter cũ.
 *
 * Cố ý để nền giấy chứ không nền tối: ngay phía trên đã là card CTA #313131,
 * hai khối tối đặt liền nhau sẽ dính vào thành một mảng, mất ranh giới.
 */

const LINKS = [
  { href: '/#gioi-thieu', label: 'Giới thiệu', external: false },
  { href: '/contributor-guide', label: 'Cách đóng góp', external: false },
  { href: '/courses', label: 'Khóa học', external: false },
  { href: '/library', label: 'Thư viện', external: false },
];

export default function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- logo cố định, next/image chỉ thêm wrapper thừa */}
          <img
            className="lp-footer__logo"
            src="/landing/logo.webp"
            alt="Tépup"
            width={108}
            height={44}
          />
          <p className="lp-footer__tagline">Mã nguồn mở · Miễn phí · Ẩn danh</p>
        </div>

        <nav className="lp-footer__nav" aria-label="Liên kết chân trang">
          {LINKS.map((link) =>
            link.href.startsWith('/#') ? (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            )
          )}
        </nav>
      </div>

      <p className="lp-footer__legal">
        © {new Date().getFullYear()} Tépup. Kiến thức công dân thực dụng bằng tiếng Việt.
      </p>
    </footer>
  );
}

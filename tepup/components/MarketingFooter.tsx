import Link from '@/components/ui/AppLink';

export default function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-gray-900">Tepup</p>
            <p className="text-sm text-gray-500 mt-1">
              Mã nguồn mở · Miễn phí · Ẩn danh
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
            aria-label="Liên kết chân trang"
          >
            <a href="/#gioi-thieu" className="text-gray-600 hover:text-gray-900">
              Giới thiệu
            </a>
            <Link
              href="/contributor-guide"
              className="text-gray-600 hover:text-gray-900"
            >
              Cách đóng góp
            </Link>
            <Link href="/courses" className="text-gray-600 hover:text-gray-900">
              Khóa học
            </Link>
            <Link href="/library" className="text-gray-600 hover:text-gray-900">
              Thư viện
            </Link>
          </nav>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          © {new Date().getFullYear()} Tepup. Kiến thức công dân thực dụng bằng
          tiếng Việt.
        </p>
      </div>
    </footer>
  );
}

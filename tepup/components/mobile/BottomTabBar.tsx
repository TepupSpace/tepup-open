'use client';

import Link from '@/components/ui/AppLink';
import { usePathname } from 'next/navigation';
import { BookOpen, Library } from 'lucide-react';
import { useBottomChrome } from '@/lib/hooks/useBottomChrome';

/**
 * Thanh điều hướng dưới đáy, chỉ hiện trên mobile: dạng viên thuốc nổi bo tròn
 * (kiểu Apple Podcasts), tab đang chọn là một viên nhỏ tô nền bên trong.
 *
 * Nó thay cho nav của header ở màn hẹp (header giấy ẩn pill menu dưới md, xem
 * app/paper.css), nên trên điện thoại đây là điều hướng chính.
 *
 * Cố ý không gắn vào trang học: ở đó toàn bộ đáy màn hình dành cho nút Tiếp tục.
 */
const tabs = [
  { href: '/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/thu-vien', label: 'Thư viện', icon: Library },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  // Thanh cao 4rem, cách đáy 0.75rem (+ vùng an toàn, bên dùng tự cộng): nút chat
  // và nút cuộn nổi phía trên nó.
  useBottomChrome('4.75rem');

  return (
    <nav
      className="fixed inset-x-4 z-40 md:hidden bottom-[calc(0.75rem+var(--safe-bottom))]"
      aria-label="Điều hướng dưới cùng"
    >
      <ul className="flex h-16 items-stretch gap-1 rounded-full border border-gray-200 bg-white p-1.5 shadow-lg shadow-gray-900/15">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 rounded-full transition-colors ${
                  isActive ? 'bg-gray-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon
                  className="w-6 h-6"
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

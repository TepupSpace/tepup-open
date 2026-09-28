'use client';

import Link from '@/components/ui/AppLink';
import { usePathname } from 'next/navigation';
import { BookOpen, Library } from 'lucide-react';
import { useBottomChrome } from '@/lib/hooks/useBottomChrome';

/**
 * Thanh điều hướng dưới đáy, chỉ hiện trên mobile.
 *
 * Nó thay cho nav ngang của header ở màn hẹp — trước đây nav bị ẩn sau breakpoint
 * md mà không có gì thay thế, nên người học trên điện thoại mất hẳn điều hướng.
 *
 * Cố ý không gắn vào trang học: ở đó toàn bộ đáy màn hình dành cho nút Tiếp tục.
 */
const tabs = [
  { href: '/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/library', label: 'Thư viện', icon: Library },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  // Khớp với lớp h-14 của từng tab bên dưới.
  useBottomChrome('3.5rem');

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 pb-safe md:hidden"
      aria-label="Điều hướng chính"
    >
      <ul className="flex">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
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

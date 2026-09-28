'use client';

import Link from '@/components/ui/AppLink';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Library } from 'lucide-react';

const navItems = [
  { href: '/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/library', label: 'Thư viện', icon: Library },
];

export default function LearnHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" aria-label="Về trang chủ Tepup">
            <Image
              src="/tepup-logo.png"
              alt="Tepup logo"
              width={23}
              height={32}
              priority
            />
            <span className="text-xl font-bold text-gray-900">Tepup</span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Điều hướng khu học tập"
          >
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Trên mobile, điều hướng nằm ở BottomTabBar — trước đây chỗ này là nút
              hamburger không gắn xử lý sự kiện, bấm vào không có gì xảy ra. */}
        </div>
      </div>
    </header>
  );
}

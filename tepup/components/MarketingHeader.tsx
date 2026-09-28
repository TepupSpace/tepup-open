'use client';

import Link from '@/components/ui/AppLink';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

const anchorItems = [
  { href: '#gioi-thieu', label: 'Giới thiệu' },
  { href: '#cach-hoc', label: 'Cách học' },
  { href: '#ba-tru-cot', label: 'Ba trụ cột' },
  { href: '#dong-gop', label: 'Đóng góp' },
];

export default function MarketingHeader() {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/tepup-logo.png"
              alt="Tepup logo"
              width={23}
              height={32}
              priority
            />
            <span className="text-xl font-bold text-gray-900">Tepup</span>
          </Link>

          {isLanding && (
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Điều hướng trang giới thiệu"
            >
              {anchorItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/courses"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Bắt đầu học
              <ArrowRight className="w-4 h-4" />
            </Link>
            {isLanding && (
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
                aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            )}
          </div>
        </div>

        {isLanding && mobileOpen && (
          <nav
            className="md:hidden pb-4 flex flex-col gap-1"
            aria-label="Điều hướng di động"
          >
            {anchorItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/courses"
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors sm:hidden"
            >
              Bắt đầu học
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

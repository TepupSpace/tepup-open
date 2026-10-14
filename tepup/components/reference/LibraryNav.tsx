'use client';

import { usePathname } from 'next/navigation';
import Link from '@/components/ui/AppLink';

const ITEMS = [
  { href: '/thu-vien', label: 'Mục từ' },
  { href: '/thu-vien/nguon', label: 'Nguồn' },
  { href: '/thu-vien/viet-tat', label: 'Viết tắt' },
  { href: '/thu-vien/tu-cong-cu', label: 'Tủ công cụ' },
  { href: '/thu-vien/ban-do', label: 'Bản đồ' },
  { href: '/thu-vien/da-luu', label: 'Đã lưu' },
];

/** Thanh chuyển giữa các phần của thư viện (docs/design-reference-library.md §7.4). */
export default function LibraryNav() {
  const current = usePathname();
  return (
    <nav aria-label="Các phần của thư viện" className="mb-6 overflow-x-auto">
      <ul className="flex gap-2 whitespace-nowrap">
        {ITEMS.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={it.href === current ? 'page' : undefined}
              className={`inline-flex px-3 py-1.5 rounded-full text-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 ${
                it.href === current
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

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

/**
 * Thanh chuyển giữa các phần của thư viện (docs/design-reference-library.md §7.4).
 * Thanh pill trắng kiểu giấy (app/(library)/library.css), cuộn ngang trên màn hẹp.
 */
export default function LibraryNav() {
  const current = usePathname();
  return (
    <nav aria-label="Các phần của thư viện" className="lib-nav">
      <ul>
        {ITEMS.map((it) => (
          <li key={it.href}>
            <Link href={it.href} aria-current={it.href === current ? 'page' : undefined}>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

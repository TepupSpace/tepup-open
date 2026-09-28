'use client';

import { useState } from 'react';
import Link from '@/components/ui/AppLink';
import { IconArrow } from './icons';

/**
 * Header pill nổi của landing v2 (Figma 140:5491 › Frame 1597880615).
 *
 * Chỉ dùng cho trang `/`. Các trang marketing khác vẫn dùng MarketingHeader —
 * header này nổi đè lên hero nền tối màu nên đặt ở trang nền trắng sẽ hụt nền.
 */

const NAV = [
  { href: '#gioi-thieu', label: 'Giới thiệu' },
  { href: '#cach-hoc', label: 'Cách học' },
  { href: '#ba-tru-cot', label: 'Ba trụ cột' },
  { href: '#dong-gop', label: 'Đóng góp' },
];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className={`lp-hdr${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="lp-burger"
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <Link href="/" aria-label="Tépup — về trang chủ">
        {/* eslint-disable-next-line @next/next/no-img-element -- logo cố định 60px, next/image chỉ thêm wrapper thừa */}
        <img className="lp-hdr__logo" src="/landing/logo.webp" alt="Tépup" width={147} height={60} />
      </Link>

      <nav className="lp-hdr__nav" aria-label="Điều hướng trang giới thiệu">
        {NAV.map((item, i) => (
          <a key={item.href} href={item.href} className={i === 0 ? 'is-active' : undefined}>
            {item.label}
          </a>
        ))}
      </nav>

      <Link href="/courses" className="lp-cta">
        Bắt đầu học
        <IconArrow />
      </Link>

      {/* dropdown mobile, CSS chỉ hiện khi .lp-hdr.is-open */}
      <div className="lp-mmenu">
        {NAV.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            className={i === 0 ? 'is-active' : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <Link href="/courses" className="lp-cta" onClick={() => setOpen(false)}>
          Bắt đầu học
          <IconArrow />
        </Link>
      </div>
    </header>
  );
}

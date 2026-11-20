'use client';

import { openSettings } from '@/lib/pwa/platform';

/** Nút trên /du-lieu: mở thẳng mục "Quyền riêng tư" của hộp thoại Cài đặt (⚙ ở header). */
export default function OpenPrivacySettings({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => openSettings('privacy')}>
      Mở Cài đặt › Quyền riêng tư
    </button>
  );
}

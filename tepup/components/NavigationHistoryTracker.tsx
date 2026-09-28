'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { recordPath } from '@/lib/navigation-history';

/**
 * Ghi lại đường đi trong app cho `lib/navigation-history`. Render `null` — chỉ có
 * mặt để bám vào vòng đời route.
 */
export default function NavigationHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordPath(pathname);
  }, [pathname]);

  return null;
}

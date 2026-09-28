'use client';

/**
 * `next/link` có báo cáo trạng thái điều hướng lên thanh progress toàn cục.
 *
 * `useLinkStatus()` chỉ chạy được bên trong cây con của <Link>, nên phải nhét một
 * component con vào. `Beacon` render `null` — không thêm node DOM nào vào trong
 * thẻ <a>, nên layout flex/grid của chỗ gọi không bị ảnh hưởng.
 */

import NextLink, { useLinkStatus } from 'next/link';
import { useEffect, type ComponentProps } from 'react';
import { useNavigationProgress } from '@/lib/contexts/NavigationProgressContext';

function Beacon() {
  const { pending } = useLinkStatus();
  const { setBusy } = useNavigationProgress();

  useEffect(() => {
    if (!pending) return;
    return setBusy();
  }, [pending, setBusy]);

  return null;
}

export default function AppLink({ children, ...props }: ComponentProps<typeof NextLink>) {
  return (
    <NextLink {...props}>
      {children}
      <Beacon />
    </NextLink>
  );
}

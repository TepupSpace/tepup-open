'use client';

import { forwardRef, useEffect, type MouseEvent } from 'react';
import Link from 'next/link';
import { useNavigate } from '@/lib/hooks/useNavigate';
import Spinner from '@/components/ui/Spinner';

interface LessonStartCardProps {
  /** Tên đầy đủ của bài đang chọn. */
  title: string;
  number: number;
  href: string;
  state: 'done' | 'go' | 'ahead' | 'idle';
}

const KICKER: Record<LessonStartCardProps['state'], string> = {
  done: 'Đã hoàn thành',
  go: 'Học tiếp',
  ahead: 'Nhảy cóc',
  idle: 'Bài học',
};

/**
 * Thẻ dính ở đáy lộ trình khoá học (thay popup cũ): tên đầy đủ của bài đang chọn +
 * nút vào học. Mặc định là bài đang học; bấm một nút bài trên lộ trình thì thẻ đổi
 * theo. Không phải hộp thoại: luôn hiện, không chặn trang.
 */
const LessonStartCard = forwardRef<HTMLAnchorElement, LessonStartCardProps>(function LessonStartCard(
  { title, number, href, state },
  ref,
) {
  const { navigate, isPending, router } = useNavigate();

  // Kéo sẵn trang bài đang chọn: lúc bấm gần như đã có hàng.
  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  // Link thật để mở tab mới được; click thường đi qua navigate() để có "Đang mở…".
  const handleStart = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (isPending) return;
    navigate(href);
  };

  const skip = state === 'ahead';
  const label = state === 'done' ? 'Học lại' : skip ? 'Học nhảy cóc' : 'Bắt đầu học';

  return (
    <div className="cp-start">
      <div className="cp-start__card">
        <p className="cp-start__kicker">
          Bài {number} · {KICKER[state]}
        </p>
        <p id="cp-start-title" className="cp-start__title paper-serif">
          {title}
        </p>
        <Link
          ref={ref}
          href={href}
          prefetch={false}
          onClick={handleStart}
          aria-describedby="cp-start-title"
          aria-disabled={isPending || undefined}
          aria-busy={isPending}
          className={`paper-btn cp-start__go${skip ? ' cp-start__go--skip' : ''}`}
        >
          {isPending ? (
            <>
              <Spinner size="sm" tone="onDark" />
              Đang mở…
            </>
          ) : (
            label
          )}
        </Link>
      </div>
    </div>
  );
});

export default LessonStartCard;

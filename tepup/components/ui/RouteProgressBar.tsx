'use client';

/**
 * Thanh mảnh ở đỉnh trang, chạy trong lúc đang chuyển trang.
 *
 * Không biết trước bao lâu nên bò dần tới 90% rồi dừng; khi điều hướng xong thì
 * búng lên 100% và mờ đi. Chờ 120ms mới hiện, để những cú chuyển trang đã có
 * prefetch (gần như tức thì) không nháy một cái vô nghĩa.
 */

import { useEffect, useState } from 'react';
import { useNavigationProgress } from '@/lib/contexts/NavigationProgressContext';

const SHOW_DELAY_MS = 120;
const FADE_MS = 220;

type Phase = 'hidden' | 'entering' | 'running' | 'finishing';

export default function RouteProgressBar() {
  const { busy } = useNavigationProgress();
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    if (busy) {
      // Chưa đổi state ngay: nếu điều hướng xong trong vòng 120ms thì thanh
      // không bao giờ xuất hiện, và đó là điều mong muốn.
      const showTimer = setTimeout(() => setPhase('entering'), SHOW_DELAY_MS);
      return () => clearTimeout(showTimer);
    }

    // Điều hướng vừa xong. Chuyển sang pha kết thúc ở frame kế tiếp — nếu nó
    // xong trước cả khi thanh kịp hiện thì `phase` vẫn là 'hidden' và chẳng có
    // gì phải kết thúc.
    const frame = requestAnimationFrame(() =>
      setPhase((prev) => (prev === 'hidden' ? 'hidden' : 'finishing'))
    );
    const doneTimer = setTimeout(() => setPhase('hidden'), FADE_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(doneTimer);
    };
  }, [busy]);

  // Đặt bề rộng đích ở frame sau, nếu không trình duyệt gộp hai lần đặt width
  // làm một và transition không chạy.
  useEffect(() => {
    if (phase !== 'entering') return;
    const frame = requestAnimationFrame(() => setPhase('running'));
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  if (phase === 'hidden') return null;

  const width = phase === 'entering' ? 8 : phase === 'running' ? 90 : 100;
  const finishing = phase === 'finishing';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] h-[3px] pointer-events-none"
      role="progressbar"
      aria-label="Đang chuyển trang"
      aria-busy={busy}
    >
      <div
        className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]"
        style={{
          width: `${width}%`,
          opacity: finishing ? 0 : 1,
          transition: finishing
            ? `width 120ms ease-out, opacity ${FADE_MS}ms ease-out 100ms`
            : 'width 8s cubic-bezier(0.1, 0.9, 0.2, 1)',
        }}
      />
    </div>
  );
}

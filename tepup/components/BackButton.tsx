'use client';

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/lib/hooks/useNavigate';
import { getPreviousPath, isPlayerPath } from '@/lib/navigation-history';
import Spinner from '@/components/ui/Spinner';

interface BackButtonProps {
  fallbackUrl?: string;
}

export default function BackButton({ fallbackUrl = '/' }: BackButtonProps) {
  const { navigate, goBack, isPending } = useNavigate();

  const handleBack = () => {
    if (isPending) return;

    const prev = getPreviousPath();

    // Chưa điều hướng lần nào trong app (mở thẳng link, F5) thì lùi sẽ văng ra
    // khỏi Tepup. Còn nếu phía sau là trang player — ca deep-link vào bài học rồi
    // `replace` ra đây — thì lùi cũng không về đâu có ích. Cả hai: đi thẳng.
    if (prev === null || isPlayerPath(prev)) {
      navigate(fallbackUrl);
      return;
    }

    goBack();
  };

  return (
    <button
      onClick={handleBack}
      disabled={isPending}
      aria-busy={isPending}
      className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors disabled:opacity-70 disabled:cursor-wait"
    >
      {isPending ? <Spinner size="sm" tone="muted" /> : <ArrowLeft className="w-4 h-4" />}
      <span>Quay lại</span>
    </button>
  );
}

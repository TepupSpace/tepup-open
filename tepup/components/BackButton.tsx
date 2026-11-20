'use client';

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/lib/hooks/useNavigate';
import { getPreviousPath, isPlayerPath } from '@/lib/navigation-history';
import Spinner from '@/components/ui/Spinner';

interface BackButtonProps {
  fallbackUrl?: string;
  /** Mặc định "Quay lại". Nên nói rõ đích khi biết (vd. "Các câu chuyện"). */
  label?: string;
  /** `paper`: nút pill trắng của giao diện giấy (app/paper.css, `.paper-back`). */
  variant?: 'default' | 'paper';
}

const CLASSES = {
  default:
    'inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors disabled:opacity-70 disabled:cursor-wait',
  paper: 'paper-back',
};

export default function BackButton({ fallbackUrl = '/', label = 'Quay lại', variant = 'default' }: BackButtonProps) {
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
      type="button"
      onClick={handleBack}
      disabled={isPending}
      aria-busy={isPending}
      className={CLASSES[variant]}
      // Trang giấy: nút mờ đi cùng header khi chuyển cảnh (ChapterShelf).
      data-paper-chrome={variant === 'paper' ? '' : undefined}
    >
      {isPending ? <Spinner size="sm" tone="muted" /> : <ArrowLeft className="w-4 h-4" aria-hidden="true" />}
      <span>{label}</span>
    </button>
  );
}

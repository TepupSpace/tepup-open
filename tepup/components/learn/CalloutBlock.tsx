'use client';

import { Lightbulb, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { usePaperPlayer } from './paper-context';
import { IconComplete, IconExplain, IconInfo, IconSuccess, IconTick, IconWarning } from './PaperIcons';

export type PaperCalloutVariant = 'info' | 'warning' | 'success' | 'explain' | 'complete';

/** Dòng danh sách "Bạn đã học được gì": bắt đầu bằng ✓, •, - hoặc *. */
const TICK_LINE = /^\s*(?:✓|✔|•|-|\*)\s+/;

/**
 * Callout giấy (demo `.lco`): info / warning / success / explain / complete.
 * Dùng cho block callout và cho lời giải sau khi kiểm tra câu hỏi.
 */
export function PaperCallout({
  variant,
  title,
  text,
  children,
  className = '',
  calloutRef,
}: {
  variant: PaperCalloutVariant;
  title?: string;
  text?: string;
  children?: React.ReactNode;
  className?: string;
  calloutRef?: React.Ref<HTMLDivElement>;
}) {
  const Icon =
    variant === 'warning'
      ? IconWarning
      : variant === 'success'
      ? IconSuccess
      : variant === 'complete'
      ? IconComplete
      : variant === 'explain'
      ? IconExplain
      : IconInfo;
  const lines = variant === 'complete' && text ? text.split('\n').filter((l) => l.trim()) : [];
  return (
    // Cảnh báo cũng là "note": "alert" cắt ngang trình đọc màn hình mỗi khi block hiện ra.
    <div ref={calloutRef} className={`lco lco--${variant} ${className}`} role="note">
      <span className="lco__icon">
        <Icon size={variant === 'info' ? 25 : 28} />
      </span>
      <div className="lco__body">
        {title && <p className="lco__title">{renderInlineMarkdown(title)}</p>}
        {variant === 'complete' ? (
          <ul className="lco__ticks">
            {lines.map((l, i) => (
              <li key={i}>
                <IconTick size={20} />
                <span>{renderInlineMarkdown(l.replace(TICK_LINE, ''))}</span>
              </li>
            ))}
          </ul>
        ) : (
          text && <p>{renderInlineMarkdown(text)}</p>
        )}
        {children}
      </div>
    </div>
  );
}

/** "success" nhiều dòng mà mỗi dòng là một ý (✓ …) → danh sách tick "Bạn đã học được gì". */
export function paperCalloutVariant(variant: string | undefined, text: string): PaperCalloutVariant {
  if (variant === 'warning') return 'warning';
  if (variant === 'success') {
    const lines = text.split('\n').filter((l) => l.trim());
    return lines.length > 1 && lines.every((l) => TICK_LINE.test(l)) ? 'complete' : 'success';
  }
  return 'info';
}

export function CalloutBlockComponent({ block }: { block: { type: 'callout'; icon?: string; title?: string; text: string; variant?: 'info' | 'warning' | 'success' } }) {
  const paper = usePaperPlayer();
  if (paper) {
    return <PaperCallout variant={paperCalloutVariant(block.variant, block.text)} title={block.title} text={block.text} />;
  }

  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      text: 'text-blue-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      text: 'text-green-700',
    },
  };

  const variant = variants[block.variant || 'info'];

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    lightbulb: Lightbulb,
    message: MessageCircle,
    warning: AlertCircle,
    check: CheckCircle,
  };

  const IconComponent = iconMap[block.icon || 'lightbulb'] || Lightbulb;

  // Cảnh báo cũng là "note": "alert" cắt ngang trình đọc màn hình mỗi khi block hiện ra.
  return (
    <div className={`${variant.bg} ${variant.border} border-2 rounded-2xl p-5 mb-6`} role="note">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5`}>
          <IconComponent className={`w-6 h-6 ${variant.icon}`} aria-hidden="true" />
        </div>
        <div>
          {/* Chữ đậm, không phải tiêu đề: ghi chú là phần phụ, không phải một mục của bài
              (làm tiêu đề thì bài nhảy từ h1 sang h3 khi ghi chú đứng đầu). */}
          {block.title && (
            <p className={`font-semibold ${variant.title} mb-1`}>{renderInlineMarkdown(block.title)}</p>
          )}
          <p className={`${variant.text} leading-relaxed whitespace-pre-line`}>{renderInlineMarkdown(block.text)}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Lightbulb, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';

export function CalloutBlockComponent({ block }: { block: { type: 'callout'; icon?: string; title?: string; text: string; variant?: 'info' | 'warning' | 'success' } }) {
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

  return (
    <div className={`${variant.bg} ${variant.border} border-2 rounded-2xl p-5 mb-6`} role={block.variant === 'warning' ? 'alert' : 'note'}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5`}>
          <IconComponent className={`w-6 h-6 ${variant.icon}`} aria-hidden="true" />
        </div>
        <div>
          {block.title && (
            <h3 className={`font-semibold ${variant.title} mb-1`}>{renderInlineMarkdown(block.title)}</h3>
          )}
          <p className={`${variant.text} leading-relaxed whitespace-pre-line`}>{renderInlineMarkdown(block.text)}</p>
        </div>
      </div>
    </div>
  );
}

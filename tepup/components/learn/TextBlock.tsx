'use client';

import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';

export function TextBlockComponent({ block }: { block: { type: 'text'; title?: string; paragraphs: string[] } }) {
  return (
    <div className="mb-6">
      {block.title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{renderInlineMarkdown(block.title)}</h2>
      )}
      <div className="space-y-4">
        {block.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
            {renderInlineMarkdown(paragraph)}
          </p>
        ))}
      </div>
    </div>
  );
}

'use client';

import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { usePaperPlayer } from './paper-context';

export function TextBlockComponent({ block }: { block: { type: 'text'; title?: string; paragraphs: string[] } }) {
  const paper = usePaperPlayer();
  if (paper) {
    // Trang học giấy: tiêu đề Fraunces nghiêng 36/28px, đoạn 16/28px (demo `.lt`).
    return (
      <div className="lt">
        {block.title && <h2 className="lt__title pl__serif">{renderInlineMarkdown(block.title)}</h2>}
        <div className="lt__paras">
          {block.paragraphs.map((paragraph, index) => (
            <p key={index} className="lt__p">
              {renderInlineMarkdown(paragraph)}
            </p>
          ))}
        </div>
      </div>
    );
  }
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

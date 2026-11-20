'use client';
import React, { useState } from 'react';
import { Square, SquareCheck } from 'lucide-react';
import type { ContentBlock, ListItem, CheckListItem } from '@/lib/types/content';
import { safeHtmlProps } from '@/lib/security/sanitize-html';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import { BlockedMedia } from './BlockedMedia';
import { usePaperPlayer } from './paper-context';

/** Renders the native rich-text block types produced by the Notion-style editor. */

const NATIVE_TYPES = new Set([
  'heading', 'quote', 'code', 'bullet-list', 'numbered-list',
  'check-list', 'toggle', 'table', 'video', 'audio', 'file',
]);

export function isNativeBlock(type: string): boolean {
  return NATIVE_TYPES.has(type);
}

/** Rich text của tác giả — luôn qua bộ lọc HTML (xem lib/security/sanitize-html.ts). */
function html(s: string) {
  return safeHtmlProps(s);
}

function renderListItems(items: ListItem[], ordered: boolean, nested = false, paper = false): React.ReactNode {
  const Tag = ordered ? 'ol' : 'ul';
  const marker = ordered ? 'list-decimal' : 'list-disc';
  // Only the outermost list carries block rhythm; nested ones sit inside their parent item.
  return (
    <Tag className={paper ? `lnative-list ${marker}` : `${marker} pl-6 space-y-2${nested ? '' : ' mb-6'}`}>
      {items.map((it, i) => (
        <li key={i} className={paper ? undefined : 'text-gray-700 leading-relaxed text-lg'}>
          <span {...html(it.html)} />
          {it.children && it.children.length > 0 && renderListItems(it.children, ordered, true, paper)}
        </li>
      ))}
    </Tag>
  );
}

function renderCheckItems(items: CheckListItem[], nested = false, paper = false): React.ReactNode {
  return (
    <ul className={paper ? 'lnative-list lnative-checks' : `space-y-2${nested ? '' : ' mb-6'}`}>
      {items.map((it, i) => (
        <li key={i} className={paper ? 'flex items-start gap-2' : 'flex items-start gap-2 text-gray-700 leading-relaxed text-lg'}>
          {/* Chỉ để xem: biểu tượng thay cho checkbox (không focus được), trạng thái đọc bằng chữ. */}
          {it.checked ? (
            <SquareCheck className={`mt-1.5 w-4 h-4 flex-shrink-0 ${paper ? 'is-on' : 'text-blue-600'}`} aria-hidden="true" />
          ) : (
            <Square className={`mt-1.5 w-4 h-4 flex-shrink-0 ${paper ? '' : 'text-gray-500'}`} aria-hidden="true" />
          )}
          <div className="flex-1">
            <span {...html(it.html)} />
            <span className="sr-only"> {it.checked ? '(đã xong)' : '(chưa xong)'}</span>
            {it.children && it.children.length > 0 && (
              <div className="pl-4">{renderCheckItems(it.children, true, paper)}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Bản ghi lời của video/âm thanh, đóng sẵn dưới trình phát. */
function Transcript({ text, paper }: { text?: string; paper?: boolean }) {
  if (!text?.trim()) return null;
  return (
    <details className={paper ? 'ltranscript' : 'mt-2 mb-6 rounded-lg border border-gray-200 px-3 py-2 text-sm'}>
      <summary className="cursor-pointer font-medium text-gray-700">Bản ghi lời</summary>
      <div className="mt-2 whitespace-pre-line leading-relaxed text-gray-700">{text}</div>
    </details>
  );
}

/** Phụ đề WebVTT, chỉ khi URL nằm trong allowlist media (như `url`). */
function captionsTrack(url: string | undefined): React.ReactNode {
  if (!isAllowedMediaUrl(url)) return null;
  return <track kind="captions" src={url} srcLang="vi" label="Tiếng Việt" default />;
}

/** Khung giữ chỗ cho media: hiện skeleton tới khi trình duyệt biết được kích thước. */
function MediaFrame({
  ratio,
  onSettled,
  render,
  paper,
}: {
  paper?: boolean;
  ratio?: string;
  onSettled?: () => void;
  render: (settle: () => void, ready: boolean) => React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const settle = () => {
    setReady(true);
    onSettled?.();
  };
  return (
    <div className={paper ? 'relative' : 'relative mb-6'}>
      {!ready && (
        <div
          className={`w-full animate-pulse ${paper ? 'lmedia__ph' : 'rounded-lg bg-gray-100'}${ratio ? '' : ' h-14'}`}
          style={ratio ? { aspectRatio: ratio } : undefined}
          aria-hidden="true"
        />
      )}
      {render(settle, ready)}
    </div>
  );
}

export default function NativeBlock({
  block,
  onSettled,
}: {
  block: ContentBlock;
  /** Gọi khi một media trong block đã sẵn sàng — chiều cao khối lúc này mới thật. */
  onSettled?: () => void;
}) {
  const paper = usePaperPlayer();
  switch (block.type) {
    case 'heading': {
      // Authors use level 2 and level 3 interchangeably as the top section heading
      // (no lesson mixes both), so both render at 24px like `TextBlock`'s title — and both
      // are <h2>: the player's <h1> is the lesson title, so an <h3> here skipped a level.
      const cls = block.level === 1 ? 'text-3xl' : 'text-2xl';
      // Trang học giấy: tiêu đề Fraunces nghiêng như demo `.lt__title` (cấp 3 nhỏ hơn một bậc).
      const paperCls = `lnative-h pl__serif${block.level === 3 ? ' lnative-h--sm' : ''}`;
      // eslint-disable-next-line jsx-a11y/heading-has-content -- nội dung là HTML tác giả viết, chèn qua html()
      return <h2 className={paper ? paperCls : `${cls} font-bold text-gray-900 mt-8 mb-4`} {...html(block.html)} />;
    }
    case 'quote':
      return (
        <blockquote className={paper ? 'lnative-quote' : 'border-l-4 border-gray-300 pl-4 italic text-gray-600 text-lg leading-relaxed mb-6'} {...html(block.html)} />
      );
    case 'code':
      return (
        <pre className={paper ? 'lnative-code' : 'bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm mb-6'}>
          <code>{block.code}</code>
        </pre>
      );
    case 'bullet-list':
      return renderListItems(block.items, false, false, paper);
    case 'numbered-list':
      return renderListItems(block.items, true, false, paper);
    case 'check-list':
      return renderCheckItems(block.items, false, paper);
    case 'toggle':
      return (
        <details className={paper ? 'lnative-toggle' : 'rounded-xl border border-gray-200 p-3 mb-6'}>
          <summary className={paper ? undefined : 'cursor-pointer font-medium text-gray-800'} {...html(block.html)} />
          <div className={paper ? undefined : 'mt-2 space-y-3'}>
            {block.children.map((child, i) => (
              <NativeBlock key={i} block={child} onSettled={onSettled} />
            ))}
          </div>
        </details>
      );
    case 'table': {
      const hasHead = Boolean(block.headerRow) && block.rows.length > 0;
      const bodyRows = hasHead ? block.rows.slice(1) : block.rows;
      return (
        <div className={paper ? 'lnative-table' : 'overflow-x-auto mb-6'}>
          <table className={paper ? undefined : 'min-w-full border border-gray-200 text-sm'}>
            {hasHead && (
              <thead>
                <tr className={paper ? undefined : 'bg-gray-50'}>
                  {block.rows[0].map((cell, ci) => (
                    <th
                      key={ci}
                      scope="col"
                      className={paper ? undefined : 'border border-gray-200 px-3 py-2 text-left font-medium text-gray-700'}
                      {...html(cell)}
                    />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={paper ? undefined : 'border border-gray-200 px-3 py-2 text-gray-700'} {...html(cell)} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'video':
      if (!isAllowedMediaUrl(block.url)) {
        return <BlockedMedia kind="video" label={block.caption} onSettled={onSettled} />;
      }
      return (
        <figure className={paper ? 'lmedia' : undefined}>
          <MediaFrame
            paper={paper}
            ratio="16 / 9"
            onSettled={onSettled}
            render={(settle, ready) => (
              // Phụ đề là tuỳ chọn: bài cũ chưa có, khi đó bản ghi lời (nếu có) nằm ngay dưới.
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={block.url}
                controls
                // Tệp .vtt khác origin chỉ tải được ở chế độ CORS.
                crossOrigin={isAllowedMediaUrl(block.captionsUrl) ? 'anonymous' : undefined}
                className={`rounded-lg max-w-full${ready ? '' : ' absolute inset-0 opacity-0'}`}
                onLoadedMetadata={settle}
                onError={settle}
              >
                {captionsTrack(block.captionsUrl)}
              </video>
            )}
          />
          {block.caption && <figcaption className={paper ? undefined : 'text-sm text-gray-500 mt-1'}>{block.caption}</figcaption>}
          <Transcript text={block.transcript} paper={paper} />
        </figure>
      );
    case 'audio':
      if (!isAllowedMediaUrl(block.url)) {
        return <BlockedMedia kind="audio" label={block.caption} onSettled={onSettled} />;
      }
      return (
        <figure className={paper ? 'lmedia' : undefined}>
          <MediaFrame
            paper={paper}
            onSettled={onSettled}
            render={(settle, ready) => (
              // Phụ đề là tuỳ chọn: bài cũ chưa có, khi đó bản ghi lời (nếu có) nằm ngay dưới.
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <audio
                src={block.url}
                controls
                crossOrigin={isAllowedMediaUrl(block.captionsUrl) ? 'anonymous' : undefined}
                className={`w-full${ready ? '' : ' absolute inset-0 opacity-0'}`}
                onLoadedMetadata={settle}
                onError={settle}
              >
                {captionsTrack(block.captionsUrl)}
              </audio>
            )}
          />
          {block.caption && <figcaption className={paper ? undefined : 'text-sm text-gray-500 mt-1'}>{block.caption}</figcaption>}
          <Transcript text={block.transcript} paper={paper} />
        </figure>
      );
    case 'file':
      if (!isAllowedMediaUrl(block.url)) {
        return <BlockedMedia kind="file" label={block.name || block.caption} />;
      }
      return (
        <a href={block.url} target="_blank" rel="noopener noreferrer" className={paper ? 'lfile' : 'inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gray-50 border border-gray-200 rounded-xl text-blue-600 hover:bg-gray-100 transition-colors'}>
          {block.name || block.caption || 'Tải tệp'}
          <span className="sr-only"> (mở trong thẻ mới)</span>
        </a>
      );
    default:
      return null;
  }
}

'use client';
import React, { useState } from 'react';
import { Square, SquareCheck } from 'lucide-react';
import type { ContentBlock, ListItem, CheckListItem } from '@/lib/types/content';
import { safeHtmlProps } from '@/lib/security/sanitize-html';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import { BlockedMedia } from './BlockedMedia';

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

function renderListItems(items: ListItem[], ordered: boolean, nested = false): React.ReactNode {
  const Tag = ordered ? 'ol' : 'ul';
  const marker = ordered ? 'list-decimal' : 'list-disc';
  // Only the outermost list carries block rhythm; nested ones sit inside their parent item.
  return (
    <Tag className={`${marker} pl-6 space-y-2${nested ? '' : ' mb-6'}`}>
      {items.map((it, i) => (
        <li key={i} className="text-gray-700 leading-relaxed text-lg">
          <span {...html(it.html)} />
          {it.children && it.children.length > 0 && renderListItems(it.children, ordered, true)}
        </li>
      ))}
    </Tag>
  );
}

function renderCheckItems(items: CheckListItem[], nested = false): React.ReactNode {
  return (
    <ul className={`space-y-2${nested ? '' : ' mb-6'}`}>
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-gray-700 leading-relaxed text-lg">
          {/* Chỉ để xem: biểu tượng thay cho checkbox (không focus được), trạng thái đọc bằng chữ. */}
          {it.checked ? (
            <SquareCheck className="mt-1.5 w-4 h-4 flex-shrink-0 text-blue-600" aria-hidden="true" />
          ) : (
            <Square className="mt-1.5 w-4 h-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
          )}
          <div className="flex-1">
            <span {...html(it.html)} />
            <span className="sr-only"> {it.checked ? '(đã xong)' : '(chưa xong)'}</span>
            {it.children && it.children.length > 0 && (
              <div className="pl-4">{renderCheckItems(it.children, true)}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Bản ghi lời của video/âm thanh, đóng sẵn dưới trình phát. */
function Transcript({ text }: { text?: string }) {
  if (!text?.trim()) return null;
  return (
    <details className="mt-2 mb-6 rounded-lg border border-gray-200 px-3 py-2 text-sm">
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
}: {
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
    <div className="relative mb-6">
      {!ready && (
        <div
          className={`w-full rounded-lg bg-gray-100 animate-pulse${ratio ? '' : ' h-14'}`}
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
  switch (block.type) {
    case 'heading': {
      // Authors use level 2 and level 3 interchangeably as the top section heading
      // (no lesson mixes both), so both render at 24px like `TextBlock`'s title — and both
      // are <h2>: the player's <h1> is the lesson title, so an <h3> here skipped a level.
      const cls = block.level === 1 ? 'text-3xl' : 'text-2xl';
      // eslint-disable-next-line jsx-a11y/heading-has-content -- nội dung là HTML tác giả viết, chèn qua html()
      return <h2 className={`${cls} font-bold text-gray-900 mt-8 mb-4`} {...html(block.html)} />;
    }
    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 text-lg leading-relaxed mb-6" {...html(block.html)} />
      );
    case 'code':
      return (
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm mb-6">
          <code>{block.code}</code>
        </pre>
      );
    case 'bullet-list':
      return renderListItems(block.items, false);
    case 'numbered-list':
      return renderListItems(block.items, true);
    case 'check-list':
      return renderCheckItems(block.items);
    case 'toggle':
      return (
        <details className="rounded-xl border border-gray-200 p-3 mb-6">
          <summary className="cursor-pointer font-medium text-gray-800" {...html(block.html)} />
          <div className="mt-2 space-y-3">
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
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border border-gray-200 text-sm">
            {hasHead && (
              <thead>
                <tr className="bg-gray-50">
                  {block.rows[0].map((cell, ci) => (
                    <th
                      key={ci}
                      scope="col"
                      className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700"
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
                    <td key={ci} className="border border-gray-200 px-3 py-2 text-gray-700" {...html(cell)} />
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
        <figure>
          <MediaFrame
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
          {block.caption && <figcaption className="text-sm text-gray-500 mt-1">{block.caption}</figcaption>}
          <Transcript text={block.transcript} />
        </figure>
      );
    case 'audio':
      if (!isAllowedMediaUrl(block.url)) {
        return <BlockedMedia kind="audio" label={block.caption} onSettled={onSettled} />;
      }
      return (
        <figure>
          <MediaFrame
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
          {block.caption && <figcaption className="text-sm text-gray-500 mt-1">{block.caption}</figcaption>}
          <Transcript text={block.transcript} />
        </figure>
      );
    case 'file':
      if (!isAllowedMediaUrl(block.url)) {
        return <BlockedMedia kind="file" label={block.name || block.caption} />;
      }
      return (
        <a href={block.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gray-50 border border-gray-200 rounded-xl text-blue-600 hover:bg-gray-100 transition-colors">
          {block.name || block.caption || 'Tải tệp'}
          <span className="sr-only"> (mở trong thẻ mới)</span>
        </a>
      );
    default:
      return null;
  }
}

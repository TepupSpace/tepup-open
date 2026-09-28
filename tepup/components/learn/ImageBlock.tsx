'use client';

import { useEffect, useRef, useState } from 'react';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import { BlockedMedia } from './BlockedMedia';

type ImageBlockProps = {
  block: { type: 'image'; src: string; alt: string; caption?: string };
  /** Gọi khi ảnh đã tải xong (hoặc lỗi) — lúc này chiều cao khối mới là thật. */
  onSettled?: () => void;
};

export function ImageBlockComponent({ block, onSettled }: ImageBlockProps) {
  // Ảnh ngoài allowlist là tracking pixel tiềm năng: không bao giờ để trình duyệt tải.
  if (!isAllowedMediaUrl(block.src)) {
    return <BlockedMedia kind="image" label={block.alt} onSettled={onSettled} />;
  }
  return <AllowedImage block={block} onSettled={onSettled} />;
}

function AllowedImage({ block, onSettled }: ImageBlockProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');

  const settle = (next: 'loaded' | 'error') => {
    setState(next);
    onSettled?.();
  };

  // Ảnh đã nằm trong cache (LessonPlayer nạp trước cả bài) có thể phát `load`
  // xong trước khi React gắn handler — lúc đó skeleton sẽ treo mãi.
  useEffect(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    settle(img.naturalWidth > 0 ? 'loaded' : 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <figure className="mb-6">
      <div className="relative">
        {state === 'loading' && (
          // Giữ chỗ theo tỉ lệ 16/9 để khối không bị "sập" rồi giãn ra khi ảnh về.
          <div
            className="w-full rounded-xl bg-gray-100 animate-pulse"
            style={{ aspectRatio: '16 / 9' }}
            aria-hidden="true"
          />
        )}
        {state === 'error' ? (
          <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            Không tải được ảnh{block.alt ? `: ${block.alt}` : ''}
          </div>
        ) : (
          <img
            ref={imgRef}
            src={block.src}
            alt={block.alt}
            className={`rounded-xl w-full ${state === 'loaded' ? '' : 'absolute inset-0 opacity-0'}`}
            onLoad={() => settle('loaded')}
            onError={() => settle('error')}
          />
        )}
      </div>
      {block.caption && (
        <figcaption className="text-sm text-gray-500 mt-2 text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
